# TitleIQ - AI-Powered YouTube Title Optimizer

Generate 10 high-CTR YouTube title options from any video transcript in seconds.

## 🚀 Features

- **YouTube URL Input** - Paste any YouTube URL to auto-fetch transcript
- **Manual Transcript Input** - Paste raw transcript text for any content
- **10 Optimized Titles** - AI-generated using proven CTR formulas
- **Optimized Description** - Get a compelling description (≤500 chars)
- **Theme Extraction** - Automatically surfaces core topics and keywords
- **Builder Mode** - Use the app without creating an account
- **Optional User API Keys** - Add your own OpenAI/Claude key for premium results
- **Free by Default** - Uses Groq's free LLM API (no credit card required)
- **Futuristic UI** - Beautiful animations and mobile-optimized design
- **Privacy-First** - API keys are encrypted, no tracking

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS + Framer Motion
- React Router

**Backend:**
- Node.js + Express
- SQLite (better-sqlite3)
- JWT Authentication
- AES-256 Encryption for API keys

**AI/LLM:**
- Groq API (free tier - Llama 3)
- Optional: OpenAI/Claude (user-provided keys)

**Deployment:**
- Hostinger VPS
- Nginx reverse proxy
- PM2 process manager
- Let's Encrypt SSL

## 📋 Prerequisites

- Node.js 18+ and npm
- Groq API key (free) - [Get yours here](https://console.groq.com/keys)

## 🔧 Local Setup

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/kaseydoesmarketing/ttiq.git
cd ttiq
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add:
# - Your Groq API key (free from https://console.groq.com/keys)
# - Generate JWT_SECRET: openssl rand -base64 32
# - Generate ENCRYPTION_SECRET: openssl rand -base64 32
\`\`\`

**Example .env:**
\`\`\`env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-generated-jwt-secret-here
ENCRYPTION_SECRET=your-generated-encryption-secret-here
GROQ_API_KEY=gsk_your_groq_api_key_here
\`\`\`

### 3. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set:
VITE_API_URL=http://localhost:5000
\`\`\`

### 4. Run Locally

**Terminal 1 - Backend:**
\`\`\`bash
cd backend
npm start
# Server runs on http://localhost:5000
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`bash
cd frontend
npm run dev
# App runs on http://localhost:3000
\`\`\`

Visit **http://localhost:3000** and start generating titles!

## 🌐 Production Deployment

### VPS Setup (Hostinger)

1. **SSH into VPS:**
\`\`\`bash
ssh root@your-vps-ip
\`\`\`

2. **Install Node.js and PM2:**
\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
npm install -g pm2
\`\`\`

3. **Clone and setup:**
\`\`\`bash
cd /var/www
git clone https://github.com/kaseydoesmarketing/ttiq.git titleiq
cd titleiq
\`\`\`

4. **Backend setup:**
\`\`\`bash
cd backend
npm install
cp .env.example .env
nano .env  # Add production values
\`\`\`

5. **Frontend setup:**
\`\`\`bash
cd ../frontend
npm install
cp .env.example .env
nano .env  # Set VITE_API_URL=https://titleiq.titleslice.com
npm run build
\`\`\`

6. **Start with PM2:**
\`\`\`bash
cd /var/www/titleiq
pm2 start backend/index.js --name titleiq-backend
pm2 serve frontend/dist 3000 --name titleiq-frontend --spa
pm2 save
pm2 startup
\`\`\`

7. **Configure Nginx:**
\`\`\`bash
nano /etc/nginx/sites-available/titleiq.titleslice.com
\`\`\`

Add:
\`\`\`nginx
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
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

Enable and test:
\`\`\`bash
ln -s /etc/nginx/sites-available/titleiq.titleslice.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
\`\`\`

8. **SSL with Let's Encrypt:**
\`\`\`bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d titleiq.titleslice.com
\`\`\`

## 📖 Usage

### Basic Flow

1. Go to **titleiq.titleslice.com**
2. Click "Try Builder Mode" (no login required)
3. Paste a YouTube URL OR raw transcript
4. Click "Generate Titles"
5. Copy your favorite title and description
6. Export all titles as JSON

### With User Account

1. Sign up (free)
2. Go to Settings
3. Optionally add your own OpenAI/Claude API key
4. Generate titles with your premium key

### API Key Benefits

**Free (Default):**
- Uses Groq's free API
- Llama 3 model
- Rate limits apply

**With Your Own Key:**
- Use GPT-4 or Claude
- Higher quality outputs
- Your own rate limits
- Private and encrypted

## 🔐 Security

- Passwords hashed with bcrypt
- JWT authentication (30-day expiry)
- API keys encrypted with AES-256-GCM
- HTTPS enforced in production
- CORS configured for subdomain only

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📝 License

MIT License - see LICENSE file

## 🙋 Support

Questions? Open an issue on GitHub.

---

**Built with ❤️ for YouTube creators**
