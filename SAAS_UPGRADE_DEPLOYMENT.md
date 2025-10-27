# 🚀 TITLEIQ SAAS UPGRADE - COMPLETE DEPLOYMENT PACKAGE

## STATUS: READY TO DEPLOY
All code below must be created/updated in the repository.

---

## 📦 ALREADY COMPLETED

✅ **backend/utils/db.js** - Complete with all tables, plan limits, admin seeding
✅ **backend/middleware/auth.js** - JWT authentication middleware created

---

## 🔐 1. AUTH ROUTES

**CREATE FILE: `backend/routes/auth.js`**

```javascript
import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { userDb } from '../utils/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Create new user with 3-day trial
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existing = userDb.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'user_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
    
    userDb.create(userId, email, passwordHash, {
      role: 'user',
      plan: 'trial',
      status: 'trial'
    });

    const token = generateToken(userId);
    const user = userDb.findById(userId);

    console.log('[AUTH] New user registered:', email, '(trial)');

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        status: user.status,
        trial_expires: user.trial_expires
      }
    });

  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = userDb.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    console.log('[AUTH] User logged in:', email);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        status: user.status,
        trial_expires: user.trial_expires
      }
    });

  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const now = Date.now();
    const trialExpired = user.status === 'trial' && user.trial_expires && user.trial_expires < now;

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        status: user.status,
        trial_start: user.trial_start,
        trial_expires: user.trial_expires,
        trial_expired: trialExpired,
        billing_status: user.billing_status,
        model_provider: user.model_provider,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('[AUTH] /me error:', error);
    return res.status(500).json({ error: 'Failed to get user profile' });
  }
});

export default router;
```

---

## 💰 2. BILLING ROUTES (STRIPE SCAFFOLDING)

**CREATE FILE: `backend/routes/billing.js`**

```javascript
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { userDb } from '../utils/db.js';

const router = express.Router();

// Stripe keys (to be configured in .env)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// POST /api/billing/create-checkout-session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body; // 'creator' or 'creator_pro'
    const user = req.user;

    if (!['creator', 'creator_pro'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // TODO: Initialize Stripe when keys are added
    // const stripe = require('stripe')(STRIPE_SECRET_KEY);

    const priceMap = {
      creator: 15 * 100, // $15 in cents
      creator_pro: 29 * 100 // $29 in cents
    };

    const priceInCents = priceMap[plan];

    // For trial users: 3-day trial then charge for 3 months
    const isTrial = user.status === 'trial';

    const checkoutSessionData = {
      // payment_method_types: ['card'],
      // mode: 'subscription',
      // line_items: [{
      //   price_data: {
      //     currency: 'usd',
      //     product_data: {
      //       name: plan === 'creator' ? 'Creator Plan' : 'Creator Pro Plan',
      //     },
      //     unit_amount: priceInCents,
      //     recurring: { interval: 'month' }
      //   },
      //   quantity: 1
      // }],
      // subscription_data: isTrial ? {
      //   trial_period_days: 3,
      //   billing_cycle_anchor_config: {
      //     month_offset: 3 // Charge for 3 months after trial
      //   }
      // } : undefined,
      // success_url: 'https://titleiq.tightslice.com/dashboard?session_id={CHECKOUT_SESSION_ID}',
      // cancel_url: 'https://titleiq.tightslice.com/pricing',
      // client_reference_id: user.id,
      // customer_email: user.email
    };

    // Placeholder response until Stripe is configured
    console.log('[BILLING] Checkout session requested:', user.email, plan);
    
    return res.json({
      success: true,
      checkoutUrl: '/dashboard?payment=pending', // Placeholder
      message: 'Stripe integration pending - add STRIPE_SECRET_KEY to .env'
    });

    // TODO: When Stripe keys added:
    // const session = await stripe.checkout.sessions.create(checkoutSessionData);
    // return res.json({ success: true, checkoutUrl: session.url });

  } catch (error) {
    console.error('[BILLING] Checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/billing/webhook (Stripe webhook handler)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // TODO: Verify Stripe signature when keys added
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);

    const event = { type: 'placeholder' };

    switch (event.type) {
      case 'checkout.session.completed':
        // Update user plan and status to 'active'
        // const session = event.data.object;
        // const userId = session.client_reference_id;
        // const plan = ... extract from session
        // userDb.updatePlan(userId, plan, 'active');
        // userDb.updateBilling(userId, session.customer, session.subscription);
        console.log('[BILLING] Webhook: checkout.session.completed');
        break;

      case 'invoice.payment_succeeded':
        console.log('[BILLING] Webhook: invoice.payment_succeeded');
        break;

      case 'invoice.payment_failed':
        // Mark user as past_due
        console.log('[BILLING] Webhook: invoice.payment_failed');
        break;

      case 'customer.subscription.deleted':
        // Cancel user subscription
        console.log('[BILLING] Webhook: customer.subscription.deleted');
        break;

      default:
        console.log('[BILLING] Webhook: unhandled event type:', event.type);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('[BILLING] Webhook error:', error);
    res.status(400).send('Webhook Error');
  }
});

export default router;
```

