/**
 * ZEROFAIL VALIDATION: TitleIQ Onboarding Integration Tests
 * Standard Tier - Comprehensive Testing
 *
 * Tests:
 * - API endpoints (status, update, complete, skip)
 * - Authentication & authorization
 * - Data persistence
 * - Edge cases and error handling
 */

import axios from 'axios';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'https://titleiq.tightslice.com';
const TEST_EMAIL = `test-onboarding-${Date.now()}@zerofail.test`;
const TEST_PASSWORD = 'SecureTest123!';

let authToken = null;
let testUserId = null;

describe('Category 2: Backend Integration Tests', () => {

  beforeAll(async () => {
    console.log('Setting up test user...');
    try {
      // Register test user
      const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });

      if (registerResponse.data.success) {
        authToken = registerResponse.data.token;
        testUserId = registerResponse.data.user.id;
        console.log('✓ Test user created:', TEST_EMAIL);
      } else {
        throw new Error('Failed to create test user');
      }
    } catch (error) {
      console.error('Setup failed:', error.response?.data || error.message);
      throw error;
    }
  }, 30000);

  describe('Test 3.3: API Endpoints', () => {

    test('GET /api/onboarding/status - should return initial onboarding status', async () => {
      const response = await axios.get(`${API_URL}/api/onboarding/status`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('completed');
      expect(response.data).toHaveProperty('step');
      expect(response.data).toHaveProperty('shouldShow');
      expect(response.data.completed).toBe(false);
      expect(response.data.shouldShow).toBe(true);

      console.log('✓ GET /api/onboarding/status works correctly');
    });

    test('POST /api/onboarding/update - should save progress', async () => {
      const testData = {
        step: 3,
        data: {
          content_type: 'Educational',
          niche: 'Tech Reviews',
          channel_size: '10K-100K'
        }
      };

      const response = await axios.post(`${API_URL}/api/onboarding/update`, testData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.step).toBe(3);

      console.log('✓ POST /api/onboarding/update saves progress');
    });

    test('POST /api/onboarding/complete - should mark onboarding complete', async () => {
      const finalData = {
        data: {
          content_type: 'Educational',
          niche: 'Tech Reviews',
          channel_size: '10K-100K',
          primary_goal: 'Growth',
          upload_schedule: 'Weekly',
          social_links: {
            youtube: 'https://youtube.com/@testchannel',
            instagram: '',
            tiktok: '',
            twitter: '',
            linkedin: '',
            facebook: ''
          },
          hashtags: ['#tech', '#reviews', '#gadgets'],
          keywords: ['technology', 'reviews', 'unboxing'],
          demographics: {
            ageRange: '25-34',
            location: 'United States',
            interests: 'Technology, gaming'
          },
          brand_voice: 'Professional',
          competitors: ['MKBHD', 'Linus Tech Tips'],
          biggest_challenge: 'Standing out'
        }
      };

      const response = await axios.post(`${API_URL}/api/onboarding/complete`, finalData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('completed');

      console.log('✓ POST /api/onboarding/complete marks complete');
    });

    test('GET /api/onboarding/status - should show completed status', async () => {
      const response = await axios.get(`${API_URL}/api/onboarding/status`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.completed).toBe(true);
      expect(response.data.shouldShow).toBe(false);
      expect(response.data.step).toBeGreaterThanOrEqual(12);

      console.log('✓ Status correctly reflects completion');
    });
  });

  describe('Test 3.2: Authentication & Security', () => {

    test('Should reject requests without auth token', async () => {
      try {
        await axios.get(`${API_URL}/api/onboarding/status`);
        throw new Error('Should have thrown 401');
      } catch (error) {
        expect(error.response.status).toBe(401);
        console.log('✓ Rejects unauthenticated requests');
      }
    });

    test('Should reject requests with invalid token', async () => {
      try {
        await axios.get(`${API_URL}/api/onboarding/status`, {
          headers: { Authorization: 'Bearer invalid-token-12345' }
        });
        throw new Error('Should have thrown 401');
      } catch (error) {
        expect(error.response.status).toBe(401);
        console.log('✓ Rejects invalid tokens');
      }
    });
  });

  describe('Test 4.2: Input Validation', () => {

    test('Should reject invalid step numbers', async () => {
      try {
        await axios.post(`${API_URL}/api/onboarding/update`,
          { step: 99, data: {} },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        throw new Error('Should have rejected invalid step');
      } catch (error) {
        expect(error.response.status).toBe(400);
        console.log('✓ Validates step numbers');
      }
    });

    test('Should reject negative step numbers', async () => {
      try {
        await axios.post(`${API_URL}/api/onboarding/update`,
          { step: -1, data: {} },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        throw new Error('Should have rejected negative step');
      } catch (error) {
        expect(error.response.status).toBe(400);
        console.log('✓ Rejects negative step numbers');
      }
    });
  });

  afterAll(async () => {
    console.log('\nTest cleanup completed');
    console.log('Note: Test user can be manually deleted from database if needed');
  });
});

describe('Performance Tests', () => {

  test('Test 5.1: API response time should be < 500ms', async () => {
    const start = Date.now();

    const response = await axios.get(`${API_URL}`);

    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(500);

    console.log(`✓ Frontend loads in ${duration}ms (< 500ms target)`);
  });
});

console.log('\n=== ZEROFAIL VALIDATION: Onboarding Integration Tests ===\n');
