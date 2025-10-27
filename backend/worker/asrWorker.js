/**
 * TitleIQ ASR Worker
 * Background process that polls for PENDING transcript jobs and processes them
 * using Whisper ASR. Runs independently from the web server.
 */

import { transcriptJobs } from '../utils/db.js';
import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

const POLL_INTERVAL_MS = 5000; // Check for new jobs every 5 seconds
const MAX_AUDIO_DURATION = parseInt(process.env.MAX_AUDIO_DURATION || '3600', 10);
const TMP_AUDIO_DIR = process.env.TMP_AUDIO_DIR || '/tmp/titleiq-audio';
const WHISPER_MODEL = process.env.WHISPER_MODEL || 'base';

console.log('🎙️ TitleIQ ASR Worker starting...');
console.log(`   Poll interval: ${POLL_INTERVAL_MS}ms`);
console.log(`   Max audio duration: ${MAX_AUDIO_DURATION}s`);
console.log(`   Temp directory: ${TMP_AUDIO_DIR}`);
console.log(`   Whisper model: ${WHISPER_MODEL}`);

// Ensure temp directory exists
if (!fs.existsSync(TMP_AUDIO_DIR)) {
  fs.mkdirSync(TMP_AUDIO_DIR, { recursive: true });
  console.log(`✓ Created temp directory: ${TMP_AUDIO_DIR}`);
}

/**
 * Get video duration from YouTube
 */
async function getVideoDuration(videoId) {
  try {
    const info = await ytdl.getInfo(videoId);
    return parseInt(info.videoDetails.lengthSeconds, 10);
  } catch (error) {
    console.warn(`[${videoId}] Could not get duration:`, error.message);
    return null;
  }
}

/**
 * Download audio stream from YouTube
 */
async function downloadAudio(videoId, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const stream = ytdl(videoId, {
        filter: 'audioonly',
        quality: 'lowestaudio'
      });

      const writeStream = fs.createWriteStream(outputPath);

      stream.pipe(writeStream);

      stream.on('error', (error) => {
        reject(new Error(`Audio download failed: ${error.message}`));
      });

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (error) => {
        reject(new Error(`Audio write failed: ${error.message}`));
      });

    } catch (error) {
      reject(new Error(`Audio download setup failed: ${error.message}`));
    }
  });
}

/**
 * Transcribe audio file using Whisper
 */
async function transcribeAudioWithWhisper(audioPath) {
  try {
    const whisperCommand = `whisper "${audioPath}" --model ${WHISPER_MODEL} --output_format txt --output_dir "$(dirname "${audioPath}")"`;

    console.log(`[Whisper] Running: ${whisperCommand}`);

    const { stdout, stderr } = await execPromise(whisperCommand, {
      timeout: 300000, // 5 minutes max
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    // Whisper outputs to <audioPath>.txt
    const txtPath = audioPath.replace(/\.[^.]+$/, '.txt');

    if (!fs.existsSync(txtPath)) {
      throw new Error('Whisper did not produce output file');
    }

    let transcript = fs.readFileSync(txtPath, 'utf-8');

    // Clean up output file
    fs.unlinkSync(txtPath);

    // Clean transcript
    transcript = transcript
      .replace(/\[.*?\]/g, '') // Remove timestamps
      .replace(/\s+/g, ' ')
      .trim();

    if (!transcript || transcript.length < 50) {
      throw new Error('Whisper produced empty or too-short transcript');
    }

    return transcript;

  } catch (error) {
    throw new Error(`Whisper transcription failed: ${error.message}`);
  }
}

/**
 * Clean up temporary file
 */
function cleanupTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Cleanup] Deleted temp file: ${filePath}`);
    }
  } catch (error) {
    console.warn(`[Cleanup] Failed to delete ${filePath}:`, error.message);
  }
}

/**
 * Process a single ASR job
 */
async function processJob(job) {
  const { job_id, video_id } = job;

  console.log(`\n[${video_id}] Processing job ${job_id}...`);

  // Mark as processing
  transcriptJobs.markProcessing(job_id);

  const audioPath = path.join(TMP_AUDIO_DIR, `${video_id}.mp3`);

  try {
    // Check video duration before downloading
    console.log(`[${video_id}] Checking video duration...`);
    const durationSec = await getVideoDuration(video_id);

    if (durationSec && durationSec > MAX_AUDIO_DURATION) {
      const durationMin = Math.round(durationSec / 60);
      const maxMin = Math.round(MAX_AUDIO_DURATION / 60);
      const errorMsg = `Video too long (${durationMin} min). Max: ${maxMin} min.`;
      console.warn(`[${video_id}] ${errorMsg}`);
      transcriptJobs.markError(job_id, errorMsg);
      return;
    }

    // Download audio
    console.log(`[${video_id}] Downloading audio...`);
    await downloadAudio(video_id, audioPath);
    console.log(`[${video_id}] ✓ Audio downloaded`);

    // Transcribe with Whisper
    console.log(`[${video_id}] Running Whisper transcription...`);
    const transcript = await transcribeAudioWithWhisper(audioPath);
    console.log(`[${video_id}] ✓ ASR completed (${transcript.length} chars)`);

    // Mark job as done
    transcriptJobs.markDone(job_id, transcript, 'asr', durationSec);
    console.log(`[${video_id}] ✓ Job ${job_id} completed successfully`);

  } catch (error) {
    console.error(`[${video_id}] ✗ Job ${job_id} failed:`, error.message);
    transcriptJobs.markError(job_id, error.message);

  } finally {
    // Always cleanup temp file
    cleanupTempFile(audioPath);
  }
}

/**
 * Main worker loop
 */
async function workerLoop() {
  while (true) {
    try {
      // Get next pending job
      const job = transcriptJobs.getNextPending();

      if (job) {
        await processJob(job);
      } else {
        // No jobs, sleep and check again
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
      }

    } catch (error) {
      console.error('Worker loop error:', error);
      // Sleep before retrying
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Start the worker
console.log('✅ ASR Worker started, polling for jobs...\n');
workerLoop().catch(error => {
  console.error('Fatal worker error:', error);
  process.exit(1);
});
