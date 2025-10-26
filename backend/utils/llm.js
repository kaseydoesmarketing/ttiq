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
  return `You are an expert YouTube title optimizer. Analyze the following video transcript and generate exactly 10 high-impact, CTR-optimized titles.

TRANSCRIPT:
${transcript.substring(0, 3000)} ${transcript.length > 3000 ? '...(truncated)' : ''}

CORE THEMES:
${themes.join(', ')}

REQUIREMENTS:
1. Generate exactly 10 titles
2. Each title must be 45-65 characters
3. Front-load strong nouns/verbs in first 40 characters
4. Use psychological triggers: curiosity gaps, fear/urgency, authority
5. Incorporate themes naturally
6. Optimize for mobile (short, punchy)
7. Ensure titles accurately represent the content

TITLE FORMULAS TO USE (mix and match):
- Shock + Keyword + Outcome
- Status Game Flip
- Villain/Expose
- Quest/Constraint
- Make/Break Decision
- Identity Hook + Obstacle Removal
- Contrarian How-To

Also generate ONE concise description (maximum 500 characters) that:
- Aligns with the strongest title's promise
- Maintains curiosity gap
- Incorporates primary keywords naturally

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
[Your description here]`;
}

/**
 * Parse LLM response into structured data
 */
function parseResponse(response, themes) {
  const lines = response.split('\n').filter(line => line.trim());

  const titles = [];
  let description = '';
  let inDescriptionSection = false;

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
      continue;
    }

    if (inDescriptionSection) {
      description += line.trim() + ' ';
    }
  }

  // Ensure we have exactly 10 titles
  if (titles.length < 10) {
    throw new Error(`Only generated ${titles.length} titles, expected 10`);
  }

  // Trim description to 500 characters
  description = description.trim().substring(0, 500);

  return {
    titles: titles.slice(0, 10),
    description,
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
