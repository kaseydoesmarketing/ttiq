# TitleIQ - PROJECT BRAIN

## PRODUCT SNAPSHOT
**Name:** TitleIQ
**Domain:** titleiq.titleslice.com
**Mission:** Transform YouTube transcripts into 10 high-impact title options + optimized description
**Target Users:** YouTube creators, marketers, content strategists

## LEVEL 1 CORE LOOP
```
User Input (YouTube URL OR Transcript Paste)
  ↓
Extract/Accept Transcript
  ↓
Analyze: Surface Core Themes & Recurring Phrases
  ↓
Generate: 10 Title Options + 1 Description (≤500 chars)
  ↓
Display with Futuristic UI Animation
  ↓
Copy/Export
```

## TECH STACK (LOCKED)

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + Framer Motion (animations)
- **Icons:** Heroicons
- **Build:** Vite

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express
- **Auth:** JWT (jsonwebtoken + bcrypt)
- **Database:** SQLite (simple, file-based)
- **CORS:** Enabled for subdomain

### AI/LLM
- **Primary (Free):** Groq API (free tier - Llama 3)
- **Fallback:** Hugging Face Inference API
- **User Optional:** Support OpenAI/Claude API keys (user-provided)

### Transcript Extraction
- **Library:** `youtube-transcript` (npm)
- **Fallback:** Manual paste input

### Deployment
- **Host:** Hostinger VPS (existing)
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt

## FEATURE TIERS

### LEVEL 1 - MVP (Ship First)
✅ YouTube URL input
✅ Transcript paste input
✅ Extract transcript (youtube-transcript library)
✅ Analyze themes & recurring phrases
✅ Generate 10 titles + 1 description
✅ Futuristic UI with animation
✅ Copy individual titles
✅ Builder mode (no login required)
✅ Basic error handling

### LEVEL 2 - Production Features
✅ Email/password authentication
✅ User accounts (SQLite database)
✅ Settings screen for optional API key
✅ Export all titles (JSON/CSV)
✅ Edit/regenerate functionality
✅ Landing page (headline, benefits, FAQ)
✅ Usage documentation

### LEVEL 3 - Future Enhancements
⏸️ Title history (save past generations)
⏸️ Team collaboration
⏸️ A/B testing recommendations
⏸️ Payment integration (Stripe)
⏸️ Advanced analytics

## DATA MODELS

### User
```json
{
  "id": "uuid",
  "email": "string (unique)",
  "password": "string (bcrypt hashed)",
  "apiKey": "string (encrypted, optional)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Generation (Future - Level 3)
```json
{
  "id": "uuid",
  "userId": "uuid (optional for builder mode)",
  "videoUrl": "string (optional)",
  "transcript": "text",
  "titles": "json (array of 10)",
  "description": "string",
  "createdAt": "timestamp"
}
```

## API CONTRACTS

### Backend Routes

#### Auth Routes
```
POST /api/auth/register
  Body: { email, password }
  Response: { token, user: { id, email } }

POST /api/auth/login
  Body: { email, password }
  Response: { token, user: { id, email } }

GET /api/auth/me
  Headers: { Authorization: "Bearer <token>" }
  Response: { user: { id, email } }
```

#### Settings Routes
```
POST /api/settings/api-key
  Headers: { Authorization: "Bearer <token>" }
  Body: { apiKey }
  Response: { success: true }

GET /api/settings/api-key
  Headers: { Authorization: "Bearer <token>" }
  Response: { hasKey: boolean }

DELETE /api/settings/api-key
  Headers: { Authorization: "Bearer <token>" }
  Response: { success: true }
```

#### Generation Routes
```
POST /api/generate
  Headers: { Authorization: "Bearer <token>" } (optional for builder mode)
  Body: {
    input: "youtube-url" | "transcript-text",
    type: "url" | "text"
  }
  Response: {
    transcript: "string",
    themes: ["string"],
    titles: ["string"] (10 items),
    description: "string"
  }
