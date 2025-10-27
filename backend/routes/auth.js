import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { userDb } from '../utils/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// POST /api/auth/register - Create new user with 3-day trial
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existing = userDb.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'user_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
    
    userDb.create(userId, email, passwordHash, {
      role: 'user',
      plan: 'trial',
      status: 'trial'
    });

    const token = generateToken(userId);
    const user = userDb.findById(userId);

    console.log('[AUTH] New user registered:', email, '(trial)');

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
    console.error('[AUTH] Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = userDb.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    console.log('[AUTH] User logged in:', email);

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
    console.error('[AUTH] Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
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

export default router;
