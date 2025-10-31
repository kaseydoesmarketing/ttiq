/**
 * Description Generator Pro
 * 4-Layout Premium Description Generator with Agent Routing
 *
 * Agent Architecture:
 * 1. Layout Architect - Determines best layout types for user
 * 2. SEO Weaver - Creates keyword-rich summary
 * 3. Link Stylist - Formats links and CTAs beautifully
 * 4. Brand Guardian - Enforces style and character limits
 *
 * Layouts:
 * A: Creator/Educational (Think Media style)
 * B: Show/Podcast (Shawn Ryan style)
 * C: News/Commentary (Daily Show style)
 * D: Tech/Product Review (MKBHD style)
 */

/**
 * AGENT 1: Layout Architect
 * Determines which 4 archetypes to use based on content type
 */
function selectLayouts(userData, videoTitle) {
  // Always return all 4 layouts - user can choose their favorite
  return ['creator', 'podcast', 'news', 'tech'];
}

/**
 * AGENT 2: SEO Weaver
 * Generates keyword-rich summary for first 1-2 lines
 */
function generateSEOSummary(videoTitle, channelName, contentType) {
  // Extract key phrases from title
  const titleLower = videoTitle.toLowerCase();

  // Build contextual summary
  if (contentType === 'Educational') {
    return `In this ${channelName ? channelName + ' ' : ''}tutorial, we dive into ${videoTitle}. Perfect for anyone looking to master this topic and level up their skills.`;
  } else if (contentType === 'Podcast') {
    return `Welcome to this episode where we explore ${videoTitle}. Get ready for insights, stories, and actionable takeaways.`;
  } else if (contentType === 'News') {
    return `Breaking down ${videoTitle} - what you need to know, why it matters, and what's next.`;
  } else if (contentType === 'Tech Review') {
    return `Hands-on review of ${videoTitle}. Full specs, real-world testing, and honest opinions.`;
  } else if (contentType === 'Business') {
    return `${videoTitle} - strategies and insights for growing your business in 2025.`;
  } else {
    return `${videoTitle} - everything you need to know.`;
  }
}

/**
 * AGENT 3: Link Stylist
 * Formats links beautifully with auto-hiding empty fields
 */
function formatLinks(userData) {
  const links = {
    socials: [],
    offers: [],
    affiliates: [],
    platforms: []
  };

  // Parse social_links (may be string or object)
  let socialLinks = {};
  try {
    socialLinks = typeof userData.social_links === 'string'
      ? JSON.parse(userData.social_links)
      : (userData.social_links || {});
  } catch (e) {
    socialLinks = {};
  }

  // Social media links
  const socialPlatforms = [
    { key: 'instagram', label: 'Instagram', emoji: '📸' },
    { key: 'twitter', label: 'Twitter/X', emoji: '🐦' },
    { key: 'tiktok', label: 'TikTok', emoji: '🎵' },
    { key: 'facebook', label: 'Facebook', emoji: '👥' }
  ];

  socialPlatforms.forEach(platform => {
    const url = socialLinks[platform.key];
    if (url && url.trim()) {
      links.socials.push({ label: platform.label, url: sanitizeUrl(url), emoji: platform.emoji });
    }
  });

  // Platform links (YouTube, podcast)
  if (socialLinks.youtube && socialLinks.youtube.trim()) {
    links.platforms.push({ label: 'YouTube', url: sanitizeUrl(socialLinks.youtube), emoji: '📺' });
  }
  if (socialLinks.podcast_apple && socialLinks.podcast_apple.trim()) {
    links.platforms.push({ label: 'Apple Podcasts', url: sanitizeUrl(socialLinks.podcast_apple), emoji: '🎙️' });
  }
  if (socialLinks.podcast_spotify && socialLinks.podcast_spotify.trim()) {
    links.platforms.push({ label: 'Spotify', url: sanitizeUrl(socialLinks.podcast_spotify), emoji: '🎧' });
  }

  // Offers/CTAs
  if (userData.primary_offer_label && userData.primary_offer_url) {
    links.offers.push({
      label: userData.primary_offer_label,
      url: sanitizeUrl(userData.primary_offer_url)
    });
  }
  if (userData.secondary_offer_label && userData.secondary_offer_url) {
    links.offers.push({
      label: userData.secondary_offer_label,
      url: sanitizeUrl(userData.secondary_offer_url)
    });
  }

  // Affiliates
  if (userData.affiliates && Array.isArray(userData.affiliates)) {
    userData.affiliates.forEach(aff => {
      if (aff.label && aff.url) {
        links.affiliates.push({ label: aff.label, url: sanitizeUrl(aff.url) });
      }
    });
  }

  return links;
}

