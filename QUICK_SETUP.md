# TitleIQ - Quick Setup Guide

## ✅ What's Done

- ✅ Backend deployed and running on PM2
- ✅ Frontend deployed and running on PM2
- ✅ Nginx configured for titleiq.titleslice.com
- ✅ Database initialized (SQLite)
- ✅ JWT and encryption secrets generated

## ⚠️ What You Need to Do

### 1. Add DNS A Record (REQUIRED)

Go to Hostinger DNS management for **titleslice.com** and add:

```
Type: A
Name: titleiq
Value: 72.61.0.118
TTL: 3600
```

**Why:** Without this, titleiq.titleslice.com won't resolve and SSL won't work.

### 2. Get Groq API Key (REQUIRED)

1. Go to: https://console.groq.com/keys
2. Sign up for free (no credit card needed)
3. Create a new API key
4. Copy the key (starts with `gsk_...`)

### 3. Add Groq API Key to Backend

SSH into your VPS and edit the backend .env file:

```bash
ssh root@automations.tightslice.com
nano /var/www/titleiq/backend/.env
```

Find this line:
```
GROQ_API_KEY=GROQ_KEY_NEEDED
```

Replace with your actual key:
```
GROQ_API_KEY=gsk_your_actual_key_here
```

Save and exit (Ctrl+X, Y, Enter)

Restart the backend:
```bash
pm2 restart titleiq-backend
```

### 4. Setup SSL (After DNS Propagates)

Wait 5-30 minutes for DNS to propagate, then run:

```bash
ssh root@automations.tightslice.com
certbot --nginx -d titleiq.titleslice.com --non-interactive --agree-tos --email your@email.com --redirect
```

## 🧪 Testing

Once DNS and Groq API key are configured:

1. Visit: **https://titleiq.titleslice.com** (or http if SSL not done yet)
2. Click "Try Builder Mode"
3. Paste this YouTube URL:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
4. Click "Generate Titles"
5. You should see 10 titles + description

## 🎯 Current Status

**Backend:** ✅ Running (needs Groq API key)
**Frontend:** ✅ Running
**Nginx:** ✅ Configured
**DNS:** ⏳ Waiting for you to add A record
**SSL:** ⏳ Waiting for DNS propagation
**Groq API:** ⏳ Waiting for you to add key

## 🆘 Troubleshooting

**If backend isn't working:**
```bash
ssh root@automations.tightslice.com
pm2 logs titleiq-backend
```

**If frontend shows blank page:**
```bash
pm2 logs titleiq-frontend
```

**Check if services are running:**
```bash
pm2 list
```

**Restart everything:**
```bash
pm2 restart all
```

## 📝 Notes

- The app works in "builder mode" without login
- Users can create accounts for saved settings
- Optional: Users can add their own OpenAI/Claude keys in Settings
- All user API keys are encrypted (AES-256)

---

**Ready to ship once you add DNS record and Groq API key!**
