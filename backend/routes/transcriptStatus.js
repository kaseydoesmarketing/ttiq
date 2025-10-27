import express from 'express';
import db, { transcriptJobs } from '../utils/db.js';

const router = express.Router();

/**
 * GET /api/transcript/status/:jobId
 * Poll endpoint to check async job status
 */
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing job ID'
      });
    }

    const job = transcriptJobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        status: 'error',
        error: 'Job not found'
      });
    }

    // CASE 1: Still processing
    if (job.status === 'PENDING' || job.status === 'PROCESSING') {
      return res.json({
        status: 'processing',
        jobId: job.job_id,
        videoId: job.video_id,
        message: 'Still transcribing audio…'
      });
    }

    // CASE 2: Done successfully
    if (job.status === 'DONE') {
      // Also cache in transcripts table if not already there
      try {
        const existing = db.prepare('SELECT * FROM transcripts WHERE video_id = ?').get(job.video_id);

        if (!existing) {
          db.prepare(`
            INSERT INTO transcripts (video_id, transcript, source, duration_sec, created_at)
            VALUES (?, ?, ?, ?, ?)
          `).run(job.video_id, job.transcript, job.source, job.duration_sec || null, Date.now());
          console.log(`[${job.video_id}] Cached ASR result from job ${job.job_id}`);
        }
      } catch (error) {
        console.warn(`[${job.video_id}] Failed to cache job result:`, error.message);
      }

      return res.json({
        status: 'done',
        jobId: job.job_id,
        videoId: job.video_id,
        source: job.source || 'asr',
        cached: false,
        transcript: job.transcript,
        durationSec: job.duration_sec
      });
    }

    // CASE 3: Failed
    if (job.status === 'ERROR') {
      return res.json({
        status: 'error',
        jobId: job.job_id,
        error: "We couldn't auto-transcribe this video. Paste your script below."
      });
    }

    // Unknown status
    return res.status(500).json({
      status: 'error',
      error: 'Unknown job status'
    });

  } catch (error) {
    console.error('Transcript status error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to check job status'
    });
  }
});

export default router;
