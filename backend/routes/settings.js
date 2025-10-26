import express from 'express';
import { userDb } from '../utils/db.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/settings/api-key
 * Save user's API key (encrypted)
 */
router.post('/api-key', authenticateToken, async (req, res) => {
  try {
    const { apiKey, provider } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!['openai', 'claude'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider. Must be "openai" or "claude"' });
    }

    // Encrypt the API key before storing
    const encryptedKey = encrypt(
      JSON.stringify({ key: apiKey, provider }),
      process.env.ENCRYPTION_SECRET
    );

    // Save to database
    userDb.updateApiKey(req.user.id, encryptedKey);

    res.json({
      success: true,
      message: 'API key saved securely'
    });
  } catch (error) {
    console.error('Save API key error:', error);
    res.status(500).json({ error: 'Failed to save API key' });
  }
});

/**
 * GET /api/settings/api-key
 * Check if user has API key (don't return the actual key)
 */
router.get('/api-key', authenticateToken, (req, res) => {
  try {
    const user = userDb.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let provider = null;
    if (user.api_key) {
      try {
        const decrypted = decrypt(user.api_key, process.env.ENCRYPTION_SECRET);
        const parsed = JSON.parse(decrypted);
        provider = parsed.provider;
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
      }
    }

    res.json({
      hasKey: !!user.api_key,
      provider
    });
  } catch (error) {
    console.error('Get API key status error:', error);
    res.status(500).json({ error: 'Failed to get API key status' });
  }
});

/**
 * DELETE /api/settings/api-key
 * Remove user's API key
 */
router.delete('/api-key', authenticateToken, (req, res) => {
  try {
    userDb.deleteApiKey(req.user.id);

    res.json({
      success: true,
      message: 'API key removed'
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

export default router;
