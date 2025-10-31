/**
 * Admin Live Data API - TitleIQ Dashboard v2
 *
 * GET /api/admin/live - Server-Sent Events stream for real-time telemetry
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
 * GET /api/admin/live
 * SSE stream with real-time metrics
 */
router.get('/live', authenticateToken, requireAdmin, (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

  // Send initial connected message
  res.write(': connected\n\n');

  console.log(`[AdminLive] SSE stream opened by ${req.user.email}`);

  // Interval IDs
  let activeUsersInterval, perfTickInterval, systemStatusInterval, heartbeatInterval;

  // Send active users count every 5 seconds
  activeUsersInterval = setInterval(() => {
    try {
      const db = getDb();
      const activeCount = db.prepare(`
        SELECT COUNT(DISTINCT user_id) as c
        FROM usage_logs
        WHERE date >= DATE('now', '-1 day')
      `).get().c || 0;
      db.close();

      const data = {
        count: activeCount,
        timestamp: new Date().toISOString()
      };

      res.write(`event: active_users\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error('[AdminLive] Error fetching active users:', err);
    }
  }, 5000);

  // Send performance metrics every 10 seconds
  perfTickInterval = setInterval(() => {
    try {
      const db = getDb();
      const perfRow = db.prepare(`
        SELECT
          AVG(duration_ms) as avg_ms,
          SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors,
          COUNT(*) as total
        FROM request_metrics
        WHERE ts >= datetime('now', '-1 hour')
      `).get();
      db.close();

      const avgResponseMs = Math.round(perfRow.avg_ms || 0);
      const errorRatePct = perfRow.total > 0
        ? parseFloat(((perfRow.errors / perfRow.total) * 100).toFixed(2))
        : 0;

      const data = {
        avgResponseMs,
        errorRatePct,
        timestamp: new Date().toISOString()
      };

      res.write(`event: performance_tick\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error('[AdminLive] Error fetching performance metrics:', err);
    }
  }, 10000);

  // Send system status every 30 seconds
  systemStatusInterval = setInterval(() => {
    try {
      // Simple health check: if we can query DB, it's healthy
      const db = getDb();
      db.prepare('SELECT 1').get();
      db.close();

      const data = {
        api: 'green',
        db: 'green',
        timestamp: new Date().toISOString()
      };

      res.write(`event: system_status\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error('[AdminLive] Error checking system status:', err);

      const data = {
        api: 'green',
        db: 'red',
        timestamp: new Date().toISOString()
      };

      res.write(`event: system_status\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }, 30000);

  // Heartbeat comment every 10 seconds
  heartbeatInterval = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 10000);

  // Clean up on client disconnect
  req.on('close', () => {
    console.log(`[AdminLive] SSE stream closed by ${req.user.email}`);
    clearInterval(activeUsersInterval);
    clearInterval(perfTickInterval);
    clearInterval(systemStatusInterval);
    clearInterval(heartbeatInterval);
    res.end();
  });
});

export default router;
