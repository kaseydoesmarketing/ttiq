/**
 * Admin LLM Usage API - TitleIQ Dashboard v2
 *
 * GET /api/admin/llm-usage - LLM usage analytics by user and model
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
 * GET /api/admin/llm-usage
 * Query params: from (YYYY-MM-DD), to (YYYY-MM-DD), model (optional)
 */
router.get('/llm-usage', authenticateToken, requireAdmin, async (req, res) => {
  const { from, to, model } = req.query;

  // Default date range: last 30 days
  const toDate = to || new Date().toISOString().split('T')[0];
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const db = getDb();

  try {
    // Build query with optional model filter
    let usageQuery = `
      SELECT
        lu.user_id,
        u.email,
        lu.model,
        lu.count,
        lu.last_used_at
      FROM llm_usage lu
      JOIN users u ON lu.user_id = u.id
      WHERE lu.last_used_at >= ? AND lu.last_used_at <= ?
    `;

    const params = [fromDate + ' 00:00:00', toDate + ' 23:59:59'];

    if (model) {
      usageQuery += ' AND lu.model = ?';
      params.push(model);
    }

    usageQuery += ' ORDER BY lu.count DESC';

    const usageData = db.prepare(usageQuery).all(...params);

    // Calculate totals
    const totalRequests = usageData.reduce((sum, row) => sum + row.count, 0);
    const uniqueUsers = new Set(usageData.map(row => row.user_id)).size;

    // Format per-user data
    const by_user = usageData.map(row => ({
      user_id: row.user_id,
      email: row.email,
      model: row.model,
      count: row.count,
      last_used_at: row.last_used_at
    }));

    // Generate sparkline data (daily aggregates)
    const sparklineQuery = `
      SELECT
        DATE(last_used_at) as date,
        SUM(count) as total
      FROM llm_usage
      WHERE last_used_at >= ? AND last_used_at <= ?
      ${model ? 'AND model = ?' : ''}
      GROUP BY DATE(last_used_at)
      ORDER BY date ASC
    `;

    const sparklineParams = [fromDate + ' 00:00:00', toDate + ' 23:59:59'];
    if (model) sparklineParams.push(model);

    const sparklineData = db.prepare(sparklineQuery).all(...sparklineParams);

    // Fill in missing dates with 0 values
    const dates = [];
    const values = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dates.push(dateStr);

      const match = sparklineData.find(row => row.date === dateStr);
      values.push(match ? match.total : 0);
    }

    db.close();

    return res.status(200).json({
      success: true,
      totals: {
        requests: totalRequests,
        users: uniqueUsers
      },
      by_user,
      sparkline: {
        dates,
        values
      }
    });

  } catch (err) {
    db.close();
    console.error('[AdminLLMUsage] Error fetching usage data:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch LLM usage data'
    });
  }
});

export default router;
