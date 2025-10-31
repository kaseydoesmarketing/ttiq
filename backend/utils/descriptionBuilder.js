/**
 * Description Builder Utility
 * Structured, SEO-optimized YouTube descriptions
 *
 * Features:
 * - Keyword-rich hook (1-2 sentences)
 * - "You'll see/learn" bullet points (3-5 items)
 * - Optional CTA (if user provided contact info)
 * - User links (YouTube, website, social)
 * - Content-aware hashtags (5-7 items, NO branding)
 */

import { generateContentAwareHashtags, mergeHashtags } from './hashtagGenerator.js';

/**
 * Build structured description
 *
 * @param {Object} options
 * @param {string} options.transcript - Full transcript or excerpt
 * @param {Object} options.profile - User profile data
 * @param {string[]} options.keyTakeaways - Array of key points (3-5)
 * @param {Object[]} options.resources - Array of {label, url, affiliate}
 * @param {string[]} options.hashtags - Array of hashtags (from LLM)
 * @param {string} options.leadText - Optional custom lead paragraph
 * @param {string} options.title - Video title (for hashtag generation)
 * @returns {string} - Formatted description
 */
export function buildDescription(options = {}) {
  const {
    transcript = '',
    profile = {},
    keyTakeaways = [],
    resources = [],
    hashtags = [],
    leadText = '',
    title = ''
  } = options;

  const sections = [];

  // 1. HOOK (1-2 sentences about actual content)
  const hook = leadText || generateHook(transcript, profile, title);
  sections.push(hook);

  // 2. "YOU'LL SEE/LEARN" SECTION (3-5 bullet points)
  if (keyTakeaways.length > 0) {
    sections.push(''); // Blank line
    sections.push("You'll see:");
    keyTakeaways.slice(0, 5).forEach(takeaway => {
      sections.push(`- ${takeaway}`);
    });
  }

  // 3. OPTIONAL CTA (only if user provided contact info)
  const cta = generateCTA(profile);
  if (cta) {
    sections.push(''); // Blank line
    sections.push(cta);
  }

  // 4. USER LINKS (YouTube, website, social)
  const userLinks = buildUserLinksBlock(profile);
  if (userLinks) {
    sections.push(''); // Blank line
    sections.push(userLinks);
  }

  // 5. CONTENT-AWARE HASHTAGS (5-7, NO branding)
  const contentAwareHashtags = generateContentAwareHashtags(
    title,
    transcript,
    profile,
    profile.content_type || 'long-form'
  );

  // Merge with user-provided hashtags (filtered)
  const userHashtags = profile.hashtags || [];
  const finalHashtags = mergeHashtags(
    contentAwareHashtags,
    userHashtags,
    profile.content_type || 'long-form'
  );

  if (finalHashtags.length > 0) {
    sections.push(''); // Blank line
    sections.push(finalHashtags.join(' '));
  }

  return sections.join('\n');
}

/**
 * Generate hook from transcript
 * 1-2 sentences about actual content
 */
function generateHook(transcript, profile, title) {
  // If no transcript, use title-based hook
  if (!transcript || transcript.trim().length === 0) {
    if (title) {
      return `${title} - everything you need to know.`;
    }
    return `In this video, we dive deep into ${profile.niche || 'the topic at hand'}.`;
  }

  // Extract first 200 chars of transcript as basis
  const excerpt = transcript.substring(0, 200).trim();

  // Create engaging hook based on content
  if (profile.niche) {
    return `Dive into ${profile.niche} with actionable strategies you can implement today. Perfect for ${profile.channel_size || 'creators'} looking to ${profile.primary_goal || 'level up'}.`;
  }

  return `In this episode, we explore practical insights and strategies. Whether you're just starting or looking to level up, you'll find value here.`;
}

/**
 * Generate CTA (only if user provided contact info)
 */
