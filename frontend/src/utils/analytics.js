/**
 * Analytics Tracking Stub for TitleIQ
 *
 * This is a no-op implementation that provides hooks for future analytics integration.
 * When ready to add analytics (PostHog, Umami, Mixpanel, etc.), wire up this module.
 *
 * Usage:
 *   import { track } from '../utils/analytics';
 *   track('generate_request', { plan: user?.plan, transcriptLength: 1234 });
 */

/**
 * Track an event
 * @param {string} eventName - Name of the event (e.g., 'generate_request')
 * @param {Object} payload - Event properties/metadata
 */
export const track = (eventName, payload = {}) => {
  // Future: Wire this to PostHog, Umami, or your analytics provider
  // Example PostHog integration:
  //   if (window.posthog) {
  //     window.posthog.capture(eventName, payload);
  //   }

  // For now, log to console in development/debug mode only
  if (typeof window !== 'undefined' && window.DEBUG_ANALYTICS) {
    console.log('[analytics]', eventName, payload);
  }

  // Store events in memory for debugging (optional)
  if (typeof window !== 'undefined') {
    if (!window.__titleiq_analytics_buffer) {
      window.__titleiq_analytics_buffer = [];
    }
    window.__titleiq_analytics_buffer.push({
      event: eventName,
      payload,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 events
    if (window.__titleiq_analytics_buffer.length > 50) {
      window.__titleiq_analytics_buffer.shift();
    }
  }
};

/**
 * Identify a user (for user-scoped analytics)
 * @param {string} userId - User ID
 * @param {Object} traits - User traits (email, plan, etc.)
 */
export const identify = (userId, traits = {}) => {
  // Future: Wire this to your analytics provider
  // Example PostHog integration:
  //   if (window.posthog) {
  //     window.posthog.identify(userId, traits);
  //   }

  if (typeof window !== 'undefined' && window.DEBUG_ANALYTICS) {
    console.log('[analytics] identify:', userId, traits);
  }
};

/**
 * Track a page view
 * @param {string} pageName - Page name or path
 */
export const page = (pageName) => {
  // Future: Wire this to your analytics provider
  // Example PostHog integration:
  //   if (window.posthog) {
  //     window.posthog.capture('$pageview', { page: pageName });
  //   }

  if (typeof window !== 'undefined' && window.DEBUG_ANALYTICS) {
    console.log('[analytics] page:', pageName);
  }
};

/**
 * Enable debug mode to see analytics events in console
 * Call this in browser console: window.enableAnalyticsDebug()
 */
if (typeof window !== 'undefined') {
  window.enableAnalyticsDebug = () => {
    window.DEBUG_ANALYTICS = true;
    console.log('[analytics] Debug mode enabled. You will now see all analytics events.');
  };

  window.disableAnalyticsDebug = () => {
    window.DEBUG_ANALYTICS = false;
    console.log('[analytics] Debug mode disabled.');
  };

  window.getAnalyticsBuffer = () => {
    return window.__titleiq_analytics_buffer || [];
  };
}

export default {
  track,
  identify,
  page
};
