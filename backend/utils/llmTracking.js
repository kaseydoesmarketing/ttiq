/**
 * LLM Usage Tracking Utility
 *
 * Tracks per-user, per-model LLM usage.
 * Call incrementUsage(userId, model) after each successful LLM request.
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/titleiq.db');

/**
 * Increment LLM usage count for a user + model
 * @param {string} userId - User ID
 * @param {string} model - Model name (e.g., 'gpt-4o', 'sonnet-4.5')
 */
export function incrementUsage(userId, model) {
  const db = new Database(dbPath);

  try {
    const stmt = db.prepare(`
      INSERT INTO llm_usage (user_id, model, count, last_used_at)
      VALUES (?, ?, 1, datetime('now'))
      ON CONFLICT(user_id, model)
      DO UPDATE SET
        count = count + 1,
        last_used_at = datetime('now')
    `);

    stmt.run(userId, model);
    db.close();
  } catch (err) {
    db.close();
    console.error('[LLMTracking] Error incrementing usage:', err);
  }
}

/**
 * Record request metrics for performance tracking
 * @param {string} route - API route (e.g., '/api/generate')
 * @param {number} durationMs - Request duration in milliseconds
 * @param {number} statusCode - HTTP status code
 */
export function recordRequestMetrics(route, durationMs, statusCode) {
  const db = new Database(dbPath);

  try {
    const stmt = db.prepare(`
      INSERT INTO request_metrics (ts, duration_ms, status_code, route)
      VALUES (datetime('now'), ?, ?, ?)
    `);

    stmt.run(durationMs, statusCode, route);
    db.close();
  } catch (err) {
    db.close();
    console.error('[LLMTracking] Error recording metrics:', err);
  }
}

export default {
  incrementUsage,
  recordRequestMetrics
};
