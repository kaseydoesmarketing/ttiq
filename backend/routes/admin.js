import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import db, { userDb } from '../utils/db.js';
import { randomUUID } from 'crypto';

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

// ============================================================================
// PHASE 2A ADMIN ENDPOINTS
// ============================================================================

/**
 * Helper function to log admin actions to audit table
 */
function logAdminAction(adminId, action, targetUserId, metadata = {}) {
  const auditId = randomUUID();
  const timestamp = Date.now();

  const stmt = db.prepare(`
    INSERT INTO admin_action_audit (id, action, admin_id, target_user_id, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    auditId,
    action,
    adminId,
    targetUserId,
    JSON.stringify(metadata),
    timestamp
  );

  console.log(`[AUDIT] ${action} by ${adminId} on ${targetUserId}`);
  return auditId;
}

// POST /api/admin/users/:id/upgrade - Upgrade user plan
router.post('/users/:id/upgrade', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const { plan, reason } = req.body;

    // Validate plan
    const validPlans = ['creator', 'creator_pro', 'trial'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan. Must be one of: ${validPlans.join(', ')}`
      });
    }

    // Get target user
    const targetUser = userDb.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Store old plan for audit
    const oldPlan = targetUser.plan;
    const oldStatus = targetUser.status;

    // Update user plan
    const status = plan === 'trial' ? 'trial' : 'active';
    userDb.updatePlan(targetUserId, plan, status);

    // If upgrading to paid plan, set billing_status to lifetime (manual comp)
    if (plan !== 'trial') {
      const stmt = db.prepare(`
        UPDATE users
        SET billing_status = 'lifetime', updated_at = ?
        WHERE id = ?
      `);
      stmt.run(Date.now(), targetUserId);
    }

    // Log admin action
    logAdminAction(req.user.id, 'upgrade_user', targetUserId, {
      old_plan: oldPlan,
      new_plan: plan,
      old_status: oldStatus,
      new_status: status,
      reason: reason || 'No reason provided',
      admin_email: req.user.email,
      target_email: targetUser.email
    });

    return res.json({
      success: true,
      message: `User ${targetUser.email} upgraded from ${oldPlan} to ${plan}`,
      user: {
        id: targetUserId,
        email: targetUser.email,
        old_plan: oldPlan,
        new_plan: plan,
        status
      }
    });

  } catch (error) {
    console.error('[ADMIN] Upgrade user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to upgrade user' });
  }
});

// POST /api/admin/users/:id/suspend - Suspend user account
router.post('/users/:id/suspend', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Suspension reason is required'
      });
    }

    // Get target user
    const targetUser = userDb.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent self-suspension
    if (targetUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot suspend your own account'
      });
    }

    // Store old status
    const oldStatus = targetUser.status;

    // Suspend account
    const stmt = db.prepare(`
      UPDATE users
      SET status = 'cancelled',
          billing_status = 'cancelled',
          updated_at = ?
      WHERE id = ?
    `);
    stmt.run(Date.now(), targetUserId);

    // Log admin action
    logAdminAction(req.user.id, 'suspend_account', targetUserId, {
      reason,
      notes: notes || '',
      old_status: oldStatus,
      admin_email: req.user.email,
      target_email: targetUser.email
    });

    return res.json({
      success: true,
      message: `User ${targetUser.email} has been suspended`,
      user: {
        id: targetUserId,
        email: targetUser.email,
        status: 'cancelled',
        reason
      }
    });

  } catch (error) {
    console.error('[ADMIN] Suspend user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to suspend user' });
  }
});

// POST /api/admin/users/:id/restore - Restore suspended account
router.post('/users/:id/restore', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const { notes } = req.body;

    // Get target user
    const targetUser = userDb.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Store old status
    const oldStatus = targetUser.status;

    // Restore account to active (preserve their plan)
    const newStatus = targetUser.plan === 'trial' ? 'trial' : 'active';
    const newBillingStatus = targetUser.billing_status === 'lifetime' ? 'lifetime' : 'ok';

    const stmt = db.prepare(`
      UPDATE users
      SET status = ?,
          billing_status = ?,
          updated_at = ?
      WHERE id = ?
    `);
    stmt.run(newStatus, newBillingStatus, Date.now(), targetUserId);

    // Log admin action
    logAdminAction(req.user.id, 'restore_account', targetUserId, {
      old_status: oldStatus,
      new_status: newStatus,
      notes: notes || '',
      admin_email: req.user.email,
      target_email: targetUser.email
    });

    return res.json({
      success: true,
      message: `User ${targetUser.email} has been restored`,
      user: {
        id: targetUserId,
        email: targetUser.email,
        status: newStatus,
        billing_status: newBillingStatus
      }
    });

  } catch (error) {
    console.error('[ADMIN] Restore user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to restore user' });
  }
});

// GET /api/admin/audit-log - Fetch admin action audit log
router.get('/audit-log', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 100, offset = 0, action, target_user_id } = req.query;

    let query = `
      SELECT
        a.*,
        admin.email as admin_email,
        target.email as target_email
      FROM admin_action_audit a
      LEFT JOIN users admin ON a.admin_id = admin.id
      LEFT JOIN users target ON a.target_user_id = target.id
      WHERE 1=1
    `;

    const params = [];

    // Filter by action type
    if (action) {
      query += ' AND a.action = ?';
      params.push(action);
    }

    // Filter by target user
    if (target_user_id) {
      query += ' AND a.target_user_id = ?';
      params.push(target_user_id);
    }

    query += ' ORDER BY a.timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const stmt = db.prepare(query);
    const results = stmt.all(...params);

    // Parse metadata JSON
    const logs = results.map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM admin_action_audit WHERE 1=1';
    const countParams = [];

    if (action) {
      countQuery += ' AND action = ?';
      countParams.push(action);
    }

    if (target_user_id) {
      countQuery += ' AND target_user_id = ?';
      countParams.push(target_user_id);
    }

    const countStmt = db.prepare(countQuery);
    const { total } = countStmt.get(...countParams);

    return res.json({
      success: true,
      logs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + logs.length < total
      }
    });

  } catch (error) {
    console.error('[ADMIN] Audit log error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch audit log' });
  }
});

export default router;
