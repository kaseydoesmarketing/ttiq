-- ============================================================================
-- TitleIQ Admin Dashboard v2 - Database Migrations
-- ============================================================================
-- VERSION: 1.0.0
-- DATE: 2025-10-28
-- AUTHOR: BOSS PRIME
-- PURPOSE: EntitleIQ grants + LLM usage tracking + request metrics + daily rollups

-- ============================================================================
-- 1. ENTITLEMENTS (CompProBetaGrants / EntitleIQ)
-- ============================================================================

CREATE TABLE IF NOT EXISTS entitlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL,                   -- e.g., 'Pro — Lifetime'
  source TEXT NOT NULL,                  -- 'beta_comp', 'manual_override', 'partner_referral'
  granted_by TEXT NOT NULL,              -- admin user_id who granted this
  notes TEXT,                            -- Freeform notes (e.g., "Founding tester wave A")
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT DEFAULT NULL,          -- NULL = active, datetime = revoked
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(granted_by) REFERENCES users(id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_active ON entitlements(user_id, revoked_at);
CREATE INDEX IF NOT EXISTS idx_entitlements_granted_by ON entitlements(granted_by);

-- ============================================================================
-- 2. LLM USAGE (Per-user, per-model tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS llm_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  model TEXT NOT NULL,                   -- e.g., 'gpt-4o', 'gpt-4.1', 'sonnet-4.5'
  count INTEGER NOT NULL DEFAULT 0,
  last_used_at TEXT,                     -- ISO 8601 timestamp
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Unique constraint: one row per user-model pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_llm_usage_user_model ON llm_usage(user_id, model);

-- ============================================================================
-- 3. REQUEST METRICS (Performance tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS request_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,                      -- ISO 8601 timestamp
  duration_ms INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  route TEXT NOT NULL                    -- e.g., '/api/generate', '/api/admin/stats'
);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_reqmetrics_ts ON request_metrics(ts);
CREATE INDEX IF NOT EXISTS idx_reqmetrics_route ON request_metrics(route);

-- ============================================================================
-- 4. DAILY USAGE ROLLUPS (Optional aggregation for sparklines)
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                    -- YYYY-MM-DD
  model TEXT NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  UNIQUE(date, model)
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON daily_usage(date);

-- ============================================================================
-- MIGRATION LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS migration_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_name TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now')),
  success INTEGER NOT NULL DEFAULT 1     -- 1 = success, 0 = failed
);

INSERT INTO migration_log (migration_name, success)
VALUES ('002_admin_dashboard_v2', 1);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that all tables were created
SELECT name FROM sqlite_master WHERE type='table' AND name IN (
  'entitlements',
  'llm_usage',
  'request_metrics',
  'daily_usage',
  'migration_log'
) ORDER BY name;

-- Check indexes
SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name;

-- ============================================================================
-- ROLLBACK SCRIPT (for emergencies)
-- ============================================================================

-- DROP TABLE IF EXISTS entitlements;
-- DROP TABLE IF EXISTS llm_usage;
-- DROP TABLE IF EXISTS request_metrics;
-- DROP TABLE IF EXISTS daily_usage;
-- DELETE FROM migration_log WHERE migration_name = '002_admin_dashboard_v2';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
