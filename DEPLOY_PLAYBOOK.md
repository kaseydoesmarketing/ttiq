# TitleIQ Production Deployment Playbook

**Last Updated:** January 2025
**Product:** TitleIQ by TightSlice
**Purpose:** Complete production deployment guide for technical founders

---

## ⚠️ PREREQUISITES

Before deployment, ensure you have:
- [ ] Node.js v18+ installed on production server
- [ ] pm2 installed globally (`npm install -g pm2`)
- [ ] Nginx configured for static files + API reverse proxy
- [ ] PostgreSQL/SQLite database initialized
- [ ] SSH access to production server (`root@automations.tightslice.com`)
- [ ] Domain pointed to server: `titleiq.tightslice.com`

---

## 📋 ENVIRONMENT VARIABLES

### Backend `.env` Configuration

Create `/var/www/titleiq/backend/.env` with the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
# If using PostgreSQL:
DATABASE_URL=postgresql://user:password@localhost:5432/titleiq
# If using SQLite (default):
# DATABASE_URL will be handled by db.js

# JWT Authentication
# TODO: Generate a secure 256-bit random string
# Command: openssl rand -base64 32
JWT_SECRET=REPLACE_WITH_SECURE_RANDOM_STRING

# ======================================
# STRIPE BILLING (Add these LAST)
# ======================================
# TODO: Get these from Stripe Dashboard after creating products
# Leave blank until Stripe is configured - app will run without billing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CREATOR=price_...
STRIPE_PRICE_CREATOR_PRO=price_...

# AI Provider API Keys
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here
# Optional providers (add if using):
# GROK_API_KEY=your_grok_key_here
# GEMINI_API_KEY=your_gemini_key_here

# CORS Configuration
FRONTEND_URL=https://titleiq.tightslice.com

# Optional: Analytics/Monitoring
# SENTRY_DSN=your_sentry_dsn_here
```

**Security Note:** NEVER commit `.env` files to version control!

### Frontend `.env` Configuration

Create `/var/www/titleiq/frontend/.env`:

```env
VITE_API_URL=https://titleiq.tightslice.com
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Build Frontend Locally

```bash
# On your local machine
cd /Users/kvimedia/titleiq/frontend
npm install
npm run build

# This creates /Users/kvimedia/titleiq/frontend/dist/
```

**Verify build succeeded:**
- Check for `dist/index.html`
- No React errors or missing imports in terminal

### Step 2: Upload Frontend to Production

```bash
# From your local machine
rsync -avz --delete dist/ \
  root@automations.tightslice.com:/var/www/titleiq/frontend/
```

**What this does:**
- Uploads compiled static assets to server
- `--delete` removes old files (ensures clean state)
- `-avz` = archive mode, verbose, compressed

### Step 3: Update Backend on Server

```bash
# SSH into production server
ssh root@automations.tightslice.com

# Navigate to backend directory
cd /var/www/titleiq/backend

# Pull latest code (if using git)
git pull origin main

# Install/update dependencies
npm install

# Stop existing process (if running)
pm2 stop titleiq-backend || true
pm2 delete titleiq-backend || true

# Start backend with pm2
pm2 start index.js --name titleiq-backend -i 1

# Save pm2 configuration
pm2 save

# View logs to confirm startup
pm2 logs titleiq-backend --lines 50
```

**Expected log output:**
```
✅ TitleIQ API running on port 5000
📍 Environment: production
🔒 CORS enabled for: https://titleiq.tightslice.com
```

### Step 4: Seed Admin/Lifetime Accounts

**Run once only** to create admin accounts:

```bash
cd /var/www/titleiq/backend
node scripts/seedAdmins.js
```

**Expected output:**
```
[SEED] ✓ Created admin account: kasey@tightslice.com
[SEED] ✓ Created admin account: themenup365@gmail.com
[SEED] ✓ Created admin account: shemka.womenofexcellence@gmail.com
[SEED] Admin seeding complete. All admin accounts have unlimited access.
[SEED] Default password: changeme_admin_password (change after first login)
```

**⚠️ SECURITY:** Change admin passwords immediately after first login!

Admin accounts have:
- `role: 'admin'`
- `plan: 'creator_pro'`
- `billing_status: 'lifetime'`
- Unlimited daily generations (∞)

### Step 5: Configure Nginx (if not already done)

