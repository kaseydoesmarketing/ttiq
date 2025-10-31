/**
 * EntitleIQ Middleware - Entitlement Resolution Logic
 *
 * Resolves user's effective plan by checking for active grants.
 * If user has an active grant (revoked_at IS NULL), their effectivePlan = grant.label
 * Otherwise, falls back to their normal billing plan.
 *
 * Usage:
 *   import { resolveEntitlement, attachEntitlement } from './middleware/entitlements.js';
 *   app.use(attachEntitlement); // Runs on every authenticated request
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/titleiq.db');

/**
 * Resolve effective entitlement for a user
 * @param {string} userId - User ID to check
 * @returns {object} { effectivePlan, source, grantId, label }
 */
export function resolveEntitlement(userId) {
  const db = new Database(dbPath, { readonly: true });

  try {
    // Check for active grant
    const grant = db.prepare(`
      SELECT id, label, source
      FROM entitlements
      WHERE user_id = ? AND revoked_at IS NULL
      LIMIT 1
    `).get(userId);

    if (grant) {
      db.close();
      return {
        effectivePlan: 'PRO_LIFETIME',
        source: grant.source,
        grantId: grant.id,
        label: grant.label,
        hasGrant: true
      };
    }

    // Fallback to normal plan
    const user = db.prepare(`SELECT plan FROM users WHERE id = ?`).get(userId);
    db.close();

    return {
      effectivePlan: user?.plan?.toUpperCase() || 'TRIAL',
      source: 'billing',
      grantId: null,
      label: null,
      hasGrant: false
    };
  } catch (err) {
    db.close();
    console.error('[EntitleIQ] Error resolving entitlement:', err);
    return {
      effectivePlan: 'TRIAL',
      source: 'error',
      grantId: null,
      label: null,
      hasGrant: false
    };
  }
}

/**
 * Middleware to attach entitlement to req.user
 *
 * Must run AFTER authenticateToken middleware (req.user must exist)
 * Adds req.user.entitlement = { effectivePlan, source, grantId, label, hasGrant }
 */
export function attachEntitlement(req, res, next) {
  if (!req.user || !req.user.id) {
    // No authenticated user, skip
    return next();
  }

  req.user.entitlement = resolveEntitlement(req.user.id);
  next();
}

/**
 * Middleware to require Pro plan (checks entitlement)
 *
 * Use this on routes that require Pro access
 */
export function requirePro(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const ent = req.user.entitlement || resolveEntitlement(req.user.id);

  if (ent.effectivePlan === 'PRO_LIFETIME' || ent.effectivePlan === 'CREATOR_PRO') {
    return next();
  }

  return res.status(403).json({
    error: 'Pro plan required',
    currentPlan: ent.effectivePlan
  });
}

export default {
  resolveEntitlement,
  attachEntitlement,
  requirePro
};
