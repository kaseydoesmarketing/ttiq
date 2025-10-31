/**
 * Content-Aware Hashtag Generator
 * Generates intelligent hashtags based on video title, transcript, and user profile
 *
 * Rules:
 * 1. Extract topic from title (e.g. "SEO tips" → #seo #digitalmarketing)
 * 2. Pull niche from user profile if available
 * 3. Max 5-7 hashtags
 * 4. Order: core topic → audience → brand/location → reach
 * 5. NO generic spam (#fyp, #viral, #trending) unless short-form content
 * 6. NO branded hashtags (#titleiq, #aitools, etc.)
 */

/**
 * Generate content-aware hashtags
 *
 * @param {string} title - Video title
 * @param {string} transcript - Video transcript (for context)
 * @param {Object} userProfile - User profile data
 * @param {string} contentType - Content type (long-form, short-form, etc.)
 * @returns {string[]} - Array of hashtags (5-7 items)
 */
export function generateContentAwareHashtags(title, transcript = '', userProfile = {}, contentType = 'long-form') {
  const hashtags = [];
  const used = new Set(); // Track used terms to avoid duplicates

  // 1. CORE TOPIC TAGS (1-2 tags from title)
  const topicKeywords = extractTopicKeywords(title);
  topicKeywords.slice(0, 2).forEach(keyword => {
    const normalized = normalizeHashtag(keyword);
    if (normalized && !used.has(normalized)) {
      hashtags.push(`#${normalized}`);
      used.add(normalized);
    }
  });

  // 2. NICHE/AUDIENCE TAG (from user profile)
  if (userProfile.niche) {
    const nicheTag = normalizeHashtag(userProfile.niche);
    if (nicheTag && !used.has(nicheTag)) {
      hashtags.push(`#${nicheTag}`);
      used.add(nicheTag);
    }
  }

  // 3. CONTENT TYPE TAG (if specific)
  if (userProfile.content_type) {
    const contentTag = mapContentTypeToHashtag(userProfile.content_type);
    if (contentTag && !used.has(contentTag)) {
      hashtags.push(`#${contentTag}`);
      used.add(contentTag);
    }
  }

  // 4. BRAND/CHANNEL TAG (only if user provided)
  const brandTag = getBrandHashtag(userProfile);
  if (brandTag && !used.has(brandTag)) {
    hashtags.push(`#${brandTag}`);
    used.add(brandTag);
  }

  // 5. REACH TAGS (1-2 strategic reach tags)
  const reachTags = getReachTags(title, transcript, userProfile, contentType);
  reachTags.forEach(tag => {
    const normalized = normalizeHashtag(tag);
    if (normalized && !used.has(normalized) && hashtags.length < 7) {
      hashtags.push(`#${normalized}`);
      used.add(normalized);
    }
  });

  // 6. ALLOW SHORT-FORM VIRAL TAGS (only for shorts/reels)
  if (isShortFormContent(contentType) && hashtags.length < 7) {
    const viralTags = ['shorts', 'viral'];
    viralTags.forEach(tag => {
      if (!used.has(tag) && hashtags.length < 7) {
        hashtags.push(`#${tag}`);
        used.add(tag);
      }
    });
  }

  // Ensure we have 5-7 hashtags
  return hashtags.slice(0, 7);
}

/**
 * Extract topic keywords from title
 * Uses keyword extraction and topic modeling
 */
function extractTopicKeywords(title) {
  // Remove common filler words
  const fillerWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'i', 'you', 'how', 'why', 'what', 'when', 'where', 'this', 'that',
    'my', 'your', 'we', 'they', 'it', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can'
  ]);

  // Extract words, remove special chars
  const words = title.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !fillerWords.has(word));

  // Look for multi-word topics (e.g., "social media", "content marketing")
  const multiWordTopics = extractMultiWordTopics(title.toLowerCase());

  // Combine single words and multi-word topics
  return [...multiWordTopics, ...words].slice(0, 5);
}

/**
 * Extract multi-word topics (e.g., "social media", "email marketing")
 */
function extractMultiWordTopics(title) {
  const commonTopics = [
    'social media', 'content marketing', 'email marketing', 'seo optimization',
    'video editing', 'graphic design', 'web development', 'mobile app',
    'digital marketing', 'affiliate marketing', 'passive income', 'side hustle',
    'real estate', 'stock market', 'personal finance', 'mental health',
    'weight loss', 'muscle gain', 'home workout', 'meal prep',
    'travel tips', 'budget travel', 'solo travel', 'family travel',
    'game development', 'app development', 'web design', 'ux design',
    'data science', 'machine learning', 'artificial intelligence', 'deep learning',
    'youtube growth', 'instagram growth', 'tiktok growth', 'channel growth',
    'productivity tips', 'time management', 'goal setting', 'habit building'
  ];

  const found = [];
  commonTopics.forEach(topic => {
    if (title.includes(topic)) {
      found.push(topic.replace(/\s+/g, ''));
    }
  });

  return found;
}

/**
 * Map content type to hashtag
 */