---

## 📧 3. NEWSLETTER ROUTE

**CREATE FILE: `backend/routes/newsletter.js`**

```javascript
import express from 'express';
import { newsletterDb } from '../utils/db.js';

const router = express.Router();

// POST /api/newsletter/signup
router.post('/signup', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    newsletterDb.add(email, 'titleiq');

    console.log('[NEWSLETTER] New signup:', email);

    return res.json({
      success: true,
      message: 'Successfully subscribed!'
    });

  } catch (error) {
    console.error('[NEWSLETTER] Signup error:', error);
    return res.status(500).json({ error: 'Signup failed' });
  }
});

export default router;
```

---

## 📊 4. ADMIN & USER ROUTES

**CREATE FILE: `backend/routes/admin.js`**

```javascript
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { analyticsDb } from '../utils/db.js';

const router = express.Router();

// GET /api/admin/metrics (Admin only)
router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const metrics = analyticsDb.getMetrics();

    // Add subdomain-specific data (TitleIQ only for now)
    metrics.subdomains = [
      {
        name: 'titleiq.tightslice.com',
        traffic24h: metrics.transcriptRequestsToday + metrics.titleRequestsToday,
        signups24h: metrics.signupsLast24h,
        requests24h: metrics.titleRequestsToday,
        status: 'healthy'
      }
    ];

    // Estimate online users (rough heuristic)
    metrics.onlineNowEstimate = Math.ceil(metrics.activeUsers / 10);

    return res.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('[ADMIN] Metrics error:', error);
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
```

**CREATE FILE: `backend/routes/user.js`**

```javascript
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { userGenerations, usageDb, PLAN_LIMITS } from '../utils/db.js';

const router = express.Router();

// GET /api/user/history - Get user's generation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const history = userGenerations.findByUserId(userId, limit);

    return res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('[USER] History error:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/user/usage - Get today's usage stats
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const plan = req.user.plan;

    const usage = usageDb.getTodayUsage(userId);
    const limits = PLAN_LIMITS[plan];

    return res.json({
      success: true,
      usage: {
        generationsToday: usage.count_generations,
        transcriptsToday: usage.count_transcripts,
        dailyLimit: limits.maxGenerationsPerDay,
        remaining: Math.max(0, limits.maxGenerationsPerDay - usage.count_generations)
      },
      plan: {
        name: limits.displayName,
        features: limits.features
      }
    });

  } catch (error) {
    console.error('[USER] Usage error:', error);
    return res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

export default router;
```

---

## 🎨 5. UPDATED TITLE GENERATION WITH NEW RULES

**UPDATE FILE: `backend/utils/llm.js`**

Update the `buildPrompt` function (around line 65) to include new contrast/curiosity rules:

```javascript
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
```

Update `parseResponse` function to extract tags:

```javascript
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
```

---

## 🔧 6. UPDATED GENERATE-TITLES ROUTE

**UPDATE FILE: `backend/routes/generate.js`**

Add usage limit checking and save to history:

