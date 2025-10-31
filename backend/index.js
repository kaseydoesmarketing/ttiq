import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import billingRoutes from './routes/billing.js';
import newsletterRoutes from './routes/newsletter.js';
import adminRoutes from './routes/admin.js';
import adminStatsRoutes from './routes/adminStats.js';
import adminGrantsRoutes from './routes/adminGrants.js';
import adminLLMUsageRoutes from './routes/adminLLMUsage.js';
import adminLiveRoutes from './routes/adminLive.js';
import userRoutes from './routes/user.js';
import settingsRoutes from './routes/settings.js';
import generateRoutes from './routes/generate.js';
import transcriptStartRoutes from './routes/transcriptStart.js';
import transcriptStatusRoutes from './routes/transcriptStatus.js';
import onboardingRoutes from './routes/onboarding.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses behind Nginx
app.set('trust proxy', 1);

// Security middleware - Helmet with HSTS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disable CSP to avoid breaking SPA (configure later if needed)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: false, // Only enable if ALL subdomains are HTTPS
    preload: false // Only enable after confirming all subdomains ready
  }
}));

// Middleware - CORS with specific origins
app.use(cors({
  origin: [
    'https://titleiq.tightslice.com',
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Stripe webhook needs raw body - handle before express.json()
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

app.use(express.json({ limit: '10mb' }));

// Health check (minimal response in production)
app.get('/api/health', (req, res) => {
  // In production, only return basic status unless internal health key is present
  if (process.env.NODE_ENV === 'production' &&
      req.get('X-Internal-Health') !== process.env.HEALTH_SECRET) {
    return res.json({ ok: true });
  }

  // Detailed response for development or internal monitoring
  res.json({
    ok: true,
    service: 'TitleIQ API',
    env: process.env.NODE_ENV || 'development',
    mailProvider: process.env.MAIL_PROVIDER || 'none',
    time: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminStatsRoutes);
app.use('/api/admin', adminGrantsRoutes);
app.use('/api/admin', adminLLMUsageRoutes);
app.use('/api/admin', adminLiveRoutes);
app.use('/api/user', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/transcript', transcriptStartRoutes);
app.use('/api/transcript/status', transcriptStatusRoutes);
app.use('/api', generateRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ TitleIQ API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL || 'all origins'}`);
});
