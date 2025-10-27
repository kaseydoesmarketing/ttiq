import express from 'express';
import crypto from 'crypto';
import db, { transcriptJobs } from '../utils/db.js';
import { getCaptionsViaNodejs } from '../utils/captionsNodejs.js';
import { aggressiveRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  throw new Error('Invalid YouTube URL or video ID');
}

/**
 * POST /api/transcript/start
 * Fast endpoint that either returns captions immediately or creates async job
 */
router.post('/', aggressiveRateLimit, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing required field: url'
      });
    }

    let videoId;
    try {
      videoId = extractVideoId(url);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        error: 'Invalid YouTube URL. Please check the URL and try again.'
      });
    }

    // STEP 1: Check cache first (transcripts table)
    const cached = db.prepare('SELECT * FROM transcripts WHERE video_id = ?').get(videoId);

    if (cached && cached.transcript && cached.transcript.length >= 100) {
      console.log(`[${videoId}] Cache hit (${cached.source})`);
      return res.json({
        status: 'done',
        jobId: null,
        videoId: cached.video_id,
        source: cached.source,
        cached: true,
        transcript: cached.transcript,
        durationSec: cached.duration_sec
      });
    }

    // STEP 2: Try Node.js caption extraction (fast path - replaced Python)
    console.log(`[${videoId}] Cache miss, attempting Node.js captions...`);
    const captionResult = await getCaptionsViaNodejs(videoId);

    if (captionResult.ok && captionResult.transcript && captionResult.transcript.length >= 100) {
      console.log(`[${videoId}] ✓ Captions extracted (${captionResult.transcript.length} chars)`);

      // Cache it
      try {
        db.prepare(`
          INSERT INTO transcripts (video_id, transcript, source, duration_sec, created_at)
          VALUES (?, ?, 'captions', ?, ?)
        `).run(videoId, captionResult.transcript, captionResult.durationSec || null, Date.now());
      } catch (error) {
        console.warn(`[${videoId}] Failed to cache captions:`, error.message);
      }

      return res.json({
        status: 'done',
        jobId: null,
        videoId,
        source: 'captions',
        cached: false,
        transcript: captionResult.transcript,
        durationSec: captionResult.durationSec
      });
    }

    // STEP 3: Captions failed - create async ASR job
    console.log(`[${videoId}] Captions unavailable (${captionResult.error}), creating ASR job...`);

    const enableASR = process.env.ENABLE_ASR_FALLBACK === 'true';

    if (!enableASR) {
      console.log(`[${videoId}] ASR disabled`);
      return res.status(400).json({
        status: 'error',
        error: "We couldn't auto-transcribe this video. Paste your script below."
      });
    }

    const jobId = crypto.randomUUID();

    try {
      transcriptJobs.createPending(jobId, videoId);
      console.log(`[${videoId}] Created ASR job ${jobId}`);

      return res.status(202).json({
        status: 'processing',
        jobId,
        videoId,
        message: 'Transcribing audio… this can take ~2 minutes. You can keep working.'
      });
    } catch (error) {
      console.error(`[${videoId}] Failed to create job:`, error);
      return res.status(500).json({
        status: 'error',
        error: "We couldn't start transcription. Please try again or paste your script manually."
      });
    }

  } catch (error) {
    console.error('Transcript start error:', error);
    return res.status(500).json({
      status: 'error',
      error: "Something went wrong. Please try again or paste your script manually."
    });
  }
});

export default router;
