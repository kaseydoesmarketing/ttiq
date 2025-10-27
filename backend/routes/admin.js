import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import db from '../utils/db.js';

const router = express.Router();

// GET /api/admin/metrics (Admin only)
router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Real SQL queries for analytics
    const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;

    const activeUsers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as c
      FROM usage_logs
      WHERE date = DATE('now')
    `).get().c || 0;

    const signupsLast24h = db.prepare(`
      SELECT COUNT(*) as c
      FROM users
      WHERE created_at >= (strftime('%s','now') * 1000) - (24 * 60 * 60 * 1000)
    `).get().c || 0;

    const titleRequestsToday = db.prepare(`
      SELECT SUM(count_generations) as c
      FROM usage_logs
      WHERE date = DATE('now')
    `).get().c || 0;

    const payingUsers = db.prepare(`
      SELECT COUNT(*) as c
      FROM users
      WHERE billing_status = 'active' OR plan IN ('creator', 'creator_pro')
    `).get().c || 0;

    const newsletterSubscribers = db.prepare(`
      SELECT COUNT(*) as c FROM newsletter_signups
    `).get().c || 0;

    const metrics = {
      totalUsers,
      activeUsers,
      signupsLast24h,
      titleRequestsToday,
      payingUsers,
      newsletterSubscribers,
      onlineNowEstimate: Math.ceil(activeUsers / 10),
      subdomains: [
        {
          name: 'titleiq.tightslice.com',
          traffic24h: activeUsers,
          signups24h: signupsLast24h,
          requests24h: titleRequestsToday,
          status: 'healthy'
        }
      ]
    };

    return res.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('[ADMIN] Metrics error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
  }
});

export default router;
