import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { userDb } from '../utils/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { authRateLimit, sensitiveRateLimit } from '../middleware/rateLimit.js';
import { sendPasswordResetCode, sendPasswordChangeConfirmation } from '../utils/mailer.js';
import { validatePassword } from '../utils/passwordPolicy.js';

const router = express.Router();

// Track failed reset attempts per email (in-memory)
const failedResetAttempts = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of failedResetAttempts.entries()) {
    if (data.expiresAt < now) {
      failedResetAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Add random timing jitter to prevent timing attacks
 * @param {number} minMs - Minimum delay in milliseconds
 * @param {number} maxMs - Maximum delay in milliseconds
 * @returns {Promise<void>}
 */
function addTimingJitter(minMs = 100, maxMs = 300) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Constant-time comparison of SHA256 hashes to prevent timing attacks
 * @param {string} storedHash - Hex string hash from database
 * @param {string} candidateHash - Hex string hash to compare
 * @returns {boolean} - True if hashes match
 */
function safeEqualHex(storedHash, candidateHash) {
  if (!storedHash || !candidateHash) return false;
  const a = Buffer.from(storedHash, 'hex');
  const b = Buffer.from(candidateHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Record failed reset attempt
 */
function recordFailedAttempt(email) {
  const key = `failed:${email.toLowerCase()}`;
  const now = Date.now();
  const entry = failedResetAttempts.get(key);

  if (!entry || entry.expiresAt < now) {
    failedResetAttempts.set(key, {
      count: 1,
      expiresAt: now + (15 * 60 * 1000), // 15 minutes
      firstAttempt: now
    });
  } else {
    entry.count += 1;
    failedResetAttempts.set(key, entry);
  }
}

/**
 * Check if email is locked out due to too many failed attempts
 */
function isLockedOut(email) {
  const key = `failed:${email.toLowerCase()}`;
  const entry = failedResetAttempts.get(key);

  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    failedResetAttempts.delete(key);
    return false;
  }

  return entry.count >= 6; // Lock after 6 failed attempts
}

/**
 * Audit log for security events
 */
function auditLog(action, email, ip, outcome, details = {}) {
  const timestamp = new Date().toISOString();
  const emailMasked = email ? email.replace(/(.{2}).*@/, '$1***@') : 'unknown';
  const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16) : 'unknown';

  const logEntry = {
    timestamp,
    action,
    email_masked: emailMasked,
    ip_hash: ipHash,
    outcome,
    ...details
  };

  // Log as JSON for easy parsing
  console.log('[AUDIT]', JSON.stringify(logEntry));
}

// POST /api/auth/register - Create new user with 3-day trial
router.post('/register', authRateLimit, async (req, res) => {
  const startTime = Date.now();
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      auditLog('register', email, clientIp, 'missing_fields', {
        latency_ms: Date.now() - startTime
      });
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Normalize email: lowercase + trim (prevents case-based duplicates)
    const normalizedEmail = String(email).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      auditLog('register', normalizedEmail, clientIp, 'invalid_email', {
        latency_ms: Date.now() - startTime
      });
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password policy
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      auditLog('register', normalizedEmail, clientIp, 'weak_password', {
        latency_ms: Date.now() - startTime
      });
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Check for existing user (using normalized email)
    const existing = userDb.findByEmail(normalizedEmail);
    if (existing) {
      auditLog('register', normalizedEmail, clientIp, 'duplicate_email', {
        latency_ms: Date.now() - startTime
      });
      return res.status(409).json({ error: 'Account already exists' });
    }

    // Hash password with bcrypt (cost factor 12 for production)
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = 'user_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');

    // Create user with normalized email and password_version for JWT invalidation
    userDb.create(userId, normalizedEmail, passwordHash, {
      role: 'user',
      plan: 'trial',
      status: 'trial'
    });

    // Generate JWT
    const token = generateToken(userId);
    const user = userDb.findById(userId);

    // Audit log success
    auditLog('register', normalizedEmail, clientIp, 'success', {
      latency_ms: Date.now() - startTime
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTH] New user registered:', normalizedEmail.replace(/(.{2}).*@/, '$1***@'), '(trial)');
    }

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        status: user.status,
        trial_expires: user.trial_expires
      }
    });

  } catch (error) {
    console.error('[AUTH] Registration error:', error.message);
    auditLog('register', req.body?.email, clientIp, 'error', {
      latency_ms: Date.now() - startTime,
      error: error.message
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimit, async (req, res) => {
  const startTime = Date.now();
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      auditLog('login', email, clientIp, 'missing_fields', {
        latency_ms: Date.now() - startTime
      });
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Normalize email for consistency
    const normalizedEmail = String(email).trim().toLowerCase();

    // Add timing jitter to prevent enumeration via response timing
    await addTimingJitter();

    const user = userDb.findByEmail(normalizedEmail);
    if (!user) {
      auditLog('login', normalizedEmail, clientIp, 'invalid_credentials', {
        latency_ms: Date.now() - startTime
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Constant-time password comparison
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      auditLog('login', normalizedEmail, clientIp, 'invalid_credentials', {
        latency_ms: Date.now() - startTime
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT with password version for session invalidation
    const token = generateToken(user.id);

    auditLog('login', normalizedEmail, clientIp, 'success', {
      latency_ms: Date.now() - startTime
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTH] User logged in:', normalizedEmail.replace(/(.{2}).*@/, '$1***@'));
    }

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        status: user.status,
        trial_expires: user.trial_expires
      }
    });

  } catch (error) {
    console.error('[AUTH] Login error:', error.message);
    auditLog('login', req.body?.email, clientIp, 'error', {
      latency_ms: Date.now() - startTime,
      error: error.message
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const now = Date.now();
    const trialExpired = user.status === 'trial' && user.trial_expires && user.trial_expires < now;

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        status: user.status,
        trial_start: user.trial_start,
        trial_expires: user.trial_expires,
        trial_expired: trialExpired,
        billing_status: user.billing_status,
        model_provider: user.model_provider,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('[AUTH] /me error:', error);
    return res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', sensitiveRateLimit, async (req, res) => {
  const startTime = Date.now();
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  try {
    const { email } = req.body;

    if (!email) {
      await addTimingJitter();
      auditLog('forgot-password', email, clientIp, 'missing_email', {
        latency_ms: Date.now() - startTime
      });
      return res.status(400).json({ error: 'Email required' });
    }

    // Normalize email for consistency
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = userDb.findByEmail(normalizedEmail);

    // Add timing jitter to prevent enumeration via response timing
    await addTimingJitter();

    // Always return success to prevent email enumeration
    if (!user) {
      auditLog('forgot-password', normalizedEmail, clientIp, 'user_not_found', {
        latency_ms: Date.now() - startTime
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AUTH] Password reset requested for non-existent email:', normalizedEmail.replace(/(.{2}).*@/, '$1***@'));
      }
      return res.json({
        success: true,
        message: 'If that email exists, a password reset code has been sent'
      });
    }

    // Generate reset token (6-digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = Date.now() + (15 * 60 * 1000); // 15 minutes

    // Hash the token before storing (never store plaintext codes)
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token to database
    userDb.updateResetToken(user.id, resetTokenHash, resetExpires);

    // Send email with reset code
    let emailSent = false;
    try {
      await sendPasswordResetCode(normalizedEmail, resetToken);
      emailSent = true;

      // Only log success in non-production
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AUTH] Password reset code sent to:', normalizedEmail.replace(/(.{2}).*@/, '$1***@'));
      }
    } catch (mailError) {
      console.error('[AUTH] Failed to send reset email:', mailError.message);
      // Continue anyway - we don't want to reveal if email exists
    }

    // Audit log
    auditLog('forgot-password', normalizedEmail, clientIp, emailSent ? 'success' : 'email_failed', {
      latency_ms: Date.now() - startTime
    });

    return res.json({
      success: true,
      message: 'If that email exists, a password reset code has been sent',
      // Include token in response ONLY in development
      dev_token: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('[AUTH] Forgot password error:', error.message);
    auditLog('forgot-password', req.body?.email, clientIp, 'error', {
      latency_ms: Date.now() - startTime,
      error: error.message
    });
    await addTimingJitter();
    return res.status(500).json({ error: 'Password reset request failed' });
  }
});

// POST /api/auth/reset-password - Complete password reset
router.post('/reset-password', sensitiveRateLimit, async (req, res) => {
  const startTime = Date.now();
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      await addTimingJitter();
      auditLog('reset-password', normalizedEmail, clientIp, 'missing_fields', {
        latency_ms: Date.now() - startTime
      });
      return res.status(400).json({ error: 'Email, token, and new password required' });
    }

    // Normalize email for consistency
    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if email is locked out due to too many failed attempts
    if (isLockedOut(normalizedEmail)) {
      await addTimingJitter();
      auditLog('reset-password', normalizedEmail, clientIp, 'locked_out', {
        latency_ms: Date.now() - startTime
      });
      return res.status(429).json({
        error: 'Too many failed attempts. Please request a new reset code.'
      });
    }

    // Validate password policy
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      await addTimingJitter();
      auditLog('reset-password', normalizedEmail, clientIp, 'weak_password', {
        latency_ms: Date.now() - startTime
      });
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    const user = userDb.findByEmail(normalizedEmail);

    // Add timing jitter to prevent enumeration
    await addTimingJitter();

    if (!user) {
      recordFailedAttempt(normalizedEmail);
      auditLog('reset-password', normalizedEmail, clientIp, 'user_not_found', {
        latency_ms: Date.now() - startTime
      });
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token exists and hasn't expired
    if (!user.password_reset_token || !user.password_reset_expires) {
      recordFailedAttempt(normalizedEmail);
      auditLog('reset-password', normalizedEmail, clientIp, 'no_token', {
        latency_ms: Date.now() - startTime
      });
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (Date.now() > user.password_reset_expires) {
      recordFailedAttempt(normalizedEmail);
      auditLog('reset-password', normalizedEmail, clientIp, 'token_expired', {
        latency_ms: Date.now() - startTime
      });
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one' });
    }

    // Hash the provided token to compare with stored hash
    const providedTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Use constant-time comparison to prevent timing attacks
    if (!safeEqualHex(user.password_reset_token, providedTokenHash)) {
      recordFailedAttempt(normalizedEmail);
      auditLog('reset-password', normalizedEmail, clientIp, 'invalid_token', {
        latency_ms: Date.now() - startTime,
        failed_attempts: failedResetAttempts.get(`failed:${normalizedEmail}`)?.count || 1
      });
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password, clear reset token, and increment password version (for session invalidation)
    userDb.updatePassword(user.id, passwordHash);
    userDb.clearResetToken(user.id);
    userDb.incrementPasswordVersion(user.id);

    // Send confirmation email
    try {
      await sendPasswordChangeConfirmation(normalizedEmail);
    } catch (mailError) {
      console.error('[AUTH] Failed to send password change confirmation:', mailError.message);
      // Don't fail the reset if email fails
    }

    // Clear failed attempts on success
    failedResetAttempts.delete(`failed:${email.toLowerCase()}`);

    // Audit log success
    auditLog('reset-password', normalizedEmail, clientIp, 'success', {
      latency_ms: Date.now() - startTime
    });

    // Only log success in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTH] Password reset successful for:', email.replace(/(.{2}).*@/, '$1***@'));
    }

    return res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password'
    });

  } catch (error) {
    console.error('[AUTH] Reset password error:', error.message);
    auditLog('reset-password', req.body?.email, clientIp, 'error', {
      latency_ms: Date.now() - startTime,
      error: error.message
    });
    await addTimingJitter();
    return res.status(500).json({ error: 'Password reset failed' });
  }
});

export default router;
