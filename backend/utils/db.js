import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/titleiq.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

/**
 * Initialize database schema
 * UPGRADED FOR SAAS: Users, Plans, Usage Tracking, Billing, Newsletter
 */
function initializeDatabase() {
  db.exec(`
    -- USERS TABLE (UPGRADED FOR SAAS)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      plan TEXT NOT NULL DEFAULT 'trial' CHECK(plan IN ('trial', 'creator', 'creator_pro')),
      status TEXT NOT NULL DEFAULT 'trial' CHECK(status IN ('trial', 'active', 'past_due', 'cancelled', 'lifetime')),
      trial_start INTEGER,
      trial_expires INTEGER,
      billing_status TEXT DEFAULT 'ok' CHECK(billing_status IN ('ok', 'past_due', 'lifetime')),
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      model_provider TEXT DEFAULT 'groq' CHECK(model_provider IN ('openai', 'groq', 'grok', 'gemini')),
      model_api_key_encrypted TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

    -- USAGE LOGS (DAILY TRACKING PER USER)
    CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      count_generations INTEGER NOT NULL DEFAULT 0,
      count_transcripts INTEGER NOT NULL DEFAULT 0,
      last_updated INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON usage_logs(user_id, date);

    -- USER GENERATIONS (HISTORY)
    CREATE TABLE IF NOT EXISTS user_generations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      transcript_excerpt TEXT,
      titles TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT,
      used_provider TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_user_generations_user_id ON user_generations(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_generations_created_at ON user_generations(created_at);

    -- NEWSLETTER SIGNUPS
    CREATE TABLE IF NOT EXISTS newsletter_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL DEFAULT 'titleiq',
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_signups(email);
    CREATE INDEX IF NOT EXISTS idx_newsletter_created ON newsletter_signups(created_at);

    -- TRANSCRIPTS TABLE (EXISTING - KEEP AS-IS)
    CREATE TABLE IF NOT EXISTS transcripts (
      video_id TEXT PRIMARY KEY,
      transcript TEXT NOT NULL,
      source TEXT NOT NULL CHECK(source IN ('captions', 'asr', 'manual')),
      duration_sec INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_transcripts_created_at ON transcripts(created_at);
    CREATE INDEX IF NOT EXISTS idx_transcripts_source ON transcripts(source);

    -- TRANSCRIPT JOBS (EXISTING - KEEP AS-IS)
    CREATE TABLE IF NOT EXISTS transcript_jobs (
      job_id TEXT PRIMARY KEY,
      video_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('PENDING','PROCESSING','DONE','ERROR')),
      transcript TEXT,
      source TEXT CHECK(source IN ('captions','asr')),
      duration_sec INTEGER,
      error TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transcript_jobs_status ON transcript_jobs(status);
    CREATE INDEX IF NOT EXISTS idx_transcript_jobs_video ON transcript_jobs(video_id);
    CREATE INDEX IF NOT EXISTS idx_transcript_jobs_created ON transcript_jobs(created_at);

    -- LEGACY GENERATIONS TABLE (KEEP FOR BACKWARDS COMPAT)
    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      video_url TEXT,
      transcript TEXT,
      titles TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
    CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);
  `);

  // Seed admin accounts if they don't exist
  seedAdminAccounts();
}

/**
 * Seed permanent admin accounts with lifetime access
 */
