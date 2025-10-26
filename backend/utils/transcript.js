import { YoutubeTranscript } from 'youtube-transcript';

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
 * Fetch transcript from YouTube video
 * @param {string} url - YouTube URL or video ID
 * @returns {Promise<string>} Full transcript text
 */
export async function fetchTranscript(url) {
  try {
    const videoId = extractVideoId(url);

    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);

    // Combine all transcript segments into one string
    const fullTranscript = transcriptArray
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!fullTranscript) {
      throw new Error('Transcript is empty');
    }

    return fullTranscript;
  } catch (error) {
    if (error.message.includes('Transcript is disabled')) {
      throw new Error('Transcript is disabled for this video. Please paste the transcript manually.');
    } else if (error.message.includes('Could not find')) {
      throw new Error('No transcript found for this video. Please paste the transcript manually.');
    } else {
      throw new Error(`Failed to fetch transcript: ${error.message}`);
    }
  }
}

/**
 * Validate that text looks like a transcript
 */
export function validateTranscript(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid transcript: must be a non-empty string');
  }

  const trimmed = text.trim();

  if (trimmed.length < 100) {
    throw new Error('Transcript too short (minimum 100 characters)');
  }

  if (trimmed.length > 500000) {
    throw new Error('Transcript too long (maximum 500,000 characters)');
  }

  return trimmed;
}