/**
 * AGENT 4: Brand Guardian
 * Enforces style rules and character limits
 */
function enforceStyle(description) {
  // Remove any TitleIQ branding
  let cleaned = description.replace(/TitleIQ|titleiq/gi, '');

  // Validate character count
  if (cleaned.length > 5000) {
    cleaned = cleaned.substring(0, 4997) + '...';
  }

  // Ensure proper spacing
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines

  return cleaned.trim();
}

/**
 * Sanitize URL helper
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

  // Basic XSS prevention
  if (trimmed.match(/^(javascript|data|vbscript):/i)) {
    return '';
  }

  return trimmed;
}

/**
 * LAYOUT A: Creator/Educational (Think Media style)
 */
function buildCreatorLayout(videoTitle, userData, timestamps = []) {
  const sections = [];

  // Hook line
  sections.push(generateSEOSummary(videoTitle, userData.brand_name, userData.content_type));
  sections.push('');

  // Timestamps (if provided)
  if (timestamps && timestamps.length > 0) {
    sections.push('⏱️ TIMESTAMPS:');
    timestamps.forEach(ts => {
      sections.push(`${ts.time} - ${ts.label}`);
    });
    sections.push('');
  }

  // Links
  const links = formatLinks(userData);

  // Resources/Affiliates
  if (links.affiliates.length > 0) {
    sections.push('📚 RESOURCES:');
    links.affiliates.forEach(aff => {
      sections.push(`• ${aff.label}: ${aff.url}`);
    });
    sections.push('');
  }

  // Connect section
  const connectItems = [];
  if (userData.website_url && userData.website_url.trim()) {
    connectItems.push(`Website: ${sanitizeUrl(userData.website_url)}`);
  }
  links.socials.forEach(social => {
    connectItems.push(`${social.emoji} ${social.label}: ${social.url}`);
  });

  if (connectItems.length > 0) {
    sections.push('🔗 CONNECT:');
    connectItems.forEach(item => sections.push(item));
    sections.push('');
  }

  // Offers/CTAs
  if (links.offers.length > 0) {
    links.offers.forEach(offer => {
      sections.push(`📧 ${offer.label}: ${offer.url}`);
    });
    sections.push('');
  }

  // Contact email
  if (userData.contact_email && userData.contact_email.trim()) {
    sections.push(`📩 Contact: ${userData.contact_email}`);
    sections.push('');
  }

  // Hashtags (simple generic ones based on title)
  const hashtags = generateHashtags(videoTitle, userData.content_type);
  if (hashtags.length > 0) {
    sections.push(hashtags.join(' '));
  }

  return enforceStyle(sections.join('\n'));
}

/**
 * LAYOUT B: Show/Podcast (Shawn Ryan style)
 */
