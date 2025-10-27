/**
 * Node.js-based YouTube caption extraction using youtube-caption-extractor
 * Replaces Python subprocess for improved reliability and simpler deployment
 */

import { getSubtitles } from 'youtube-caption-extractor';

/**
 * Get captions using youtube-caption-extractor (Node.js)
 * Supports both user-uploaded and auto-generated captions
 *
 * @param {string} videoId - YouTube video ID (11 characters)
 * @returns {Promise<{ok: boolean, transcript?: string, durationSec?: number, error?: string}>}
 */
export async function getCaptionsViaNodejs(videoId) {
  try {
    console.log(`[Captions] Fetching for ${videoId} using youtube-caption-extractor...`);

    // Fetch subtitles - tries all available languages, prioritizes English
    const subtitles = await getSubtitles({ videoID: videoId, lang: 'en' });

    if (!subtitles || subtitles.length === 0) {
      console.log(`[Captions] No subtitles found for ${videoId}`);
      return {
        ok: false,
        error: 'no_captions',
      };
    }

    // Combine all subtitle segments into full transcript
    const fullText = subtitles
      .map((segment) => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\[Music\]/gi, '') // Remove [Music] markers
      .replace(/\[Applause\]/gi, '') // Remove [Applause] markers
      .replace(/\[Laughter\]/gi, '') // Remove [Laughter] markers
      .replace(/\[.*?\]/g, '') // Remove any other bracketed annotations
      .trim();

    // Validate minimum length
    if (!fullText || fullText.length < 100) {
      console.log(`[Captions] Transcript too short for ${videoId} (${fullText.length} chars)`);
      return {
        ok: false,
        error: 'captions_too_short',
      };
    }

    // Calculate approximate duration from subtitle timestamps
    let durationSec = null;
    if (subtitles.length > 0) {
      const lastSegment = subtitles[subtitles.length - 1];
      if (lastSegment.start && lastSegment.dur) {
        durationSec = Math.round(lastSegment.start + lastSegment.dur);
      }
    }

    console.log(`[Captions] ✓ Successfully extracted ${fullText.length} chars from ${videoId}`);

    return {
      ok: true,
      transcript: fullText,
      durationSec,
    };
  } catch (error) {
    const errorMsg = error.message.toLowerCase();

    console.error(`[Captions] Error for ${videoId}:`, error.message);

    // Handle specific error cases
    if (errorMsg.includes('no caption tracks found')) {
      return {
        ok: false,
        error: 'no_caption_tracks',
      };
    }

    if (errorMsg.includes('no captions for language')) {
      return {
        ok: false,
        error: 'no_english_captions',
      };
    }

    if (errorMsg.includes('video unavailable') || errorMsg.includes('private')) {
      return {
        ok: false,
        error: 'video_unavailable',
      };
    }

    if (errorMsg.includes('rate') || errorMsg.includes('too many')) {
      return {
        ok: false,
        error: 'rate_limited',
      };
    }

    // Generic error
    return {
      ok: false,
      error: 'unknown_error',
      message: error.message,
    };
  }
}
