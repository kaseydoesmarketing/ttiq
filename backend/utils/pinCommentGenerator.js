/**
 * Pin Comment Generator
 * AI-powered engagement hooks for YouTube/TikTok
 *
 * Strategies:
 * - Question Hook: Asks engaging question
 * - CTA Hook: Clear call-to-action
 * - Controversy Hook: Polarizing take for engagement
 * - Value Hook: Teases additional value
 * - Community Hook: Builds community feeling
 */

/**
 * Generate pin comment recommendation
 *
 * @param {Object} options
 * @param {string} options.transcript - Video/content transcript
 * @param {string[]} options.titles - Generated titles for context
 * @param {Object} options.profile - User profile data
 * @param {string} options.strategy - Preferred strategy (or 'auto')
 * @returns {Object} {text, strategy, reasoning, score}
 */
export function generatePinComment(options = {}) {
  const {
    transcript = '',
    titles = [],
    profile = {},
    strategy = 'auto'
  } = options;

  // Extract key context
  const context = extractContext(transcript, titles, profile);

  // Choose strategy
  const selectedStrategy = strategy === 'auto'
    ? selectBestStrategy(context, profile)
    : strategy;

  // Generate comment based on strategy
  const comment = generateByStrategy(selectedStrategy, context, profile);

  // Calculate engagement score
  const score = calculateEngagementScore(comment, context);

  return {
    text: comment.text,
    strategy: selectedStrategy,
    reasoning: comment.reasoning,
    score,
    maxLength: 150,
    length: comment.text.length
  };
}

/**
 * Extract context from transcript/titles
 */
function extractContext(transcript, titles, profile) {
  const context = {
    hasNumbers: /\d+/.test(transcript),
    hasQuestion: /\?/.test(transcript),
    contentType: profile.content_type || 'general',
    brandVoice: profile.brand_voice || 'casual',
    primaryGoal: profile.primary_goal || 'engagement',
    niche: profile.niche || '',
    mainTopic: extractMainTopic(titles, transcript)
  };

  return context;
}

/**
 * Extract main topic from titles/transcript
 */
function extractMainTopic(titles, transcript) {
  if (titles.length > 0) {
    // Use first title as main topic indicator
    const firstTitle = titles[0];
    // Extract key phrase (remove common words)
    const cleaned = firstTitle
      .replace(/^(How to|Why|What|When|Where|The|A|An)\s+/i, '')
      .replace(/\?.*$/, '')
      .substring(0, 50);
    return cleaned;
  }

  // Fallback to transcript excerpt
  return transcript.substring(0, 50);
}

/**
 * Select best strategy based on context
 */
function selectBestStrategy(context, profile) {
  const goal = profile.primary_goal || 'engagement';

  // Goal-based strategy selection
  if (goal === 'growth') {
    return 'cta_hook'; // Clear CTAs drive subscriptions
  }

  if (goal === 'engagement') {
    return 'question_hook'; // Questions drive comments
  }

  if (goal === 'monetization') {
    return 'value_hook'; // Tease premium content
  }

  // Content-type based fallback
  if (context.contentType === 'educational') {
    return 'question_hook';
  }

  if (context.contentType === 'entertainment') {
    return 'controversy_hook';
  }

  // Default
  return 'question_hook';
}

/**
 * Generate comment by strategy
 */
function generateByStrategy(strategy, context, profile) {
  const generators = {
    question_hook: generateQuestionHook,
    cta_hook: generateCTAHook,
    controversy_hook: generateControversyHook,
    value_hook: generateValueHook,
    community_hook: generateCommunityHook
  };

  const generator = generators[strategy] || generators.question_hook;
  return generator(context, profile);
}

/**
 * Question Hook Strategy
 */
function generateQuestionHook(context, profile) {
  const questions = [
    `Which tip from this video surprised you most? 👇`,
    `What's your biggest challenge with ${context.mainTopic}? Let me know!`,
    `Have you tried this before? Drop a 🔥 if yes!`,
    `Which strategy are you implementing first? Comment below!`,
    `What other topics should I cover? Your feedback shapes future content!`
  ];

  // Choose based on brand voice
  const questionIndex = profile.brand_voice === 'professional' ? 3 : 0;
  const text = questions[questionIndex];

  return {
    text: ensureMaxLength(text, 150),
    reasoning: 'Question hook drives comments and engagement by inviting viewers to share their thoughts'
  };
}

/**
 * CTA Hook Strategy
 */
