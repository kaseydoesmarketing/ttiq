import express from 'express';
import { newsletterDb } from '../utils/db.js';

const router = express.Router();

// POST /api/newsletter/signup
router.post('/signup', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email required' });
    }

    // Sanitize and validate email
    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Add to newsletter (handles deduplication internally)
    try {
      newsletterDb.add(sanitizedEmail, 'titleiq');
      console.log('[NEWSLETTER] New signup:', sanitizedEmail);
    } catch (dbError) {
      // If duplicate, still return success (already subscribed)
      if (dbError.message && dbError.message.includes('UNIQUE')) {
        console.log('[NEWSLETTER] Duplicate signup attempt:', sanitizedEmail);
        return res.json({
          success: true,
          message: 'Already subscribed!'
        });
      }
      throw dbError;
    }

    return res.json({
      success: true,
      message: 'Successfully subscribed!'
    });

  } catch (error) {
    console.error('[NEWSLETTER] Signup error:', error);
    return res.status(500).json({ success: false, error: 'Signup failed' });
  }
});

export default router;