**Nginx configuration for `/etc/nginx/sites-available/titleiq`:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name titleiq.tightslice.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name titleiq.tightslice.com;

    # SSL certificates (managed by certbot)
    ssl_certificate /etc/letsencrypt/live/titleiq.tightslice.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/titleiq.tightslice.com/privkey.pem;

    # Frontend static files
    root /var/www/titleiq/frontend;
    index index.html;

    # API reverse proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Enable and reload:**
```bash
sudo ln -s /etc/nginx/sites-available/titleiq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Harden SSH Security

**⚠️ CRITICAL:** Do this AFTER you've confirmed SSH key access works!

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Make these changes:
# PasswordAuthentication no
# PermitRootLogin prohibit-password
# PubkeyAuthentication yes

# Restart SSH (will NOT disconnect current session)
sudo systemctl restart sshd
```

**Verify:** Try SSH from another terminal before closing your current session!

### Step 7: Secure Environment Files

```bash
# Set restrictive permissions on .env files
sudo chmod 600 /var/www/titleiq/backend/.env
sudo chown root:root /var/www/titleiq/backend/.env

# Verify
ls -la /var/www/titleiq/backend/.env
# Should show: -rw------- 1 root root
```

---

## 🔄 ROUTINE UPDATE PROCEDURE

When pushing code changes:

```bash
# 1. Build frontend locally
cd /Users/kvimedia/titleiq/frontend
npm run build

# 2. Upload to server
rsync -avz --delete dist/ \
  root@automations.tightslice.com:/var/www/titleiq/frontend/

# 3. Update and restart backend
ssh root@automations.tightslice.com << 'ENDSSH'
cd /var/www/titleiq/backend
git pull origin main
npm install
pm2 restart titleiq-backend
pm2 logs titleiq-backend --lines 20
ENDSSH
```

---

## 💳 STRIPE CONFIGURATION (Do This LAST)

Stripe billing is optional initially. The app functions fully without it - users just can't upgrade from trial.

### 1. Create Products in Stripe Dashboard

**Product 1: Creator Plan**
- Name: TitleIQ Creator
- Price: $15 USD
- Billing: Recurring monthly
- Copy the Price ID (starts with `price_...`)

**Product 2: Creator Pro Plan**
- Name: TitleIQ Creator Pro
- Price: $29 USD
- Billing: Recurring monthly
- Copy the Price ID (starts with `price_...`)

### 2. Set Up Webhook Endpoint

In Stripe Dashboard → Developers → Webhooks:

- Endpoint URL: `https://titleiq.tightslice.com/api/billing/webhook`
- Events to subscribe:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`
- Copy the Webhook Signing Secret (starts with `whsec_...`)

### 3. Update Backend .env

Add to `/var/www/titleiq/backend/.env`:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CREATOR=price_...
STRIPE_PRICE_CREATOR_PRO=price_...
```

### 4. Restart Backend

```bash
ssh root@automations.tightslice.com
pm2 restart titleiq-backend
```

### 5. Test Stripe Integration

1. Go to `https://titleiq.tightslice.com/pricing`
2. Click "Upgrade to Creator"
3. Should redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify webhook received in Stripe Dashboard
7. Check user upgraded in `/dashboard`

---

## ✅ SMOKE TEST CHECKLIST

Run these tests after every deployment:

### Test 1: Homepage Loads
- [ ] Visit `https://titleiq.tightslice.com/`
- [ ] Hero section renders
- [ ] Pricing cards visible
- [ ] Newsletter signup form present
- [ ] Footer shows legal links

### Test 2: User Registration (Trial)
- [ ] Click "Start Free Trial"
- [ ] Fill email + password
- [ ] Submits successfully
- [ ] Redirects to `/dashboard`
- [ ] Shows "Trial" badge
- [ ] QuotaPill shows "X / 10 left today"

### Test 3: Title Generation Flow
- [ ] Go to `/app`
- [ ] Paste YouTube URL
- [ ] Click "Fetch Transcript"
- [ ] Transcript appears (or error with manual paste option)
- [ ] Click "Generate 10 Titles"
- [ ] 10 titles render with badges
- [ ] SEO description visible
- [ ] Tags locked for trial user (blurred + upgrade CTA)
- [ ] "Copy All" includes attribution

### Test 4: Quota Enforcement
- [ ] Generate titles 10 times as trial user
- [ ] 11th attempt shows "Daily limit reached"
- [ ] UpgradeModal appears
- [ ] Modal shows pricing + features

