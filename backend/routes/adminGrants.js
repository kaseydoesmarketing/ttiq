/**
 * Admin Grants API - EntitleIQ CRUD endpoints
 *
 * POST   /api/admin/grants      - Grant Pro Lifetime to a user
 * DELETE /api/admin/grants/:id - Revoke a grant
 * GET    /api/admin/grants      - List all grants (with filters)
 */

import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/titleiq.db');

function getDb() {
  return new Database(dbPath);
}

/**
 * POST /api/admin/grants
 * Grant Pro Lifetime to a user
 */
router.post('/grants', authenticateToken, requireAdmin, async (req, res) => {
  const { user_id, label, source, notes } = req.body;

  // Validation
  if (!user_id || !label || !source) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: user_id, label, source'
    });
  }

  const validSources = ['beta_comp', 'manual_override', 'partner_referral'];
  if (!validSources.includes(source)) {
    return res.status(400).json({
      success: false,
      error: `Invalid source. Must be one of: ${validSources.join(', ')}`
    });
  }

  if (label.length > 100) {
    return res.status(400).json({ success: false, error: 'Label too long (max 100 chars)' });
  }

  if (notes && notes.length > 500) {
    return res.status(400).json({ success: false, error: 'Notes too long (max 500 chars)' });
  }

  const db = getDb();

  try {
    // Check if user exists
    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(user_id);
    if (!user) {
      db.close();
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check for existing active grant
    const existingGrant = db.prepare(`
      SELECT id FROM entitlements
      WHERE user_id = ? AND revoked_at IS NULL
      LIMIT 1
    `).get(user_id);

    if (existingGrant) {
      db.close();
      return res.status(409).json({
        success: false,
        error: 'User already has an active grant',
        grant_id: existingGrant.id
      });
    }

    // Create grant
    const stmt = db.prepare(`
      INSERT INTO entitlements (user_id, label, source, granted_by, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(user_id, label, source, req.user.id, notes || null);
    const grantId = result.lastInsertRowid;

    // Fetch created grant
    const grant = db.prepare(`
      SELECT id, user_id, label, source, granted_by, notes, created_at, revoked_at
      FROM entitlements
      WHERE id = ?
    `).get(grantId);

    db.close();

    console.log(`[EntitleIQ] Grant created: ID ${grantId} for user ${user.email} by ${req.user.email}`);

    return res.status(200).json({
      success: true,
      grant_id: Number(grantId),
      user_id,
      label,
      active: true,
      created_at: grant.created_at
    });

  } catch (err) {
    db.close();
    console.error('[EntitleIQ] Error creating grant:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/admin/grants/:id
 * Revoke a grant
 */
router.delete('/grants/:id', authenticateToken, requireAdmin, async (req, res) => {
  const grantId = parseInt(req.params.id);

  if (isNaN(grantId)) {
    return res.status(400).json({ success: false, error: 'Invalid grant ID' });
  }

  const db = getDb();

  try {
    // Check if grant exists
    const grant = db.prepare('SELECT id, user_id, revoked_at FROM entitlements WHERE id = ?').get(grantId);

    if (!grant) {
      db.close();
      return res.status(404).json({ success: false, error: 'Grant not found' });
    }

    if (grant.revoked_at) {
      db.close();
      return res.status(400).json({
        success: false,
        error: 'Grant already revoked',
        revoked_at: grant.revoked_at
      });
    }

    // Revoke grant
    const stmt = db.prepare(`
      UPDATE entitlements
      SET revoked_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(grantId);

    // Fetch updated grant
    const updated = db.prepare('SELECT revoked_at FROM entitlements WHERE id = ?').get(grantId);

    db.close();

    console.log(`[EntitleIQ] Grant revoked: ID ${grantId} by ${req.user.email}`);

    return res.status(200).json({
      success: true,
      grant_id: grantId,
      revoked_at: updated.revoked_at
    });

  } catch (err) {
    db.close();
    console.error('[EntitleIQ] Error revoking grant:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/grants
 * List all grants (with optional filters)
 */
router.get('/grants', authenticateToken, requireAdmin, async (req, res) => {
  const { user_id, active } = req.query;

  const db = getDb();

  try {
    let query = `
      SELECT
        e.id,
        e.user_id,
        u.email,
        e.label,
        e.source,
        e.notes,
        e.granted_by,
        admin.email as granted_by_email,
        e.created_at,
        e.revoked_at,
        CASE WHEN e.revoked_at IS NULL THEN 1 ELSE 0 END as active
      FROM entitlements e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN users admin ON e.granted_by = admin.id
      WHERE 1=1
    `;

    const params = [];

    if (user_id) {
      query += ' AND e.user_id = ?';
      params.push(user_id);
    }

    if (active === 'true') {
      query += ' AND e.revoked_at IS NULL';
    } else if (active === 'false') {
      query += ' AND e.revoked_at IS NOT NULL';
    }

    query += ' ORDER BY e.created_at DESC';

    const grants = db.prepare(query).all(...params);

    db.close();

    return res.status(200).json({
      success: true,
      grants: grants.map(g => ({
        id: g.id,
        user_id: g.user_id,
        email: g.email,
        label: g.label,
        source: g.source,
        notes: g.notes,
        active: Boolean(g.active),
        granted_by: g.granted_by,
        granted_by_email: g.granted_by_email,
        created_at: g.created_at,
        revoked_at: g.revoked_at
      }))
    });

  } catch (err) {
    db.close();
    console.error('[EntitleIQ] Error listing grants:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