function buildPodcastLayout(videoTitle, userData) {
  const sections = [];

  // Episode opener
  sections.push(`In this episode: ${videoTitle}`);
  sections.push('');

  const links = formatLinks(userData);

  // Platforms
  if (links.platforms.length > 0) {
    sections.push('📺 WATCH/LISTEN:');
    links.platforms.forEach(platform => {
      sections.push(`${platform.emoji} ${platform.label}: ${platform.url}`);
    });
    sections.push('');
  }

  // Follow the show
  const followItems = [];
  if (userData.website_url && userData.website_url.trim()) {
    followItems.push(`🌐 Website: ${sanitizeUrl(userData.website_url)}`);
  }
  links.socials.forEach(social => {
    followItems.push(`${social.emoji} ${social.label}: ${social.url}`);
  });

  if (followItems.length > 0) {
    sections.push('🎙️ FOLLOW THE SHOW:');
    followItems.forEach(item => sections.push(item));
    sections.push('');
  }

  // Sponsor mention
  if (userData.sponsor_mention && userData.sponsor_mention.trim()) {
    sections.push('🤝 PARTNERS:');
    sections.push(userData.sponsor_mention);
    sections.push('');
  }

  // Affiliates
  if (links.affiliates.length > 0) {
    if (!userData.sponsor_mention || !userData.sponsor_mention.trim()) {
      sections.push('🤝 PARTNERS:');
    }
    links.affiliates.forEach(aff => {
      sections.push(`• ${aff.label}: ${aff.url}`);
    });
    sections.push('');
  }

  // Offers
  if (links.offers.length > 0) {
    links.offers.forEach(offer => {
      sections.push(`${offer.label}: ${offer.url}`);
    });
    sections.push('');
  }

  // Hashtags
  const hashtags = generateHashtags(videoTitle, 'Podcast');
  if (hashtags.length > 0) {
    sections.push(hashtags.join(' '));
  }

  return enforceStyle(sections.join('\n'));
}

/**
 * LAYOUT C: News/Commentary (Daily Show style)
 */
function buildNewsLayout(videoTitle, userData) {
  const sections = [];

  // Today's breakdown
  sections.push(`In today's breakdown, we cover ${videoTitle}.`);
  sections.push('');

  // What we discuss (placeholder - could be enhanced with AI)
  sections.push('What we discuss:');
  sections.push('• Key points from this story');
  sections.push('• What it means for you');
  sections.push('• Expert analysis');
  sections.push('• What to watch next');
  sections.push('');

  const links = formatLinks(userData);

  // Sources/Resources
  if (links.affiliates.length > 0) {
    sections.push('📰 SOURCES & RESOURCES:');
    links.affiliates.forEach(aff => {
      sections.push(`• ${aff.label}: ${aff.url}`);
    });
    sections.push('');
  }

  // Follow for more
  const followItems = [];
  if (userData.website_url && userData.website_url.trim()) {
    followItems.push(`🌐 Website: ${sanitizeUrl(userData.website_url)}`);
  }
  links.socials.forEach(social => {
    followItems.push(`${social.emoji} ${social.label}: ${social.url}`);
  });

  if (followItems.length > 0) {
    sections.push('🗞️ FOLLOW FOR MORE:');
    followItems.forEach(item => sections.push(item));
    sections.push('');
  }

  // Offers
  if (links.offers.length > 0) {
    links.offers.forEach(offer => {
      sections.push(`${offer.label}: ${offer.url}`);
    });
    sections.push('');
  }

  // Hashtags
  const hashtags = generateHashtags(videoTitle, 'News');
  if (hashtags.length > 0) {
    sections.push(hashtags.join(' '));
  }

  return enforceStyle(sections.join('\n'));
}

/**
 * LAYOUT D: Tech/Product Review (MKBHD style)
 */
