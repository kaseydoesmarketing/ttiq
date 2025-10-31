import express from 'express';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import { userDb } from '../utils/db.js';
import { generateAllLayouts, validateAllLayouts } from '../utils/descriptionGeneratorPro.js';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/titleiq.db');
const db = new Database(dbPath);

const router = express.Router();

/**
 * POST /api/descriptions/generate
 * Generate 4 professional description layouts
 * Requires authentication (premium feature)
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { videoTitle, timestamps, generationId } = req.body;

    if (!videoTitle || typeof videoTitle !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid videoTitle'
      });
    }

    // Get user profile data
    const user = userDb.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build user context for description generator
    const userData = {
      brand_name: user.brand_name,
      content_type: user.content_type,
      website_url: user.website_url,
      social_links: user.social_links,
      primary_offer_label: user.primary_offer_label,
      primary_offer_url: user.primary_offer_url,
      secondary_offer_label: user.secondary_offer_label,
      secondary_offer_url: user.secondary_offer_url,
      contact_email: user.contact_email,
      affiliates: user.affiliates ? JSON.parse(user.affiliates) : [],
      sponsor_mention: user.sponsor_mention
    };

    // Generate all 4 layouts
    const layouts = generateAllLayouts(videoTitle, userData, {
      timestamps: timestamps || []
    });

    // Validate layouts
    const validation = validateAllLayouts(layouts);

    if (!validation.valid) {
      console.error('[DESC_GEN_PRO] Validation errors:', validation.errors);
      // Still return layouts but include warnings
    }

    // Save to database
    const descriptionId = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO video_descriptions (
        id, user_id, generation_id, video_title,
        layout_a, layout_b, layout_c, layout_d,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      descriptionId,
      req.user.id,
      generationId || null,
      videoTitle,
      layouts.layout_a,
      layouts.layout_b,
      layouts.layout_c,
      layouts.layout_d,
      Date.now()
    );

    console.log(`[DESC_GEN_PRO] Generated 4 layouts for user ${req.user.id}, title: "${videoTitle.substring(0, 50)}..."`);

    res.json({
      success: true,
      descriptionId,
      layouts,
      validation,
      stats: validation.stats
    });

  } catch (error) {
    console.error('Description generation error:', error);
    res.status(500).json({
      error: 'Failed to generate descriptions',
      details: error.message
    });
  }
});

/**
 * POST /api/descriptions/select
 * Save user's layout selection
 * Requires authentication
 */
router.post('/select', authenticateToken, async (req, res) => {
  try {
    const { descriptionId, layoutChoice } = req.body;

    if (!descriptionId || !layoutChoice) {
      return res.status(400).json({
        error: 'Missing descriptionId or layoutChoice'
      });
    }

    if (!['a', 'b', 'c', 'd'].includes(layoutChoice)) {
      return res.status(400).json({
        error: 'Invalid layoutChoice. Must be a, b, c, or d'
      });
    }

    // Verify description belongs to user
    const checkStmt = db.prepare(`
      SELECT id FROM video_descriptions
      WHERE id = ? AND user_id = ?
    `);
    const existing = checkStmt.get(descriptionId, req.user.id);

    if (!existing) {
      return res.status(404).json({
        error: 'Description not found or does not belong to you'
      });
    }

    // Update selected layout
    const updateStmt = db.prepare(`
      UPDATE video_descriptions
      SET selected_layout = ?
      WHERE id = ?
    `);

    updateStmt.run(layoutChoice, descriptionId);

    console.log(`[DESC_GEN_PRO] User ${req.user.id} selected layout ${layoutChoice} for ${descriptionId}`);

    res.json({
      success: true,
      descriptionId,
      selectedLayout: layoutChoice
    });

  } catch (error) {
    console.error('Description selection error:', error);
    res.status(500).json({
      error: 'Failed to save selection',
      details: error.message
    });
  }
});

/**
 * GET /api/descriptions/:descriptionId
 * Get a specific description set
 * Requires authentication
 */
router.get('/:descriptionId', authenticateToken, async (req, res) => {
  try {
    const { descriptionId } = req.params;

    const stmt = db.prepare(`
      SELECT * FROM video_descriptions
      WHERE id = ? AND user_id = ?
    `);

    const description = stmt.get(descriptionId, req.user.id);

    if (!description) {
      return res.status(404).json({
        error: 'Description not found'
      });
    }

    res.json({
      success: true,
      description: {
        id: description.id,
        videoTitle: description.video_title,
        generationId: description.generation_id,
        layouts: {
          layout_a: description.layout_a,
          layout_b: description.layout_b,
          layout_c: description.layout_c,
          layout_d: description.layout_d
        },
        selectedLayout: description.selected_layout,
        createdAt: description.created_at
      }
    });

  } catch (error) {
    console.error('Description fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch description',
      details: error.message
    });
  }
});

/**
 * GET /api/descriptions/generation/:generationId
 * Get descriptions for a specific generation
 * Requires authentication
 */
router.get('/generation/:generationId', authenticateToken, async (req, res) => {
  try {
    const { generationId } = req.params;

    const stmt = db.prepare(`
      SELECT * FROM video_descriptions
      WHERE generation_id = ? AND user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const description = stmt.get(generationId, req.user.id);

    if (!description) {
      return res.json({
        success: true,
        description: null
      });
    }

    res.json({
      success: true,
      description: {
        id: description.id,
        videoTitle: description.video_title,
        generationId: description.generation_id,
        layouts: {
          layout_a: description.layout_a,
          layout_b: description.layout_b,
          layout_c: description.layout_c,
          layout_d: description.layout_d
        },
        selectedLayout: description.selected_layout,
        createdAt: description.created_at
      }
    });

  } catch (error) {
    console.error('Description fetch by generation error:', error);
    res.status(500).json({
      error: 'Failed to fetch description',
      details: error.message
    });
  }
});

export default router;