### Test 5: Admin Login
- [ ] Logout
- [ ] Login with `kasey@tightslice.com` / `changeme_admin_password`
- [ ] Dashboard shows "Creator Pro ∞"
- [ ] Admin Command Center visible (total users, signups, etc.)
- [ ] Generate unlimited titles (no quota)

### Test 6: Settings Page
- [ ] Login as Creator or Pro user
- [ ] Go to `/settings`
- [ ] AI Provider dropdown shows available options
- [ ] Trial users see "locked" message
- [ ] Change provider succeeds

### Test 7: Legal Pages
- [ ] `/terms` loads
- [ ] `/privacy` loads
- [ ] `/disclaimer` loads
- [ ] Footer links work
- [ ] "Not affiliated with YouTube" disclaimer visible

### Test 8: API Health
```bash
# Check backend is responding
curl https://titleiq.tightslice.com/api/health
# Should return: {"status":"ok"}
```

---

## 🔍 TROUBLESHOOTING

### Issue: "502 Bad Gateway" on API calls

**Cause:** Backend not running or wrong port

**Solution:**
```bash
ssh root@automations.tightslice.com
pm2 status
pm2 logs titleiq-backend --lines 50
# If crashed:
pm2 restart titleiq-backend
```

### Issue: "CORS policy" error in browser console

**Cause:** `FRONTEND_URL` env var mismatch

**Solution:**
```bash
# Check backend .env
cat /var/www/titleiq/backend/.env | grep FRONTEND_URL
# Should be: FRONTEND_URL=https://titleiq.tightslice.com

# If wrong, fix and restart:
pm2 restart titleiq-backend
```

### Issue: Admin login fails

**Cause:** Admin accounts not seeded

**Solution:**
```bash
ssh root@automations.tightslice.com
cd /var/www/titleiq/backend
node scripts/seedAdmins.js
```

### Issue: Stripe checkout shows "Billing not active yet"

**Cause:** Stripe env vars not configured

**Solution:**
- This is expected if Stripe not configured yet
- App functions normally, users just can't upgrade
- Configure Stripe when ready (see section above)

### Issue: Database errors on startup

**Cause:** Tables not created

**Solution:**
```bash
# Backend should auto-create tables on first run
# If not, check db.js initialization logic
cd /var/www/titleiq/backend
node -e "require('./utils/db.js')"
```

### Issue: Frontend shows old version after deploy

**Cause:** Browser cache

**Solution:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or add cache busting to build (Vite handles this automatically)

---

## 📊 MONITORING

### View Backend Logs
```bash
pm2 logs titleiq-backend
pm2 logs titleiq-backend --lines 200
pm2 logs titleiq-backend --err  # errors only
```

### Monitor Resource Usage
```bash
pm2 monit
# Shows CPU, memory for all pm2 processes
```

### Check Nginx Access Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backup (SQLite)
```bash
# Backup database file
cp /var/www/titleiq/backend/titleiq.db \
   /var/www/titleiq/backend/backups/titleiq_$(date +%Y%m%d).db

# Set up daily cron job:
crontab -e
# Add: 0 2 * * * cp /var/www/titleiq/backend/titleiq.db /var/www/titleiq/backend/backups/titleiq_$(date +\%Y\%m\%d).db
```

---

## 🚨 EMERGENCY ROLLBACK

If deployment breaks production:

```bash
# 1. SSH into server
ssh root@automations.tightslice.com

# 2. Revert backend code
cd /var/www/titleiq/backend
git reset --hard HEAD~1  # Go back 1 commit
npm install
pm2 restart titleiq-backend

# 3. Restore previous frontend build
# (Keep backups before deploying)
rsync -avz /var/www/titleiq/frontend_backup/ \
         /var/www/titleiq/frontend/
```

---

## 🔐 PASSWORD RESET SYSTEM RUNBOOK

### Overview
The password reset system provides secure, production-grade password recovery with:
- Email-based 6-digit codes (15-minute expiry)
- Strict password policies (10+ chars, mixed case, numbers, special chars)
- Rate limiting (5 requests/15min per IP, 5 requests/hour per email)
- Session invalidation on password change
- Zero token leakage in production logs

### Email Provider Setup

#### Option 1: Resend (Recommended)

1. **Create Resend Account**
   ```bash
   # Visit: https://resend.com/signup
   ```

2. **Get API Key**
   ```bash
   # Dashboard > API Keys > Create API Key
   # Copy the key (starts with re_...)
   ```

