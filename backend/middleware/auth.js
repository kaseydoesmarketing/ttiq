import jwt from 'jsonwebtoken';
import { userDb } from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-this-in-production';

/**
 * JWT Authentication Middleware
 * Attaches user to req.user if valid token provided
 * Also validates password_version to invalidate tokens after password reset
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = userDb.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if password has been changed since token was issued
    const currentPasswordVersion = user.password_version || 1;
    const tokenPasswordVersion = decoded.passwordVersion || 1;

    if (tokenPasswordVersion !== currentPasswordVersion) {
      return res.status(401).json({
        error: 'Session expired. Please log in again.',
        reason: 'password_changed'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional authentication - attaches user if token present, otherwise continues
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = userDb.findById(decoded.userId);
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }

  next();
}

/**
 * Admin-only middleware
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

/**
 * Generate JWT for user
 * Includes password_version for session invalidation on password change
 */
export function generateToken(userId) {
  const user = userDb.findById(userId);
  const passwordVersion = user?.password_version || 1;

  return jwt.sign(
    {
      userId,
      passwordVersion
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}
