import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { userGenerations, usageDb, PLAN_LIMITS, userDb } from '../utils/db.js';
import db from '../utils/db.js';

const router = express.Router();

// GET /api/user/history - Get user's generation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const history = userGenerations.findByUserId(userId, limit);

    return res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('[USER] History error:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/user/usage - Get today's usage stats
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const plan = req.user.plan;

    const usage = usageDb.getTodayUsage(userId);
    const limits = PLAN_LIMITS[plan];

    return res.json({
      success: true,
      usage: {
        generationsToday: usage.count_generations,
        transcriptsToday: usage.count_transcripts,
        dailyLimit: limits.maxGenerationsPerDay,
        remaining: Math.max(0, limits.maxGenerationsPerDay - usage.count_generations)
      },
      plan: {
        name: limits.displayName,
        features: limits.features
      }
    });

  } catch (error) {
    console.error('[USER] Usage error:', error);
    return res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

// PATCH /api/user/provider - Update user's AI model provider
router.patch('/provider', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({ success: false, error: 'Missing provider' });
    }

    // Get user's current plan and role
    const user = db.prepare('SELECT plan, role, billing_status FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isAdminOrLifetime = user.role === 'admin' || user.billing_status === 'lifetime';
    const canUseProModels = isAdminOrLifetime || user.plan === 'creator_pro';

    const allowedForCreator = ['openai', 'groq'];
    const allowedForPro = ['openai', 'groq', 'grok', 'gemini'];

    // Enforce plan gating
    if (user.plan === 'trial') {
      return res.status(403).json({ success: false, error: 'Upgrade to change provider' });
    }

    if (user.plan === 'creator' && !allowedForCreator.includes(provider)) {
      return res.status(403).json({ success: false, error: 'Upgrade to Creator Pro for this model' });
    }

    if (canUseProModels) {
      if (!allowedForPro.includes(provider)) {
        return res.status(400).json({ success: false, error: 'Unsupported provider' });
      }
    } else if (user.plan === 'creator') {
      if (!allowedForCreator.includes(provider)) {
        return res.status(403).json({ success: false, error: 'Not allowed for your plan' });
      }
    } else {
      return res.status(403).json({ success: false, error: 'Not allowed for your plan' });
    }

    // Update provider
    db.prepare('UPDATE users SET model_provider = ? WHERE id = ?').run(provider, userId);

    // Return updated user profile
    const updated = db.prepare(`
      SELECT id, email, plan, role, billing_status, model_provider, trial_expires, created_at
      FROM users WHERE id = ?
    `).get(userId);

    console.log(`[USER] Provider updated: ${userId} -> ${provider}`);

    return res.json({ success: true, user: updated });

  } catch (error) {
    console.error('[USER] Provider update error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update provider' });
  }
});

export default router;