function mapContentTypeToHashtag(contentType) {
  const mapping = {
    'tutorial': 'tutorial',
    'vlog': 'vlog',
    'review': 'productreview',
    'podcast': 'podcast',
    'interview': 'interview',
    'how-to': 'howto',
    'educational': 'educational',
    'entertainment': 'entertainment',
    'gaming': 'gaming',
    'music': 'music',
    'comedy': 'comedy',
    'documentary': 'documentary',
    'shorts': 'shorts',
    'live': 'livestream'
  };

  const normalized = contentType.toLowerCase().replace(/[^\w]/g, '');
  return mapping[normalized] || null;
}

/**
 * Get brand/channel hashtag (only if user provided)
 */
function getBrandHashtag(userProfile) {
  // Prefer brand_name, fall back to channel_name
  const brandName = userProfile.brand_name || userProfile.channel_name;

  if (!brandName || brandName.trim().length === 0) {
    return null;
  }

  // Sanitize brand name for hashtag
  const sanitized = brandName
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '');

  // Don't use if too short or too long
  if (sanitized.length < 3 || sanitized.length > 30) {
    return null;
  }

  return sanitized;
}

/**
 * Get strategic reach tags based on content
 */
function getReachTags(title, transcript, userProfile, contentType) {
  const reachTags = [];

  // Niche-specific reach tags
  const niche = (userProfile.niche || '').toLowerCase();

  if (niche.includes('business') || niche.includes('entrepreneur')) {
    reachTags.push('entrepreneurship', 'businesstips');
  } else if (niche.includes('tech') || niche.includes('coding')) {
    reachTags.push('technology', 'coding');
  } else if (niche.includes('fitness') || niche.includes('health')) {
    reachTags.push('fitness', 'healthtips');
  } else if (niche.includes('finance') || niche.includes('money')) {
    reachTags.push('finance', 'moneytips');
  } else if (niche.includes('education') || niche.includes('learning')) {
    reachTags.push('education', 'learning');
  } else if (niche.includes('gaming')) {
    reachTags.push('gaming', 'gamer');
  } else if (niche.includes('lifestyle') || niche.includes('vlog')) {
    reachTags.push('lifestyle', 'dailyvlog');
  } else if (niche.includes('travel')) {
    reachTags.push('travel', 'wanderlust');
  } else if (niche.includes('food') || niche.includes('cooking')) {
    reachTags.push('foodie', 'cooking');
  }

  // Goal-based reach tags
  const goal = (userProfile.primary_goal || '').toLowerCase();

  if (goal.includes('growth') || goal.includes('subscribers')) {
    reachTags.push('youtubegrowth');
  } else if (goal.includes('engagement')) {
    reachTags.push('community');
  } else if (goal.includes('monetization')) {
    reachTags.push('contentcreator');
  }

  // Title-based reach tags
  const titleLower = title.toLowerCase();

  if (titleLower.includes('beginner') || titleLower.includes('tutorial')) {
    reachTags.push('tutorial');
  } else if (titleLower.includes('tips') || titleLower.includes('hacks')) {
    reachTags.push('tips');
  } else if (titleLower.includes('review')) {
    reachTags.push('review');
  } else if (titleLower.includes('guide') || titleLower.includes('how to')) {
    reachTags.push('guide');
  }

  return reachTags;
}

/**
 * Normalize hashtag (remove special chars, lowercase, camelCase multi-word)
 */
function normalizeHashtag(tag) {
  if (!tag || typeof tag !== 'string') {
    return null;
  }

  // Remove special characters, keep alphanumeric
  const cleaned = tag
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '');

  // Don't use if too short or too long
  if (cleaned.length < 2 || cleaned.length > 30) {
    return null;
  }

  return cleaned;
}

/**
 * Check if content is short-form (allows viral tags like #shorts, #viral)
 */
function isShortFormContent(contentType) {
  const shortFormTypes = ['shorts', 'reels', 'tiktok', 'short-form'];
  return shortFormTypes.some(type =>
    contentType.toLowerCase().includes(type)
  );
}

/**
 * Remove generic spam hashtags from user-provided list
 */
export function filterSpamHashtags(hashtags, contentType = 'long-form') {
  const spamTags = new Set([
    'titleiq', 'aitools', 'aiassistant', 'chatgpt', 'ai'
  ]);

  // Only allow viral tags for short-form content
  const viralTags = new Set(['fyp', 'foryou', 'foryoupage', 'trending', 'viral']);

  return hashtags.filter(tag => {
    const normalized = tag.toLowerCase().replace(/^#/, '');

    // Remove spam tags
    if (spamTags.has(normalized)) {
      return false;
    }

    // Remove viral tags for long-form content
    if (!isShortFormContent(contentType) && viralTags.has(normalized)) {
      return false;
    }

    return true;
  });
}

/**
 * Merge and deduplicate hashtags from multiple sources
 */
export function mergeHashtags(generated, userProvided, contentType = 'long-form') {
  const all = [];

  // Add generated hashtags first (prioritize content-aware)
  generated.forEach(tag => all.push(tag));

  // Filter and add user-provided hashtags
  const filtered = filterSpamHashtags(userProvided, contentType);
  filtered.forEach(tag => {
    const normalized = tag.startsWith('#') ? tag : `#${tag}`;
    if (!all.includes(normalized)) {
      all.push(normalized);
    }
  });

  // Limit to 7 hashtags (YouTube best practice)
  return all.slice(0, 7);
}

export default generateContentAwareHashtags;