function generateCTAHook(context, profile) {
  const ctas = [
    `👉 Subscribe if you found this helpful! More ${context.niche || 'content'} coming weekly.`,
    `Hit that subscribe button for more ${context.mainTopic} tips! 🚀`,
    `Want Part 2? Drop a 🔥 and I'll make it happen!`,
    `Share this with someone who needs to see it! 💡`,
    `Save this video for later - you'll thank me! 📌`
  ];

  const text = ctas[0];

  return {
    text: ensureMaxLength(text, 150),
    reasoning: 'Clear CTA encourages specific action (subscribe/share) to drive channel growth'
  };
}

/**
 * Controversy Hook Strategy
 */
function generateControversyHook(context, profile) {
  const hooks = [
    `Hot take: Most people get ${context.mainTopic} completely wrong. Here's why... 🔥`,
    `Unpopular opinion: You've been doing this backwards. Agree or disagree? 👇`,
    `This might be controversial but... ${context.mainTopic} isn't what you think.`,
    `Fight me on this: ${context.mainTopic} is overrated. Change my mind! 💬`,
    `Real talk: The "experts" are wrong about this. Here's the truth...`
  ];

  // Only use for entertainment/casual brand voice
  if (profile.brand_voice === 'professional') {
    return generateQuestionHook(context, profile);
  }

  const text = hooks[0];

  return {
    text: ensureMaxLength(text, 150),
    reasoning: 'Polarizing statement drives debate and comments (use with caution for brand-safe content)'
  };
}

/**
 * Value Hook Strategy
 */
function generateValueHook(context, profile) {
  const hooks = [
    `🎁 FREE GUIDE: Get my complete ${context.mainTopic} checklist (link in bio)`,
    `Pro tip: Watch until the end for the secret strategy nobody talks about! 🤫`,
    `I'm sharing my exact ${context.mainTopic} framework in the next video. Hit subscribe!`,
    `This is just the beginning... Part 2 drops Friday with even better tips! 📅`,
    `Get the full ${context.mainTopic} masterclass (link in description) 🔗`
  ];

  const text = hooks[1]; // Avoid external links in pin comment

  return {
    text: ensureMaxLength(text, 150),
    reasoning: 'Teases additional value to keep viewers engaged and coming back'
  };
}

/**
 * Community Hook Strategy
 */
function generateCommunityHook(context, profile) {
  const hooks = [
    `We hit ${profile.channel_size || '1K'} subscribers! Thank you all 🙏 What should we do to celebrate?`,
    `You asked, I delivered! This video is based on YOUR comments. Keep them coming! 💬`,
    `Building this community with you has been incredible. What's next? You decide! 👇`,
    `Shoutout to everyone who suggested this topic! You're the real MVPs 🏆`,
    `Your feedback makes these videos better. What did I miss? Let me know! 💡`
  ];

  const text = hooks[1];

  return {
    text: ensureMaxLength(text, 150),
    reasoning: 'Builds community feeling and makes viewers feel heard, driving loyalty'
  };
}

/**
 * Ensure text doesn't exceed max length
 */
function ensureMaxLength(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  // Truncate at last complete sentence
  const truncated = text.substring(0, maxLength - 3);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');

  const cutoff = Math.max(lastPeriod, lastExclamation, lastQuestion);

  if (cutoff > maxLength / 2) {
    return text.substring(0, cutoff + 1);
  }

  return truncated + '...';
}

/**
 * Calculate engagement score (0-100)
 */
function calculateEngagementScore(comment, context) {
  let score = 50; // Base score

  // Has emoji: +15
  if (/[\u{1F300}-\u{1F9FF}]/u.test(comment.text)) {
    score += 15;
  }

  // Has question: +20
  if (/\?/.test(comment.text)) {
    score += 20;
  }

  // Has CTA words (subscribe, comment, share, like): +10
  if (/(subscribe|comment|share|like|drop|hit)/i.test(comment.text)) {
    score += 10;
  }

  // Length check (80-120 chars is optimal)
  const length = comment.text.length;
  if (length >= 80 && length <= 120) {
    score += 10;
  } else if (length < 50) {
    score -= 10; // Too short
  } else if (length > 140) {
    score -= 5; // Too long
  }

  // Has urgency/FOMO (now, today, limited, exclusive): +5
  if (/(now|today|limited|exclusive|secret)/i.test(comment.text)) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate multiple pin comment options
 */
export function generateMultiplePinComments(options, count = 3) {
  const strategies = ['question_hook', 'cta_hook', 'value_hook'];
  const comments = [];

  for (let i = 0; i < Math.min(count, strategies.length); i++) {
    const comment = generatePinComment({
      ...options,
      strategy: strategies[i]
    });
    comments.push(comment);
  }

  // Sort by score
  return comments.sort((a, b) => b.score - a.score);
}

export default generatePinComment;