function seedAdminAccounts() {
  const adminEmails = [
    'kasey@tightslice.com',
    'themenup365@gmail.com',
    'shemka.womenofexcellence@gmail.com'
  ];

  const now = Date.now();
  const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
  const insertStmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, role, plan, status, billing_status, created_at, updated_at)
    VALUES (?, ?, ?, 'admin', 'creator_pro', 'active', 'lifetime', ?, ?)
  `);

  adminEmails.forEach(email => {
    const existing = checkStmt.get(email);
    if (!existing) {
      const id = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Placeholder password hash - admins should reset via secure channel
      const placeholderHash = '$2b$10$placeholder.admin.account.hash.for.security';
      insertStmt.run(id, email, placeholderHash, now, now);
      console.log(`[DB] Seeded admin account: ${email}`);
    }
  });
}

/**
 * PLAN LIMITS CONFIGURATION
 */
export const PLAN_LIMITS = {
  trial: {
    displayName: 'Trial',
    maxGenerationsPerDay: 10,
    maxTitlesPerGeneration: 5, // Limited output for trial
    canChooseProvider: false,
    availableProviders: [],
    features: ['transcript_extraction', 'basic_titles', 'basic_description']
  },
  creator: {
    displayName: 'Creator',
    price: 15,
    maxGenerationsPerDay: 25,
    maxTitlesPerGeneration: 10,
    canChooseProvider: true,
    availableProviders: ['openai', 'groq'],
    features: ['transcript_extraction', 'optimized_titles', 'long_description', 'seo_tags']
  },
  creator_pro: {
    displayName: 'Creator Pro',
    price: 29,
    maxGenerationsPerDay: 75,
    maxTitlesPerGeneration: 10,
    canChooseProvider: true,
    availableProviders: ['openai', 'groq', 'grok', 'gemini'],
    features: ['transcript_extraction', 'optimized_titles', 'long_description', 'seo_tags', 'chapter_breakdown_coming_soon', 'advanced_seo_pack']
  }
};

// ==========================================
// USER OPERATIONS (UPGRADED)
// ==========================================

export const userDb = {
  create: (id, email, passwordHash, options = {}) => {
    const now = Date.now();
    const trialExpires = now + (3 * 24 * 60 * 60 * 1000); // 3 days
    const stmt = db.prepare(`
      INSERT INTO users (
        id, email, password_hash, role, plan, status,
        trial_start, trial_expires, billing_status,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      id,
      email,
      passwordHash,
      options.role || 'user',
      options.plan || 'trial',
      options.status || 'trial',
      now,
      trialExpires,
      options.billing_status || 'ok',
      now,
      now
    );
  },

  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  updatePlan: (userId, plan, status = 'active') => {
    const stmt = db.prepare(`
      UPDATE users
      SET plan = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);
    return stmt.run(plan, status, Date.now(), userId);
  },

  updateBilling: (userId, stripeCustomerId, stripeSubscriptionId) => {
    const stmt = db.prepare(`
      UPDATE users
      SET stripe_customer_id = ?, stripe_subscription_id = ?, updated_at = ?
      WHERE id = ?
    `);
    return stmt.run(stripeCustomerId, stripeSubscriptionId, Date.now(), userId);
  },

  updateProvider: (userId, provider, encryptedApiKey = null) => {
    const stmt = db.prepare(`
      UPDATE users
      SET model_provider = ?, model_api_key_encrypted = ?, updated_at = ?
      WHERE id = ?
    `);
    return stmt.run(provider, encryptedApiKey, Date.now(), userId);
  },

  isAdmin: (userId) => {
    const stmt = db.prepare('SELECT role FROM users WHERE id = ?');
    const user = stmt.get(userId);
    return user?.role === 'admin';
  },

  hasUnlimitedUsage: (userId) => {
    const stmt = db.prepare('SELECT billing_status, role FROM users WHERE id = ?');
    const user = stmt.get(userId);
    return user?.billing_status === 'lifetime' || user?.role === 'admin';
  }
};

// ==========================================
// USAGE TRACKING
// ==========================================

export const usageDb = {
  getTodayUsage: (userId) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const stmt = db.prepare(`
      SELECT * FROM usage_logs
      WHERE user_id = ? AND date = ?
    `);
    return stmt.get(userId, today) || { count_generations: 0, count_transcripts: 0 };
  },

  incrementGenerations: (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO usage_logs (user_id, date, count_generations, count_transcripts, last_updated)
      VALUES (?, ?, 1, 0, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        count_generations = count_generations + 1,
        last_updated = ?
    `);
    return stmt.run(userId, today, now, now);
  },

  incrementTranscripts: (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO usage_logs (user_id, date, count_generations, count_transcripts, last_updated)
      VALUES (?, ?, 0, 1, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        count_transcripts = count_transcripts + 1,
        last_updated = ?
    `);
    return stmt.run(userId, today, now, now);
  },

  checkLimit: (userId, plan) => {
    // Admins / lifetime = unlimited
    if (userDb.hasUnlimitedUsage(userId)) {
      return { allowed: true, remaining: 999999 };
    }

    const limits = PLAN_LIMITS[plan];
    if (!limits) {
      return { allowed: false, remaining: 0, error: 'Invalid plan' };
    }

    const usage = usageDb.getTodayUsage(userId);
    const remaining = limits.maxGenerationsPerDay - usage.count_generations;

    return {
      allowed: usage.count_generations < limits.maxGenerationsPerDay,
      remaining: Math.max(0, remaining),
      limit: limits.maxGenerationsPerDay,
      used: usage.count_generations
    };
  }
};

// ==========================================
// USER GENERATIONS (HISTORY)
// ==========================================

export const userGenerations = {
  create: (id, userId, transcript, titles, description, tags, usedProvider) => {
    const now = Date.now();
    const transcriptExcerpt = transcript.substring(0, 200);
    const stmt = db.prepare(`
      INSERT INTO user_generations (
        id, user_id, created_at, transcript_excerpt,
        titles, description, tags, used_provider
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      id,
      userId,
      now,
      transcriptExcerpt,
      JSON.stringify(titles),
      description,
      tags || '',
      usedProvider
    );
  },

  findByUserId: (userId, limit = 20) => {
    const stmt = db.prepare(`
      SELECT * FROM user_generations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    const results = stmt.all(userId, limit);
    return results.map(row => ({
      ...row,
      titles: JSON.parse(row.titles)
    }));
  }
};

// ==========================================
// NEWSLETTER SIGNUPS
// ==========================================

export const newsletterDb = {
  add: (email, source = 'titleiq') => {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO newsletter_signups (email, source, created_at)
      VALUES (?, ?, ?)
      ON CONFLICT(email) DO NOTHING
    `);
    return stmt.run(email, source, now);
  },

  count: () => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM newsletter_signups');
    return stmt.get().count;
  },

  recent: (limit = 100) => {
    const stmt = db.prepare(`
      SELECT * FROM newsletter_signups
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }
};

// ==========================================
// TRANSCRIPT JOBS (EXISTING - KEEP AS-IS)
// ==========================================

export const transcriptJobs = {
  createPending: (jobId, videoId) => {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO transcript_jobs (job_id, video_id, status, created_at, updated_at)
      VALUES (?, ?, 'PENDING', ?, ?)
    `);
    return stmt.run(jobId, videoId, now, now);
  },

  markProcessing: (jobId) => {
    const stmt = db.prepare(`
      UPDATE transcript_jobs
      SET status = 'PROCESSING', updated_at = ?
      WHERE job_id = ?
    `);
    return stmt.run(Date.now(), jobId);
  },

  markDone: (jobId, transcript, source, durationSec) => {
    const stmt = db.prepare(`
      UPDATE transcript_jobs
      SET status = 'DONE',
          transcript = ?,
          source = ?,
          duration_sec = ?,
          updated_at = ?
      WHERE job_id = ?
    `);
    return stmt.run(transcript, source, durationSec || null, Date.now(), jobId);
  },

  markError: (jobId, errorMessage) => {
    const stmt = db.prepare(`
      UPDATE transcript_jobs
      SET status = 'ERROR',
          error = ?,
          updated_at = ?
      WHERE job_id = ?
    `);
    return stmt.run(errorMessage, Date.now(), jobId);
  },

  get: (jobId) => {
    const stmt = db.prepare('SELECT * FROM transcript_jobs WHERE job_id = ?');
    return stmt.get(jobId);
  },

  getNextPending: () => {
    const stmt = db.prepare(`
      SELECT * FROM transcript_jobs
      WHERE status = 'PENDING'
      ORDER BY created_at ASC
      LIMIT 1
    `);
    return stmt.get();
  },

  cleanupOld: (maxAgeMs = 24 * 60 * 60 * 1000) => {
    const cutoff = Date.now() - maxAgeMs;
    const stmt = db.prepare(`
      DELETE FROM transcript_jobs
      WHERE created_at < ?
    `);
    return stmt.run(cutoff);
  }
};

