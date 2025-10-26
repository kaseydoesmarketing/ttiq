import express from 'express';
import crypto from 'crypto';
import { optionalAuth } from '../middleware/auth.js';
import { fetchTranscript, validateTranscript } from '../utils/transcript.js';
import { generateTitlesAndDescription } from '../utils/llm.js';
import { userDb, generationDb } from '../utils/db.js';
import { decrypt } from '../utils/encryption.js';

const router = express.Router();

/**
 * POST /api/generate
 * Generate titles and description from YouTube URL or raw transcript
 * Works in builder mode (no auth) or with auth
 */
router.post('/generate', optionalAuth, async (req, res) => {
  try {
    const { input, type } = req.body;

    // Validation
    if (!input || !type) {
      return res.status(400).json({
        error: 'Missing required fields: input and type'
      });
    }

    if (!['url', 'text'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type. Must be "url" or "text"'
      });
    }

    let transcript = '';
    let videoUrl = null;

    // Step 1: Get transcript
    if (type === 'url') {
      videoUrl = input;
      try {
        transcript = await fetchTranscript(input);
      } catch (error) {
        return res.status(400).json({
          error: error.message,
          fallbackRequired: true
        });
      }
    } else {
      try {
        transcript = validateTranscript(input);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    // Step 2: Get user's API key if authenticated
    let userApiKey = null;
    let provider = 'groq';

    if (req.user) {
      const user = userDb.findById(req.user.id);
      if (user && user.api_key) {
        try {
          const decrypted = decrypt(user.api_key, process.env.ENCRYPTION_SECRET);
          const parsed = JSON.parse(decrypted);
          userApiKey = parsed.key;
          provider = parsed.provider;
        } catch (error) {
          console.error('Failed to decrypt user API key:', error);
          // Fall back to free API
        }
      }
    }

    // Step 3: Generate titles and description
    const result = await generateTitlesAndDescription(transcript, {
      userApiKey,
      provider
    });

    // Step 4: Save to database (if user is logged in)
    if (req.user) {
      try {
        const generationId = crypto.randomUUID();
        generationDb.create(
          generationId,
          req.user.id,
          videoUrl,
          transcript,
          result.titles,
          result.description
        );
      } catch (error) {
        console.error('Failed to save generation:', error);
        // Don't fail the request if saving fails
      }
    }

    // Step 5: Return result
    res.json({
      success: true,
      transcript: transcript.substring(0, 1000) + (transcript.length > 1000 ? '...' : ''),
      themes: result.themes,
      titles: result.titles,
      description: result.description,
      usedProvider: userApiKey ? provider : 'groq (free)'
    });

  } catch (error) {
    console.error('Generation error:', error);

    if (error.message.includes('API') || error.message.includes('rate limit')) {
      return res.status(503).json({
        error: 'AI service temporarily unavailable. Please try again in a moment.',
        details: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to generate titles',
      details: error.message
    });
  }
});

export default router;