3. **Configure Environment**
   ```bash
   ssh root@automations.tightslice.com
   cd /var/www/titleiq/backend

   # Add to .env
   echo 'MAIL_PROVIDER=resend' >> .env
   echo 'RESEND_API_KEY=re_your_actual_key_here' >> .env
   echo 'MAIL_FROM="TitleIQ <no-reply@tightslice.com>"' >> .env

   # Restart backend
   pm2 restart titleiq-backend
   ```

4. **Verify Domain (Optional but Recommended)**
   ```
   # Resend Dashboard > Domains > Add Domain
   # Add DNS records as instructed
   # This improves deliverability
   ```

#### Option 2: SendGrid

1. **Create SendGrid Account**
   ```bash
   # Visit: https://signup.sendgrid.com/
   ```

2. **Create API Key**
   ```bash
   # Settings > API Keys > Create API Key
   # Full Access permissions
   ```

3. **Configure Environment**
   ```bash
   ssh root@automations.tightslice.com
   cd /var/www/titleiq/backend

   echo 'MAIL_PROVIDER=sendgrid' >> .env
   echo 'SENDGRID_API_KEY=SG.your_actual_key_here' >> .env
   echo 'MAIL_FROM="TitleIQ <no-reply@tightslice.com>"' >> .env

   pm2 restart titleiq-backend
   ```

### Testing Password Reset

**Quick Test:**
```bash
# Run automated test script
cd /Users/kvimedia/titleiq
./test-reset-flow.sh
```

**Manual Test:**
```bash
# 1. Request reset
curl -X POST https://titleiq.tightslice.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test@email.com"}'

# 2. Check email for 6-digit code

# 3. Reset password
curl -X POST https://titleiq.tightslice.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"your-test@email.com",
    "token":"123456",
    "newPassword":"SecurePassword123!"
  }'

# 4. Login with new password
curl -X POST https://titleiq.tightslice.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test@email.com","password":"SecurePassword123!"}'
```

### Troubleshooting

#### Issue: No Email Received
```bash
# Check email service configuration
ssh root@automations.tightslice.com
cat /var/www/titleiq/backend/.env | grep MAIL

# Check backend logs
pm2 logs titleiq-backend --lines 100 | grep -i "mail\|reset"

# Common fixes:
# 1. Verify API key is correct
# 2. Check spam folder
# 3. Verify domain DNS records (if using custom domain)
# 4. Check Resend/SendGrid dashboard for bounces
```

#### Issue: Rate Limited
```bash
# Check rate limit status
ssh root@automations.tightslice.com
pm2 logs titleiq-backend --lines 50 | grep "RATE_LIMIT"

# Rate limits reset after:
# - 15 minutes for IP-based limits
# - 1 hour for email-based limits

# To manually clear (emergency only):
pm2 restart titleiq-backend  # Clears in-memory rate limit store
```

#### Issue: Password Rejected
```bash
# Password must meet ALL requirements:
# - At least 10 characters
# - One uppercase letter (A-Z)
# - One lowercase letter (a-z)
# - One number (0-9)
# - One special character (!@#$%^&*)
# - No common patterns (password123, qwerty, etc.)

# Test password strength locally:
node -e "
const pwd = 'YourPassword123!';
console.log('Length:', pwd.length >= 10);
console.log('Upper:', /[A-Z]/.test(pwd));
console.log('Lower:', /[a-z]/.test(pwd));
console.log('Number:', /[0-9]/.test(pwd));
console.log('Special:', /[^a-zA-Z0-9]/.test(pwd));
"
```

#### Issue: Token Expired
```bash
# Tokens expire after 15 minutes
# User must request a new code

# Check token expiry in database:
ssh root@automations.tightslice.com
sqlite3 /var/www/titleiq/backend/database/titleiq.db \
  "SELECT email, password_reset_expires,
   datetime(password_reset_expires/1000, 'unixepoch') as expires_at
   FROM users WHERE password_reset_expires IS NOT NULL;"
```

#### Issue: Sessions Not Invalidated
```bash
# Verify password_version column exists
sqlite3 /var/www/titleiq/backend/database/titleiq.db \
  "PRAGMA table_info(users);" | grep password_version

# If missing, run migration:
ssh root@automations.tightslice.com
cd /var/www/titleiq/backend
node migrations/add-password-version.mjs
pm2 restart titleiq-backend
```

### Rotating Email API Keys

