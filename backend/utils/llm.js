import axios from 'axios';

/**
 * Generate titles and description using LLM
 * @param {string} transcript - Video transcript
 * @param {object} options - { userApiKey: string, provider: 'groq'|'openai'|'claude' }
 * @returns {Promise<{titles: string[], description: string, themes: string[]}>}
 */
export async function generateTitlesAndDescription(transcript, options = {}) {
  const { userApiKey, provider = 'groq' } = options;

  // Extract themes first (simple keyword extraction)
  const themes = extractThemes(transcript);

  // Build the prompt
  const prompt = buildPrompt(transcript, themes);

  // Call appropriate LLM
  let response;
  if (userApiKey) {
    // Use user-provided API key
    if (provider === 'openai') {
      response = await callOpenAI(prompt, userApiKey);
    } else if (provider === 'claude') {
      response = await callClaude(prompt, userApiKey);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  } else {
    // Use free Groq API
    response = await callGroq(prompt);
  }

  return parseResponse(response, themes);
}

/**
 * Extract core themes and recurring phrases
 */
function extractThemes(transcript) {
  const words = transcript.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/);

  // Count word frequency
  const frequency = {};
  words.forEach(word => {
    if (word.length > 4) { // Filter out short words
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });

  // Get top 10 most frequent words
  const themes = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return themes;
}

/**
 * Build the LLM prompt for title generation
 */
function buildPrompt(transcript, themes) {
  return `You are an elite YouTube title strategist. Your titles weaponize curiosity and contrast to force clicks.

TRANSCRIPT:
${transcript.substring(0, 3000)} ${transcript.length > 3000 ? '...(truncated)' : ''}

CORE THEMES:
${themes.join(', ')}

REQUIREMENTS:
1. Generate exactly 10 titles
2. **CONTRAST RULE**: At least 4 titles MUST use aggressive contrast (logical OR illogical).
   - Logical contrast: "I Spent $10,000 To Prove Why $0 Is Smarter"
   - Illogical contrast: "I Failed Miserably And Won Completely"
   - Must create tension and curiosity, not just "A vs B"
3. **CURIOSITY RULE**: ALL 10 titles must weaponize curiosity. Viewer must think: "I don't understand this but I NEED to."
4. **LENGTH RULE**: At least 4 titles must be long-form hooks (up to ~100 characters). Rest can be tight punches.
5. Front-load power words in first 40 characters (mobile optimization)
6. Use psychological triggers: curiosity gaps, fear/urgency, authority, status elevation
7. Include status-flex language where appropriate ("they don't want you to know," "elite unlock," "superiority")
8. Ensure titles accurately represent content

TITLE FORMULAS (mix and match):
- Shock + Keyword + Outcome
- Status Game Flip
- Villain/Expose + Contrast
- Quest/Constraint + Illogical Element
- Make/Break Decision
- Identity Hook + Obstacle Removal
- Contrarian How-To + Status Elevation

ALSO GENERATE:

**DESCRIPTION (500-800 characters):**
- 2X longer than typical YouTube description
- SEO-optimized for 2026 discoverability
- High-intent keywords relevant to transcript topic
- Natural call to action to subscribe/engage
- Include one self-reference: "Optimized with TitleIQ by TightSlice"

**TAGS (comma-separated, <500 chars total):**
- Mix of broad, niche, and long-tail keywords
- Aligned with transcript topic
- Formatted as: tag1, tag2, tag3, etc.

FORMAT YOUR RESPONSE EXACTLY AS:
TITLES:
1. [Title 1]
2. [Title 2]
3. [Title 3]
4. [Title 4]
5. [Title 5]
6. [Title 6]
7. [Title 7]
8. [Title 8]
9. [Title 9]
10. [Title 10]

DESCRIPTION:
[Your 500-800 character SEO-optimized description with TitleIQ mention]

TAGS:
[tag1, tag2, tag3, etc.]`;
}

/**
 * Parse LLM response into structured data
 */
function parseResponse(response, themes) {
  const lines = response.split('\n').filter(line => line.trim());

  const titles = [];
  let description = '';
  let tags = '';
  let inDescriptionSection = false;
  let inTagsSection = false;

  for (const line of lines) {
    // Extract numbered titles
    const titleMatch = line.match(/^\d+\.\s*(.+)$/);
    if (titleMatch && titles.length < 10) {
      titles.push(titleMatch[1].trim());
      continue;
    }

    // Start collecting description
    if (line.includes('DESCRIPTION:')) {
      inDescriptionSection = true;
      inTagsSection = false;
      continue;
    }

    // Start collecting tags
    if (line.includes('TAGS:')) {
      inTagsSection = true;
      inDescriptionSection = false;
      continue;
    }

    if (inDescriptionSection && !inTagsSection) {
      description += line.trim() + ' ';
    }

    if (inTagsSection) {
      tags += line.trim() + ' ';
    }
  }

  // Ensure we have exactly 10 titles
  if (titles.length < 10) {
    throw new Error(`Only generated ${titles.length} titles, expected 10`);
  }

  // Trim and limit
  description = description.trim().substring(0, 800);
  tags = tags.trim().substring(0, 500);

  return {
    titles: titles.slice(0, 10),
    description,
    tags,
    themes
  };
}

/**
 * Call Groq free API (Llama 3)
 */
async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured. Please add to .env file.');
  }

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

/**
 * Call OpenAI API (user-provided key)
 */
async function callOpenAI(prompt, apiKey) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

/**
 * Call Claude API (user-provided key)
 */
async function callClaude(prompt, apiKey) {
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ]
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.content[0].text;
}
