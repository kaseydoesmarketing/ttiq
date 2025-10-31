/**
 * Title Builder Utility
 * Smart title assembly with YouTube's 100-character limit
 *
 * Features:
 * - Smart truncation (never mid-word)
 * - De-duplication (if brand === channel)
 * - Preference-driven customization
 * - Emoji-aware character counting
 */

/**
 * Build optimized title from core title + optional metadata
 *
 * @param {string} coreTitle - The main hook/title
 * @param {Object} options
 * @param {string} options.brand - Brand name
 * @param {string} options.channel - Channel/podcast name
 * @param {string} options.episode - Episode number (e.g., "42", "S2E5")
 * @param {Object} options.preferences - User preferences {includeBrand, includeChannel, includeEpisode}
 * @returns {string} - Optimized title (≤100 chars)
 */
export function buildTitle(coreTitle, options = {}) {
  const {
    brand = '',
    channel = '',
    episode = '',
    preferences = {}
  } = options;

  const {
    includeBrand = false,
    includeChannel = false,
    includeEpisode = false
  } = preferences;

  // Start with core title (trimmed)
  let title = coreTitle.trim();

  // Build suffix parts array
  const parts = [];

  // Add brand if requested and different from channel
  if (includeBrand && brand && brand.trim()) {
    const brandTrimmed = brand.trim();
    // Only add if not duplicate of channel
    if (!includeChannel || brandTrimmed.toLowerCase() !== channel.trim().toLowerCase()) {
      parts.push(brandTrimmed);
    }
  }

  // Add channel if requested
  if (includeChannel && channel && channel.trim()) {
    parts.push(channel.trim());
  }

  // Add episode if requested
  if (includeEpisode && episode && episode.trim()) {
    const episodeTrimmed = episode.trim();
    // Format episode nicely
    const episodeFormatted = episodeTrimmed.match(/^\d+$/)
      ? `Ep. ${episodeTrimmed}`
      : episodeTrimmed;
    parts.push(episodeFormatted);
  }

  // If no suffix parts, return core title (truncated to 100 if needed)
  if (parts.length === 0) {
    return smartTruncate(title, 100);
  }

  // Build full title with separator
  const suffix = parts.join(' | ');
  const fullTitle = `${title} | ${suffix}`;

  // If under 100 chars, return as-is
  if (fullTitle.length <= 100) {
    return fullTitle;
  }

  // Over 100 chars - need to truncate
  // Strategy: Preserve suffix, truncate core title from right
  const suffixLength = suffix.length + 3; // " | " separator
  const availableForCore = 100 - suffixLength;

  if (availableForCore < 20) {
    // Suffix is too long, truncate entire title
    return smartTruncate(title, 100);
  }

  // Truncate core title to fit
  const truncatedCore = smartTruncate(title, availableForCore);
  return `${truncatedCore} | ${suffix}`;
}

/**
 * Smart truncate - never cuts mid-word
 * Adds ellipsis (...) if truncated
 *
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function smartTruncate(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  // Reserve 3 chars for ellipsis
  const cutoff = maxLength - 3;

  // Find last space before cutoff
  let truncateAt = cutoff;
  for (let i = cutoff; i > Math.max(0, cutoff - 20); i--) {
    if (text[i] === ' ') {
      truncateAt = i;
      break;
    }
  }

  // Truncate and add ellipsis
  return text.substring(0, truncateAt).trim() + '...';
}

/**
 * Calculate character count (emoji-aware)
 *
 * @param {string} text
 * @returns {number}
 */
export function getCharacterCount(text) {
  // Use Array.from to handle multi-byte characters (emojis)
  return Array.from(text).length;
}

/**
 * Validate title meets YouTube requirements
 *
 * @param {string} title
 * @returns {Object} {valid: boolean, length: number, errors: string[]}
 */
export function validateTitle(title) {
  const errors = [];
  const length = getCharacterCount(title);

  if (!title || title.trim().length === 0) {
    errors.push('Title cannot be empty');
  }

  if (length > 100) {
    errors.push(`Title exceeds 100 characters (${length}/100)`);
  }

  if (length < 10) {
    errors.push('Title should be at least 10 characters');
  }

  return {
    valid: errors.length === 0,
    length,
    errors
  };
}

/**
 * Generate title preview for UI
 *
 * @param {string} coreTitle
 * @param {Object} options
 * @returns {Object} {title: string, length: number, truncated: boolean}
 */
export function previewTitle(coreTitle, options = {}) {
  const title = buildTitle(coreTitle, options);
  const length = getCharacterCount(title);
  const truncated = length > coreTitle.length + 10; // Rough heuristic

  return {
    title,
    length,
    truncated,
    valid: length <= 100,
    remaining: 100 - length
  };
}

export default buildTitle;