```bash
# 1. Generate new API key in provider dashboard

# 2. Update production environment
ssh root@automations.tightslice.com
cd /var/www/titleiq/backend

# Edit .env
nano .env
# Update RESEND_API_KEY or SENDGRID_API_KEY

# 3. Restart backend
pm2 restart titleiq-backend

# 4. Verify
pm2 logs titleiq-backend --lines 20

# 5. Test password reset flow
curl -X POST https://titleiq.tightslice.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 6. Revoke old key in provider dashboard
```

### Monitoring

**Key Metrics to Watch:**
```bash
# Email delivery rate
pm2 logs titleiq-backend | grep "MAILER.*sent"

# Rate limit hits (potential attack)
pm2 logs titleiq-backend | grep "RATE_LIMIT.*exceeded"

# Password reset completions
pm2 logs titleiq-backend | grep "Password reset successful"

# Session invalidations
pm2 logs titleiq-backend | grep "password_changed"

# Failed attempts
pm2 logs titleiq-backend | grep "Invalid or expired reset token"
```

**Set Up Alerts (Optional):**
```bash
# Using logwatch or similar:
# Alert on:
# - Spike in rate limit hits (>50/hour)
# - Email delivery failures (>10/day)
# - Repeated invalid token attempts (>20/hour)
```

### Security Notes

1. **No Token Leakage**
   - Tokens never logged in production (NODE_ENV=production)
   - Only masked emails in logs (te**@example.com)

2. **Timing Attack Prevention**
   - All responses include 100-300ms jitter
   - Same response for existing/non-existing emails

3. **Brute Force Protection**
   - Dual rate limiting (IP + email)
   - Single-use tokens
   - 15-minute expiry

4. **Session Security**
   - Old tokens invalidated on password change
   - User must re-login after reset

### Deployment Checklist

Before deploying password reset to production:

- [ ] Email service configured (RESEND_API_KEY or SENDGRID_API_KEY)
- [ ] NODE_ENV=production set
- [ ] Run migration: `node migrations/add-password-version.mjs`
- [ ] Test with real email account
- [ ] Verify no tokens in logs: `pm2 logs titleiq-backend | grep -i token`
- [ ] Test rate limiting (make 6 rapid requests)
- [ ] Test session invalidation (reset password with active session)
- [ ] Test weak password rejection
- [ ] Frontend shows password requirements
- [ ] Confirmation email received
- [ ] Update team documentation

### Quick Reference

**Files Modified:**
- `backend/routes/auth.js` - Reset endpoints
- `backend/middleware/rateLimit.js` - Sensitive rate limiting
- `backend/middleware/auth.js` - Session validation
- `backend/utils/mailer.js` - Email service
- `backend/utils/passwordPolicy.js` - Password validation
- `backend/utils/db.js` - Database methods
- `frontend/src/pages/ForgotPassword.jsx` - Request reset UI
- `frontend/src/pages/ResetPassword.jsx` - Complete reset UI

**Migrations:**
- `backend/migrations/add-password-reset.mjs` - Reset token columns
- `backend/migrations/add-password-version.mjs` - Session invalidation

**Documentation:**
- `RESET_FLOW_CHECKLIST.md` - Complete testing guide
- `test-reset-flow.sh` - Automated test script

---

## 📞 SUPPORT CONTACTS

- **Technical Issues:** Check GitHub Issues
- **Stripe Support:** dashboard.stripe.com/support
- **DNS/Hosting:** Contact hosting provider
- **Business Questions:** tightslice.com/contact

---

## ✨ POST-LAUNCH CHECKLIST

After successful deployment:

- [ ] Change all admin passwords from default
- [ ] Set up monitoring/alerts (optional: Sentry, UptimeRobot)
- [ ] Configure regular database backups
- [ ] Test password reset flow (if implemented)
- [ ] Monitor error logs for first 48 hours
- [ ] Share admin credentials with team securely (1Password, etc.)
- [ ] Document any custom configuration
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit on homepage
- [ ] Verify SSL certificate auto-renewal

---

## 🎯 MISSION ACCOMPLISHED

When all smoke tests pass and admin accounts are secured, TitleIQ is **PRODUCTION-READY**.

The platform is now:
- ✅ Legally covered (Terms, Privacy, Disclaimer)
- ✅ Abuse-protected (rate limiting)
- ✅ Admin-secured (role enforcement)
- ✅ Founder-operable (this playbook)
- ✅ Stripe-ready (just add keys when ready)

**Now go make revenue!** 🚀

---

*Last updated: January 2025*
*Maintainer: TightSlice Engineering*
*Version: 1.0.0*