```

## FRONTEND COMPONENT MAP

```
src/
├── components/
│   ├── Landing/
│   │   ├── Hero.jsx           # Headline + CTA
│   │   ├── Benefits.jsx       # Value propositions
│   │   ├── ExampleOutput.jsx  # Sample titles showcase
│   │   └── FAQ.jsx            # Common questions
│   ├── App/
│   │   ├── InputForm.jsx      # URL or transcript input
│   │   ├── TranscriptDisplay.jsx  # Show transcript with themes
│   │   ├── TitleAnimation.jsx     # Futuristic keyword → title animation
│   │   ├── TitleList.jsx          # Display 10 titles
│   │   ├── DescriptionBox.jsx     # Show generated description
│   │   ├── ExportButton.jsx       # Export functionality
│   │   └── RegenerateButton.jsx   # Re-run generation
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── Settings/
│   │   └── APIKeySettings.jsx
│   └── Shared/
│       ├── Navbar.jsx
│       ├── Button.jsx
│       └── LoadingSpinner.jsx
├── pages/
│   ├── HomePage.jsx         # Landing page
│   ├── AppPage.jsx          # Main app (builder mode or logged in)
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── SettingsPage.jsx
├── hooks/
│   ├── useAuth.js           # Auth state management
│   ├── useGenerate.js       # Title generation logic
│   └── useTranscript.js     # Transcript extraction
├── utils/
│   ├── api.js               # Axios instance
│   ├── transcript.js        # YouTube transcript client
│   └── encryption.js        # API key encryption
└── App.jsx                  # Router setup
```

## UI/UX SPECIFICATIONS

### Animation Flow
1. User submits URL/transcript
2. Loading state: "Analyzing transcript..."
3. Transcript text appears, words highlight as themes
4. Keywords "float" and cluster
5. 10 title cards fade in one by one (stagger effect)
6. Description appears at bottom

### Color Palette (Futuristic Brand)
```css
--primary: #00F0FF (cyan)
--secondary: #9D4EDD (purple)
--accent: #FF006E (hot pink)
--dark: #0A0E27 (navy)
--light: #F8F9FA
--success: #06FFA5
--error: #FF4D6D
```

### Typography
- Headings: Space Grotesk (futuristic, bold)
- Body: Inter (clean, readable)

## INFRASTRUCTURE

### Hostinger VPS Setup
```
/var/www/titleiq/
├── frontend/          # Built React app
├── backend/           # Express server
├── database/          # SQLite file
├── logs/              # PM2 logs
└── .env               # Environment variables
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name titleiq.titleslice.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
    }
}
```

### PM2 Ecosystem
```javascript
{
  "apps": [
    {
      "name": "titleiq-backend",
      "script": "./backend/index.js",
      "env": {
        "NODE_ENV": "production",
        "PORT": 5000
      }
    },
    {
      "name": "titleiq-frontend",
      "script": "npx",
      "args": "serve -s ./frontend/dist -l 3000"
    }
  ]
}
```

## ZEROFAIL VALIDATION CHECKLIST

### Core Loop Tests
- [ ] Paste YouTube URL → Receives transcript → Generates 10 titles + description
- [ ] Paste raw transcript → Generates 10 titles + description
- [ ] Invalid URL → Graceful error → Allow paste fallback
- [ ] No transcript available → Clear error message → Manual paste option

### Authentication Tests
- [ ] Register new user → Login → Access protected routes
- [ ] Builder mode → Use app without login
- [ ] Protected routes → Redirect to login if not authenticated

### Settings Tests
- [ ] Add API key → Encrypted in database → Never displayed
- [ ] Remove API key → Deleted from database
- [ ] Generation uses user API key if provided, else free default

### UI/Animation Tests
- [ ] Futuristic animation plays smoothly
- [ ] Titles appear with stagger effect
- [ ] Copy button works for each title
- [ ] Export button downloads JSON/CSV

### Edge Cases
- [ ] Very long transcript (>10,000 words)
- [ ] Empty transcript
- [ ] Special characters in transcript
- [ ] Network timeout during generation
- [ ] API rate limit handling

## SUCCESS METRICS

**Level 1 Complete When:**
✅ Live at titleiq.titleslice.com
✅ YouTube URL → 10 titles + description working
✅ Transcript paste → 10 titles + description working
✅ Builder mode accessible (no login)
✅ Futuristic UI animation functioning
✅ Landing page live with headline, benefits, FAQ

**Production Ready When:**
✅ All Level 1 + Level 2 features complete
✅ All ZEROFAIL tests passing
✅ Documentation published
✅ SSL certificate active
✅ Error tracking enabled

## COST STRUCTURE

### Free Tier (Default)
- Groq API: Free (rate limited)
- Transcript extraction: Free (youtube-transcript)
- Hosting: Existing VPS
- Database: SQLite (no cost)

**Total: $0/month**

### User-Provided API Keys
- User brings their own OpenAI/Claude key
- User pays their own API costs
- We never charge for compute

## BLOCKED ITEMS
None. All dependencies are free or user-provided.

## BUILD NOW
Level 1 scope locked. Stack locked. Architecture defined.
Proceeding to BUILD_ENGINE.
