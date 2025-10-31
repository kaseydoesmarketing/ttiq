/**
 * Description Builder Utility
 * Structured, SEO-optimized YouTube descriptions
 *
 * Features:
 * - Keyword-rich lead paragraph
 * - Key takeaways (bullet points)
 * - Resources & links (sanitized)
 * - Social links block
 * - Hashtags (max 10)
 */

/**
 * Build structured description
 *
 * @param {Object} options
 * @param {string} options.transcript - Full transcript or excerpt
 * @param {Object} options.profile - User profile data
 * @param {string[]} options.keyTakeaways - Array of key points (3-5)
 * @param {Object[]} options.resources - Array of {label, url, affiliate}
 * @param {string[]} options.hashtags - Array of hashtags (max 10)
 * @param {string} options.leadText - Optional custom lead paragraph
 * @returns {string} - Formatted description
 */
export function buildDescription(options = {}) {
  const {
    transcript = '',
    profile = {},
    keyTakeaways = [],
    resources = [],
    hashtags = [],
    leadText = ''
  } = options;

  const sections = [];

  // 1. LEAD PARAGRAPH (2-3 lines, keyword-rich)
  const lead = leadText || generateLeadParagraph(transcript, profile);
  sections.push(lead);

  // 2. KEY TAKEAWAYS (if provided)
  if (keyTakeaways.length > 0) {
    sections.push(''); // Blank line
    sections.push('🎯 Key Takeaways:');
    keyTakeaways.slice(0, 5).forEach(takeaway => {
      sections.push(`• ${takeaway}`);
    });
  }

  // 3. RESOURCES & LINKS (if provided)
  if (resources.length > 0) {
    sections.push(''); // Blank line
    sections.push('🔗 Resources:');

    resources.forEach(resource => {
      if (resource.url) {
        sections.push(`${resource.label}: ${sanitizeUrl(resource.url)}`);
      }
    });

    // Affiliate disclosure if any resource is affiliate link
    const hasAffiliate = resources.some(r => r.affiliate);
    if (hasAffiliate) {
      sections.push('');
      sections.push('*Some links above are affiliate links, which means I may earn a commission at no extra cost to you.');
    }
  }

  // 4. SOCIAL LINKS (from profile)
  const socialLinks = buildSocialLinksBlock(profile.social_links);
  if (socialLinks) {
    sections.push(''); // Blank line
    sections.push('📱 Connect with me:');
    sections.push(socialLinks);
  }

  // 5. HASHTAGS (max 10)
  const finalHashtags = buildHashtagsLine(hashtags, profile.hashtags);
  if (finalHashtags) {
    sections.push(''); // Blank line
    sections.push(finalHashtags);
  }

  return sections.join('\n');
}

/**
 * Generate lead paragraph from transcript
 * 2-3 sentences, keyword-rich
 */
function generateLeadParagraph(transcript, profile) {
  // If no transcript, use generic lead
  if (!transcript || transcript.trim().length === 0) {
    return `In this video, we dive deep into ${profile.niche || 'the topic at hand'}. Whether you're just getting started or looking to level up, you'll find actionable insights here.`;
  }

  // Extract first 200 chars of transcript as basis
  const excerpt = transcript.substring(0, 200).trim();

  // Simple lead template (in production, this would use AI)
  return `In this episode, we explore ${profile.niche || 'key topics'} with practical strategies you can implement today. Perfect for ${profile.channel_size || 'creators'} looking to ${profile.primary_goal || 'grow their channel'}.`;
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
 * Build hashtags line (max 10)
 */
function buildHashtagsLine(primaryHashtags, profileHashtagsJson) {
  let allHashtags = [...primaryHashtags];

  // Add profile hashtags if available
  if (profileHashtagsJson) {
    try {
      const profileHashtags = typeof profileHashtagsJson === 'string'
        ? JSON.parse(profileHashtagsJson)
        : profileHashtagsJson;

      if (Array.isArray(profileHashtags)) {
        allHashtags = [...allHashtags, ...profileHashtags];
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Deduplicate and limit to 10
  const uniqueHashtags = [...new Set(allHashtags)]
    .filter(tag => tag && tag.trim())
    .map(tag => tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`)
    .slice(0, 10);

  if (uniqueHashtags.length === 0) {
    return null;
  }

  return uniqueHashtags.join(' ');
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