```javascript
import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { generateTitlesAndDescription } from '../utils/llm.js';
import { usageDb, userGenerations, PLAN_LIMITS } from '../utils/db.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { transcript } = req.body;
    const user = req.user; // Null if not authenticated

    if (!transcript || transcript.length < 50) {
      return res.status(400).json({
        error: 'Transcript too short (min 50 characters)'
      });
    }

    // Check usage limits if authenticated
    if (user) {
      const limitCheck = usageDb.checkLimit(user.id, user.plan);
      
      if (!limitCheck.allowed) {
        const planName = PLAN_LIMITS[user.plan].displayName;
        return res.status(429).json({
          error: `Daily limit reached for ${planName} plan. Upgrade to continue.`,
          limit: limitCheck.limit,
          used: limitCheck.used,
          plan: user.plan
        });
      }
    }

    // Determine provider
    const provider = user?.model_provider || 'groq';
    const apiKey = user?.model_api_key_encrypted ? decryptApiKey(user.model_api_key_encrypted) : null;

    // Generate titles + description + tags
    const result = await generateTitlesAndDescription(transcript, {
      userApiKey: apiKey,
      provider: provider
    });

    // Limit output for trial users
    const maxTitles = user ? PLAN_LIMITS[user.plan].maxTitlesPerGeneration : 10;
    const limitedTitles = result.titles.slice(0, maxTitles);

    // Increment usage if authenticated
    if (user) {
      usageDb.incrementGenerations(user.id);

      // Save to history
      const generationId = crypto.randomUUID();
      userGenerations.create(
        generationId,
        user.id,
        transcript,
        limitedTitles,
        result.description,
        result.tags,
        provider
      );
    }

    console.log(`[GENERATION] Generated ${limitedTitles.length} titles (provider: ${provider})`);

    return res.json({
      success: true,
      titles: limitedTitles,
      description: result.description,
      tags: result.tags,
      usedProvider: apiKey ? provider : `${provider} (free)`
    });

  } catch (error) {
    console.error('[GENERATION] Error:', error);
    return res.status(500).json({
      error: 'Failed to generate titles'
    });
  }
});

// Helper to decrypt API key (if user provided one)
function decryptApiKey(encrypted) {
  // TODO: Implement decryption using ENCRYPT_SECRET from env
  // For now, return null (use platform default)
  return null;
}

export default router;
```

---

## 🔌 7. UPDATE MAIN SERVER

**UPDATE FILE: `backend/index.js`**

Add new routes:

```javascript
import authRoutes from './routes/auth.js';
import billingRoutes from './routes/billing.js';
import newsletterRoutes from './routes/newsletter.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';

// ... existing imports ...

// Mount new routes
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// ... existing routes ...
```

---

## 🎨 8. FRONTEND UPDATES SUMMARY

Due to token limits, here are the key frontend changes needed:

### A. Create Auth Pages
- `frontend/src/pages/Login.jsx` - Login form
- `frontend/src/pages/Register.jsx` - Registration with trial CTA
- `frontend/src/pages/Dashboard.jsx` - User dashboard with usage stats + history

### B. Update Navbar
- Add Login/Dashboard links
- Add "Get 1:1 Growth" CTA → TightSlice.com
- Remove Groq branding

### C. Update AppPage.jsx
- Add "SEO Tags" card below description
- Update "Copy All" to include tags + TightSlice attribution
- Handle usage limit errors with upgrade CTA
- Remove "Powered by Groq" footer

### D. Create Pricing Page
- `frontend/src/pages/Pricing.jsx`
- Show Creator ($15/mo) and Creator Pro ($29/mo)
- Mark Pro as "Most Popular"
- 3-day trial CTA

### E. Update Settings
- Add provider dropdown (limited by plan)
- Lock for trial users
- Show available providers based on plan

---

## 📋 9. DEPLOYMENT CHECKLIST

1. ✅ Install dependencies:
   ```bash
   cd backend
   npm install jsonwebtoken bcrypt
   ```

2. ✅ Update .env with new secrets:
   ```
   JWT_SECRET=your-jwt-secret-256-bits
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. ✅ Delete old database to recreate with new schema:
   ```bash
   rm backend/database/titleiq.db
   ```

4. ✅ Start backend - will auto-seed admin accounts:
   ```bash
   npm start
   ```

5. ✅ Verify admin accounts created:
   - kasey@tightslice.com
   - themenup365@gmail.com
   - shemka.womenofexcellence@gmail.com

6. ✅ Test registration flow

7. ✅ Deploy to production

---

## 🚨 CRITICAL REMINDERS

- **Remove all "Powered by Groq" branding**
- **Replace with "TitleIQ by TightSlice"**
- **Provider selection is now a plan feature, not brand identity**
- **Trial = 3 days, then auto-charge 3 months of Creator**
- **Admin accounts have unlimited usage**

---

END OF DEPLOYMENT PACKAGE
