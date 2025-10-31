import express from 'express';
import crypto from 'crypto';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';
import { fetchTranscript, validateTranscript } from '../utils/transcript.js';
import { generateTitlesAndDescription } from '../utils/llm.js';
import { userDb, usageDb, userGenerations, PLAN_LIMITS } from '../utils/db.js';
import { decrypt } from '../utils/encryption.js';
import { standardRateLimit } from '../middleware/rateLimit.js';
import { incrementUsage, recordRequestMetrics } from '../utils/llmTracking.js';
import { buildTitle, previewTitle } from '../utils/titleBuilder.js';
import { buildDescription, previewDescription } from '../utils/descriptionBuilder.js';
import { generatePinComment, generateMultiplePinComments } from '../utils/pinCommentGenerator.js';
import db from '../utils/db.js';

const router = express.Router();

/**
 * POST /api/generate
 * Generate titles and description from YouTube URL or raw transcript
 * Works in builder mode (no auth) or with auth
 */
router.post('/generate', standardRateLimit, optionalAuth, async (req, res) => {
  const startTime = Date.now();

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

    // Step 3: Get user's API key/provider and profile context if authenticated
    let userApiKey = null;
    let provider = 'groq';
    let userContext = {};

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

      // Build user context for personalization
      userContext = {
        niche: user.niche,
        brand_voice: user.brand_voice,
        primary_goal: user.primary_goal,
        content_type: user.content_type,
        channel_size: user.channel_size,
        brand_name: user.brand_name,
        channel_name: user.channel_name,
        website_url: user.website_url,
        episode_number: user.episode_number,
        title_preferences: user.title_preferences ? JSON.parse(user.title_preferences) : null,
        social_links: user.social_links ? JSON.parse(user.social_links) : null,
        hashtags: user.hashtags ? JSON.parse(user.hashtags) : null,
        keywords: user.keywords ? JSON.parse(user.keywords) : null,
        competitors: user.competitors ? JSON.parse(user.competitors) : null
      };
    }

    // Step 4: Generate titles + description + tags with user context
    const result = await generateTitlesAndDescription(transcript, {
      userApiKey,
      provider,
      userContext
    });

    // Track LLM usage if user is authenticated
    if (req.user) {
      const modelUsed = provider === 'groq' ? 'llama-3.3-70b' :
                       provider === 'openai' ? 'gpt-4o' :
                       provider === 'anthropic' ? 'sonnet-4.5' : provider;
      incrementUsage(req.user.id, modelUsed);
    }

    // Limit output for trial users
    const maxTitles = req.user ? PLAN_LIMITS[req.user.plan].maxTitlesPerGeneration : 10;
    const limitedTitles = result.titles.slice(0, maxTitles);

    // PHASE 2A: Apply smart title builder if user has preferences
    let optimizedTitle = null;
    if (req.user && userContext.title_preferences && limitedTitles.length > 0) {
      try {
        optimizedTitle = buildTitle(limitedTitles[0], {
          brand: userContext.brand_name,
          channel: userContext.channel_name,
          episode: userContext.episode_number,
          preferences: userContext.title_preferences
        });
      } catch (error) {
        console.error('Title builder error:', error);
        // Don't fail request if title builder fails
      }
    }

    // PHASE 2A: Build enhanced description if user is authenticated
    let enhancedDescription = result.description;
    if (req.user) {
      try {
        enhancedDescription = buildDescription({
          transcript: transcript.substring(0, 500), // Lead paragraph context
          profile: userContext,
          keyTakeaways: result.themes?.slice(0, 5) || [],
          resources: userContext.website_url ? [
            { label: 'Website', url: userContext.website_url, affiliate: false }
          ] : [],
          hashtags: result.tags || [],
          leadText: result.description.split('\n')[0], // Use LLM's lead if available
          title: limitedTitles[0] || '' // Pass first title for hashtag generation
        });
      } catch (error) {
        console.error('Description builder error:', error);
        // Fall back to original description
      }
    }

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

    const duration = Date.now() - startTime;
    recordRequestMetrics('/api/generate', duration, 200);

    res.json({
      success: true,
      transcript: transcript.substring(0, 1000) + (transcript.length > 1000 ? '...' : ''),
      themes: result.themes,
      titles: limitedTitles,
      optimizedTitle: optimizedTitle || limitedTitles[0], // Return optimized title if available
      description: enhancedDescription,
      tags: result.tags,
      usedProvider: userApiKey ? provider : `${provider} (free)`,
      // Phase 2A metadata
      hasOptimizedTitle: !!optimizedTitle,
      hasEnhancedDescription: req.user && enhancedDescription !== result.description
    });

  } catch (error) {
    console.error('Generation error:', error);

    const duration = Date.now() - startTime;
    const statusCode = error.message.includes('API') || error.message.includes('rate limit') ? 503 : 500;
    recordRequestMetrics('/api/generate', duration, statusCode);

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

/**
 * POST /api/generate/pin-comment
 * Generate pin comment recommendations
 * Requires authentication
 */
router.post('/pin-comment', authenticateToken, async (req, res) => {
  try {
    const { transcript, titles, strategy = 'auto', count = 3 } = req.body;

    if (!transcript || !titles || !Array.isArray(titles)) {
      return res.status(400).json({
        error: 'Missing required fields: transcript and titles (array)'
      });
    }

    // Get user profile for personalization
    const user = userDb.findById(req.user.id);
    const profile = {
      content_type: user.content_type,
      brand_voice: user.brand_voice,
      primary_goal: user.primary_goal,
      niche: user.niche,
      channel_size: user.channel_size
    };

    // Generate pin comment(s)
    let pinComments;
    if (count > 1) {
      pinComments = generateMultiplePinComments(
        { transcript, titles, profile, strategy },
        count
      );
    } else {
      const single = generatePinComment({ transcript, titles, profile, strategy });
      pinComments = [single];
    }

    // Save to database (for future analytics)
    const generationId = req.body.generationId || crypto.randomUUID();

    pinComments.forEach((comment, index) => {
      try {
        const commentId = crypto.randomUUID();
        const stmt = db.prepare(`
          INSERT INTO pin_comment_recommendations (
            id, generation_id, user_id, comment_text,
            engagement_score, strategy, reasoning, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          commentId,
          generationId,
          req.user.id,
          comment.text,
          comment.score,
          comment.strategy,
          comment.reasoning,
          Date.now()
        );
      } catch (error) {
        console.error('Failed to save pin comment:', error);
        // Don't fail request if saving fails
      }
    });

    res.json({
      success: true,
      pinComments,
      generationId
    });

  } catch (error) {
    console.error('Pin comment generation error:', error);
    res.status(500).json({
      error: 'Failed to generate pin comments',
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