function buildTechLayout(videoTitle, userData) {
  const sections = [];

  // Review opener
  sections.push(`In this video, we test/review ${videoTitle}.`);
  sections.push('');

  const links = formatLinks(userData);

  // Product links (from affiliates)
  if (links.affiliates.length > 0) {
    sections.push('🛒 PRODUCT LINKS:');
    links.affiliates.forEach(aff => {
      sections.push(`• ${aff.label}: ${aff.url}`);
    });
    sections.push('');
  }

  // Connect section
  const connectItems = [];
  if (userData.website_url && userData.website_url.trim()) {
    connectItems.push(`🌐 Website: ${sanitizeUrl(userData.website_url)}`);
  }
  links.socials.forEach(social => {
    connectItems.push(`${social.emoji} ${social.label}: ${social.url}`);
  });

  if (connectItems.length > 0) {
    sections.push('🔗 CONNECT:');
    connectItems.forEach(item => sections.push(item));
    sections.push('');
  }

  // Newsletter/offers
  if (links.offers.length > 0) {
    links.offers.forEach(offer => {
      sections.push(`📧 ${offer.label}: ${offer.url}`);
    });
    sections.push('');
  }

  // Hashtags
  const hashtags = generateHashtags(videoTitle, 'Tech Review');
  if (hashtags.length > 0) {
    sections.push(hashtags.join(' '));
  }

  return enforceStyle(sections.join('\n'));
}

/**
 * Generate simple hashtags based on title and content type
 */
function generateHashtags(videoTitle, contentType) {
  const hashtags = [];

  // Content type hashtag
  if (contentType === 'Podcast') {
    hashtags.push('#podcast', '#interview');
  } else if (contentType === 'Tech Review') {
    hashtags.push('#tech', '#review');
  } else if (contentType === 'News') {
    hashtags.push('#news', '#commentary');
  } else if (contentType === 'Educational') {
    hashtags.push('#tutorial', '#education');
  } else if (contentType === 'Business') {
    hashtags.push('#business', '#entrepreneur');
  }

  // Extract keywords from title (simple approach)
  const words = videoTitle.toLowerCase().split(/\s+/);
  const keywords = words.filter(word =>
    word.length > 3 &&
    !['this', 'that', 'with', 'from', 'about', 'what', 'when', 'where', 'which'].includes(word)
  );

  // Add 2-3 keywords from title
  keywords.slice(0, 3).forEach(keyword => {
    const cleaned = keyword.replace(/[^a-z0-9]/gi, '');
    if (cleaned.length > 3) {
      hashtags.push('#' + cleaned);
    }
  });

  // Add year
  hashtags.push('#2025');

  // Limit to 5 hashtags
  return hashtags.slice(0, 5);
}

/**
 * MAIN FUNCTION: Generate all 4 layouts
 */
export function generateAllLayouts(videoTitle, userData, options = {}) {
  const { timestamps = [] } = options;

  // Agent 1: Select layouts (always all 4)
  const layouts = selectLayouts(userData, videoTitle);

  // Generate all 4 descriptions
  const results = {
    layout_a: buildCreatorLayout(videoTitle, userData, timestamps),
    layout_b: buildPodcastLayout(videoTitle, userData),
    layout_c: buildNewsLayout(videoTitle, userData),
    layout_d: buildTechLayout(videoTitle, userData)
  };

  // Validate all layouts
  Object.keys(results).forEach(key => {
    const length = results[key].length;
    if (length > 5000) {
      console.warn(`[DESC_GEN_PRO] ${key} exceeds 5000 chars: ${length}`);
    }
  });

  return results;
}

/**
 * Get character counts for all layouts
 */
export function getLayoutStats(layouts) {
  return {
    layout_a: layouts.layout_a.length,
    layout_b: layouts.layout_b.length,
    layout_c: layouts.layout_c.length,
    layout_d: layouts.layout_d.length
  };
}

/**
 * Validate all layouts meet YouTube requirements
 */
export function validateAllLayouts(layouts) {
  const errors = [];

  Object.keys(layouts).forEach(key => {
    const desc = layouts[key];
    if (desc.length > 5000) {
      errors.push(`${key}: Exceeds 5000 characters (${desc.length}/5000)`);
    }

    // Count hashtags
    const hashtagMatches = desc.match(/#\w+/g);
    const hashtagCount = hashtagMatches ? hashtagMatches.length : 0;
    if (hashtagCount > 15) {
      errors.push(`${key}: Too many hashtags (${hashtagCount}/15)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    stats: getLayoutStats(layouts)
  };
}

export default generateAllLayouts;
