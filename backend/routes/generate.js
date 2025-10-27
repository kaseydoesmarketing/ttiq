import express from 'express';
import crypto from 'crypto';
import { optionalAuth } from '../middleware/auth.js';
import { fetchTranscript, validateTranscript } from '../utils/transcript.js';
import { generateTitlesAndDescription } from '../utils/llm.js';
import { userDb, usageDb, userGenerations, PLAN_LIMITS } from '../utils/db.js';
import { decrypt } from '../utils/encryption.js';
import { standardRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * POST /api/generate
 * Generate titles and description from YouTube URL or raw transcript
 * Works in builder mode (no auth) or with auth
 */
router.post('/generate', standardRateLimit, optionalAuth, async (req, res) => {
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

    // Step 2: Check usage limits if authenticated
    if (req.user) {
      const limitCheck = usageDb.checkLimit(req.user.id, req.user.plan);

      if (!limitCheck.allowed) {
        const planName = PLAN_LIMITS[req.user.plan].displayName;
        return res.status(429).json({
          error: `Daily limit reached for ${planName} plan. Upgrade to continue.`,
          limit: limitCheck.limit,
          used: limitCheck.used,
          plan: req.user.plan
        });
      }
    }

    // Step 3: Get user's API key/provider if authenticated
    let userApiKey = null;
    let provider = 'groq';

    if (req.user) {
      const user = userDb.findById(req.user.id);
      provider = user.model_provider || 'groq';

      if (user && user.model_api_key_encrypted) {
        try {
          userApiKey = decryptApiKey(user.model_api_key_encrypted);
        } catch (error) {
          console.error('Failed to decrypt user API key:', error);
          // Fall back to free API
        }
      }
    }

    // Step 4: Generate titles + description + tags
    const result = await generateTitlesAndDescription(transcript, {
      userApiKey,
      provider
    });

    // Limit output for trial users
    const maxTitles = req.user ? PLAN_LIMITS[req.user.plan].maxTitlesPerGeneration : 10;
    const limitedTitles = result.titles.slice(0, maxTitles);

    // Step 5: Save to database and increment usage (if user is logged in)
    if (req.user) {
      try {
        // Increment usage counter
        usageDb.incrementGenerations(req.user.id);

        // Save to history
        const generationId = crypto.randomUUID();
        userGenerations.create(
          generationId,
          req.user.id,
          transcript,
          limitedTitles,
          result.description,
          result.tags,
          provider
        );
      } catch (error) {
        console.error('Failed to save generation:', error);
        // Don't fail the request if saving fails
      }
    }

    // Step 6: Return result
    console.log(`[GENERATION] Generated ${limitedTitles.length} titles (provider: ${provider})`);

    res.json({
      success: true,
      transcript: transcript.substring(0, 1000) + (transcript.length > 1000 ? '...' : ''),
      themes: result.themes,
      titles: limitedTitles,
      description: result.description,
      tags: result.tags,
      usedProvider: userApiKey ? provider : `${provider} (free)`
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

// Helper to decrypt API key (if user provided one)
function decryptApiKey(encrypted) {
  // TODO: Implement decryption using ENCRYPT_SECRET from env
  // For now, return null (use platform default)
  return null;
}

export default router;