function generateCTA(profile) {
  // Only generate CTA if user has social links, website, or specific goal
  const hasSocialLinks = profile.social_links && Object.keys(profile.social_links).length > 0;
  const hasWebsite = profile.website_url && profile.website_url.trim().length > 0;

  if (!hasSocialLinks && !hasWebsite) {
    return null;
  }

  // Goal-based CTA
  if (profile.primary_goal) {
    const goal = profile.primary_goal.toLowerCase();

    if (goal.includes('growth') || goal.includes('subscriber')) {
      return "Subscribe for more content like this!";
    } else if (goal.includes('engagement')) {
      return "Drop a comment and let me know what you think!";
    } else if (goal.includes('monetization') || goal.includes('sales')) {
      return "Like and subscribe to support the channel!";
    } else if (goal.includes('community')) {
      return "Join the community - subscribe and hit the bell!";
    }
  }

  // Default CTA
  return "Hit subscribe for more!";
}

/**
 * Build user links block (YouTube, website, social)
 */
function buildUserLinksBlock(profile) {
  const links = [];

  // Website URL (highest priority)
  if (profile.website_url && profile.website_url.trim()) {
    links.push(`Website: ${sanitizeUrl(profile.website_url)}`);
  }

  // Social links
  const socialLinks = buildSocialLinksBlock(profile.social_links);
  if (socialLinks) {
    if (links.length > 0) {
      links.push(''); // Blank line between website and socials
    }
    links.push(socialLinks);
  }

  return links.length > 0 ? links.join('\n') : null;
}

/**
 * Build social links block
 */
function buildSocialLinksBlock(socialLinksJson) {
  let socialLinks;

  try {
    socialLinks = typeof socialLinksJson === 'string'
      ? JSON.parse(socialLinksJson)
      : socialLinksJson;
  } catch {
    return null;
  }

  if (!socialLinks || typeof socialLinks !== 'object') {
    return null;
  }

  const lines = [];

  const platforms = [
    { key: 'youtube', label: 'YouTube', emoji: '▶️' },
    { key: 'instagram', label: 'Instagram', emoji: '📸' },
    { key: 'tiktok', label: 'TikTok', emoji: '🎵' },
    { key: 'twitter', label: 'Twitter/X', emoji: '🐦' },
    { key: 'linkedin', label: 'LinkedIn', emoji: '💼' },
    { key: 'facebook', label: 'Facebook', emoji: '👥' }
  ];

  platforms.forEach(platform => {
    const url = socialLinks[platform.key];
    if (url && url.trim()) {
      lines.push(`${platform.emoji} ${platform.label}: ${sanitizeUrl(url)}`);
    }
  });

  return lines.join('\n');
}

/**
 * Sanitize URL (prevent XSS, validate format)
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  // Must start with http:// or https://
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }

  // Basic XSS prevention (no javascript:, data:, etc)
  if (trimmed.match(/^(javascript|data|vbscript):/i)) {
    return '';
  }

  return trimmed;
}

/**
 * Calculate description length
 */
export function getDescriptionLength(description) {
  return description.length;
}

/**
 * Validate description meets YouTube requirements
 */
export function validateDescription(description) {
  const errors = [];
  const length = description.length;

  if (length > 5000) {
    errors.push(`Description exceeds 5000 characters (${length}/5000)`);
  }

  // Count hashtags
  const hashtagMatches = description.match(/#\w+/g);
  const hashtagCount = hashtagMatches ? hashtagMatches.length : 0;

  if (hashtagCount > 15) {
    errors.push(`Too many hashtags (${hashtagCount}/15 max). YouTube only recognizes first 15.`);
  }

  return {
    valid: errors.length === 0,
    length,
    hashtagCount,
    errors
  };
}

/**
 * Generate description preview for UI
 */
export function previewDescription(options) {
  const description = buildDescription(options);
  const validation = validateDescription(description);

  return {
    description,
    ...validation
  };
}

export default buildDescription;
