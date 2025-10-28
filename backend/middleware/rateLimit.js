/**
 * Rate Limiting Middleware for TitleIQ
 *
 * Prevents abuse by limiting high-cost operations (transcript fetch, title generation)
 * to a reasonable number of requests per IP per hour.
 *
 * Uses in-memory storage with TTL for simplicity. For production scale, consider Redis.
 */

// Simple in-memory store with TTL
const rateLimitStore = new Map();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.expiresAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Create a rate limiter middleware
 * @param {number} maxRequests - Maximum number of requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Express middleware
 */
export function createRateLimiter(maxRequests = 30, windowMs = 60 * 60 * 1000) {
  return (req, res, next) => {
    try {
      // Use IP address as the key (or user ID if authenticated)
      const identifier = req.user?.id || req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const key = `ratelimit:${identifier}`;

      const now = Date.now();
      const entry = rateLimitStore.get(key);

      if (!entry || entry.expiresAt < now) {
        // Create new entry
        rateLimitStore.set(key, {
          count: 1,
          expiresAt: now + windowMs,
          firstRequest: now
        });
        return next();
      }

      // Increment count
      entry.count += 1;

      // Check if limit exceeded
      if (entry.count > maxRequests) {
        const remainingTime = Math.ceil((entry.expiresAt - now) / 1000 / 60); // minutes

        console.warn(`[RATE_LIMIT] Limit exceeded for ${identifier}: ${entry.count} requests`);

        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          limit: maxRequests,
          retryAfter: remainingTime,
          used: entry.count
        });
      }

      // Update entry
      rateLimitStore.set(key, entry);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.expiresAt / 1000));

      next();
    } catch (error) {
      // If rate limiting fails, log but don't block the request
      console.error('[RATE_LIMIT] Error in rate limiter:', error);
      next();
    }
  };
}

/**
 * Aggressive rate limiter for high-cost operations like transcript fetch
 * 30 requests per hour per IP
 */
export const aggressiveRateLimit = createRateLimiter(30, 60 * 60 * 1000);

/**
 * Standard rate limiter for generation endpoints
 * 60 requests per hour per IP (on top of plan quotas)
 */
export const standardRateLimit = createRateLimiter(60, 60 * 60 * 1000);

/**
 * Lenient rate limiter for auth endpoints
 * 20 requests per 15 minutes per IP
 */
export const authRateLimit = createRateLimiter(20, 15 * 60 * 1000);

/**
 * Create a sensitive rate limiter that tracks both IP and email
 * Used for password reset endpoints to prevent abuse
 * @param {number} maxRequestsPerIP - Max requests per IP
 * @param {number} windowMsIP - Time window for IP limiting
 * @param {number} maxRequestsPerEmail - Max requests per email
 * @param {number} windowMsEmail - Time window for email limiting
 * @returns {Function} Express middleware
 */
export function createSensitiveRateLimiter(
  maxRequestsPerIP = 5,
  windowMsIP = 15 * 60 * 1000,
  maxRequestsPerEmail = 5,
  windowMsEmail = 60 * 60 * 1000
) {
  return (req, res, next) => {
    try {
      const now = Date.now();

      // Check IP-based rate limit
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const ipKey = `sensitive:ip:${ip}`;
      const ipEntry = rateLimitStore.get(ipKey);

      if (!ipEntry || ipEntry.expiresAt < now) {
        rateLimitStore.set(ipKey, {
          count: 1,
          expiresAt: now + windowMsIP,
          firstRequest: now
        });
      } else {
        ipEntry.count += 1;

        if (ipEntry.count > maxRequestsPerIP) {
          console.warn(`[RATE_LIMIT] [SENSITIVE] IP limit exceeded: ${ip} (${ipEntry.count} requests)`);

          // Return generic message to prevent enumeration
          return res.status(429).json({
            error: 'Too many requests. Please try again later.'
          });
        }

        rateLimitStore.set(ipKey, ipEntry);
      }

      // Check email-based rate limit (if email provided in body)
      const email = req.body?.email;
      if (email) {
        const emailKey = `sensitive:email:${email.toLowerCase()}`;
        const emailEntry = rateLimitStore.get(emailKey);

        if (!emailEntry || emailEntry.expiresAt < now) {
          rateLimitStore.set(emailKey, {
            count: 1,
            expiresAt: now + windowMsEmail,
            firstRequest: now
          });
        } else {
          emailEntry.count += 1;

          if (emailEntry.count > maxRequestsPerEmail) {
            console.warn(`[RATE_LIMIT] [SENSITIVE] Email limit exceeded: ${email.replace(/(.{2}).*@/, '$1***@')} (${emailEntry.count} requests)`);

            // Return generic message to prevent enumeration
            return res.status(429).json({
              error: 'Too many requests. Please try again later.'
            });
          }

          rateLimitStore.set(emailKey, emailEntry);
        }
      }

      next();
    } catch (error) {
      console.error('[RATE_LIMIT] [SENSITIVE] Error in sensitive rate limiter:', error);
      next(); // Fail open to avoid blocking legitimate users
    }
  };
}

/**
 * Strict rate limiter for password reset endpoints
 * 5 requests per 15 minutes per IP, 5 requests per hour per email
 */
export const sensitiveRateLimit = createSensitiveRateLimiter(5, 15 * 60 * 1000, 5, 60 * 60 * 1000);

export default {
  createRateLimiter,
  createSensitiveRateLimiter,
  aggressiveRateLimit,
  standardRateLimit,
  authRateLimit,
  sensitiveRateLimit
};
