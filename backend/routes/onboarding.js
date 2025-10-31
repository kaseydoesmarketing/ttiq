import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { userDb } from '../utils/db.js';

const router = express.Router();

/**
 * GET /api/onboarding/status
 * Get current onboarding status for authenticated user
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = userDb.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Admin users skip onboarding
    if (user.role === 'admin') {
      return res.json({
        completed: true,
        step: 6,
        shouldShow: false,
        isAdmin: true
      });
    }

    res.json({
      completed: Boolean(user.onboarding_completed),
      step: user.onboarding_step || 0,
      shouldShow: !user.onboarding_completed,
      isAdmin: false
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

/**
 * POST /api/onboarding/update
 * Update onboarding step and data
 */
router.post('/update', authenticateToken, async (req, res) => {
  try {
    const { step, data } = req.body;

    if (typeof step !== 'number' || step < 0 || step > 6) {
      return res.status(400).json({ error: 'Invalid step number' });
    }

    // Update step
    userDb.updateOnboardingStep(req.user.id, step);

    // Update data if provided
    if (data && Object.keys(data).length > 0) {
      userDb.updateOnboardingData(req.user.id, data);
    }

    // If step is 6, mark as complete
    if (step === 6) {
      userDb.completeOnboarding(req.user.id);
    }

    res.json({
      success: true,
      step,
      completed: step === 6
    });
  } catch (error) {
    console.error('Onboarding update error:', error);
    res.status(500).json({ error: 'Failed to update onboarding' });
  }
});

/**
 * POST /api/onboarding/complete
 * Mark onboarding as complete
 */
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;

    // Save final data if provided
    if (data && Object.keys(data).length > 0) {
      userDb.updateOnboardingData(req.user.id, data);
    }

    // Mark complete
    userDb.completeOnboarding(req.user.id);

    res.json({
      success: true,
      message: 'Onboarding completed successfully'
    });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

/**
 * POST /api/onboarding/skip
 * Skip onboarding (mark as complete without data)
 */
router.post('/skip', authenticateToken, async (req, res) => {
  try {
    userDb.completeOnboarding(req.user.id);

    res.json({
      success: true,
      message: 'Onboarding skipped'
    });
  } catch (error) {
    console.error('Onboarding skip error:', error);
    res.status(500).json({ error: 'Failed to skip onboarding' });
  }
});

export default router;