// ==========================================
// ADMIN ANALYTICS
// ==========================================

export const analyticsDb = {
  getMetrics: () => {
    const metrics = {};

    // Active users
    metrics.activeUsers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM usage_logs
      WHERE date >= date('now', '-30 days')
    `).get().count;

    // Signups last 24h
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    metrics.signupsLast24h = db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= ?
    `).get(dayAgo).count;

    // Trial users
    metrics.trialUsers = db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE status = 'trial'
    `).get().count;

    // Paying users
    metrics.payingUsers = db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE status = 'active' AND plan IN ('creator', 'creator_pro')
    `).get().count;

    // Newsletter subscribers
    metrics.newsletterSubscribers = newsletterDb.count();

    // Title requests today
    const today = new Date().toISOString().split('T')[0];
    metrics.titleRequestsToday = db.prepare(`
      SELECT COALESCE(SUM(count_generations), 0) as count
      FROM usage_logs
      WHERE date = ?
    `).get(today).count;

    // Transcript requests today
    metrics.transcriptRequestsToday = db.prepare(`
      SELECT COALESCE(SUM(count_transcripts), 0) as count
      FROM usage_logs
      WHERE date = ?
    `).get(today).count;

    return metrics;
  }
};

// Initialize database on import
initializeDatabase();

export default db;
