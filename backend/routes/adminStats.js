/**
 * Admin Stats API - TitleIQ Dashboard v2
 *
 * GET /api/admin/stats/overview - Primary dashboard metrics
 * GET /api/admin/users/active - Recently active users list
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
 * GET /api/admin/stats/overview
 * Primary dashboard metrics with performance data
 */
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  const db = getDb();

  try {
    // Overview metrics
    const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;

    // Active now: users with session activity in last 5 minutes
    // NOTE: Assumes a sessions table exists or we track last_seen_at in users
    // For now, estimate from recent activity
    const activeNow = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as c
      FROM usage_logs
      WHERE date >= DATE('now', '-1 day')
    `).get().c || 0;

    // Total title generations (sum of all usage)
    const totalTitleGenerations = db.prepare(`
      SELECT SUM(count_generations) as c
      FROM usage_logs
    `).get().c || 0;

    // Title generations in last 24 hours
    const titleGenerations24h = db.prepare(`
      SELECT SUM(count_generations) as c
      FROM usage_logs
      WHERE date >= DATE('now', '-1 day')
    `).get().c || 0;

    // Performance metrics from request_metrics table
    const perfRow = db.prepare(`
      SELECT
        COUNT(*) as total,
        AVG(duration_ms) as avg_ms,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors
      FROM request_metrics
      WHERE ts >= datetime('now', '-1 day')
    `).get();

    const requestsTotal24h = perfRow.total || 0;
    const avgResponseMs = Math.round(perfRow.avg_ms || 0);
    const errorRatePct = requestsTotal24h > 0
      ? parseFloat(((perfRow.errors / requestsTotal24h) * 100).toFixed(2))
      : 0;

    // System health checks
    // For now, if we can query DB, it's healthy
    const apiStatus = 'green';
    const dbStatus = 'green';

    db.close();

    return res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        activeNow,
        totalTitleGenerations,
        titleGenerations24h
      },
      performance: {
        requestsTotal24h,
        avgResponseMs,
        errorRatePct
      },
      system: {
        api: apiStatus,
        db: dbStatus,
        refreshedAt: new Date().toISOString()
      }
    });

  } catch (err) {
    db.close();
    console.error('[AdminStats] Error fetching overview:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard overview'
    });
  }
});

/**
 * GET /api/admin/users/active
 * Recently active users with model usage and grant status
 */
router.get('/users/active', authenticateToken, requireAdmin, async (req, res) => {
  const { limit = 50 } = req.query;
  const maxLimit = Math.min(parseInt(limit), 200);

  const db = getDb();

  try {
    // Get recent users with activity
    const users = db.prepare(`
      SELECT
        u.id as user_id,
        u.email,
        u.plan,
        u.billing_status as status,
        u.updated_at as last_seen_at,
        COALESCE(ul.count_generations, 0) as titles_generated_today,
        CASE WHEN e.id IS NOT NULL THEN 1 ELSE 0 END as has_grant
      FROM users u
      LEFT JOIN usage_logs ul ON u.id = ul.user_id AND ul.date = DATE('now')
      LEFT JOIN entitlements e ON u.id = e.user_id AND e.revoked_at IS NULL
      ORDER BY u.updated_at DESC
      LIMIT ?
    `).all(maxLimit);

    // For each user, fetch their model usage
    const enrichedUsers = users.map(user => {
      const modelUsage = db.prepare(`
        SELECT model, count
        FROM llm_usage
        WHERE user_id = ?
        ORDER BY count DESC
        LIMIT 5
      `).all(user.user_id);

      return {
        user_id: user.user_id,
        email: user.email,
        plan: user.plan || 'trial',
        status: user.status || 'active',
        last_seen_at: user.last_seen_at,
        titles_generated_today: user.titles_generated_today,
        models_used: modelUsage.map(m => ({
          model: m.model,
          count: m.count
        })),
        has_grant: Boolean(user.has_grant)
      };
    });

    db.close();

    return res.status(200).json({
      success: true,
      users: enrichedUsers
    });

  } catch (err) {
    db.close();
    console.error('[AdminStats] Error fetching active users:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch active users'
    });
  }
});

export default router;
