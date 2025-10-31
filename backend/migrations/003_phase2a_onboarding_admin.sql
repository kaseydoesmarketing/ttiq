-- ============================================================================
-- TitleIQ Phase 2A - Onboarding v2 & Admin Features
-- ============================================================================
-- VERSION: 2.0.0
-- DATE: 2025-10-31
-- AUTHOR: NEXUS ORCHESTRATOR
-- PURPOSE: Brand/channel data + title preferences + admin audit + pin comments

-- ============================================================================
-- 1. ONBOARDING V2 - Brand & Channel Information
-- ============================================================================

-- Add brand and channel columns to users table (channel_name may already exist)
-- ALTER TABLE users ADD COLUMN channel_name TEXT; -- Skip if exists
ALTER TABLE users ADD COLUMN brand_name TEXT;
ALTER TABLE users ADD COLUMN website_url TEXT;
ALTER TABLE users ADD COLUMN title_preferences TEXT; -- JSON: {includeBrand, includeChannel, includeEpisode}
ALTER TABLE users ADD COLUMN episode_number TEXT; -- Current/latest episode number

-- ============================================================================
-- 2. ADMIN ACTION AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_action_audit (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,                    -- 'upgrade_user', 'suspend_account', 'restore_account', 'grant_entitlement'
  admin_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  metadata TEXT,                           -- JSON: {plan, reason, old_value, new_value, etc.}
  timestamp INTEGER NOT NULL,              -- Unix timestamp
  FOREIGN KEY(admin_id) REFERENCES users(id),
  FOREIGN KEY(target_user_id) REFERENCES users(id)
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON admin_action_audit(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_action_audit(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_timestamp ON admin_action_audit(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_action_audit(action);

-- ============================================================================
-- 3. PIN COMMENT RECOMMENDATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pin_comment_recommendations (
  id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL,             -- Links to title generation session
  user_id TEXT NOT NULL,
  comment_text TEXT NOT NULL,              -- Max 150 characters
  engagement_score INTEGER,                -- 0-100 predicted engagement score
  strategy TEXT,                           -- 'question_hook', 'cta_hook', 'controversy_hook'
  reasoning TEXT,                          -- Why this comment was generated
  created_at INTEGER NOT NULL,             -- Unix timestamp
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Indexes for pin comment queries
CREATE INDEX IF NOT EXISTS idx_pin_comments_generation ON pin_comment_recommendations(generation_id);
CREATE INDEX IF NOT EXISTS idx_pin_comments_user ON pin_comment_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_pin_comments_score ON pin_comment_recommendations(engagement_score);

-- ============================================================================
-- 4. MIGRATION LOG ENTRY
-- ============================================================================

INSERT INTO migration_log (migration_name, success)
VALUES ('003_phase2a_onboarding_admin', 1);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check new columns in users table
PRAGMA table_info(users);

-- Check that new tables were created
SELECT name FROM sqlite_master WHERE type='table' AND name IN (
  'admin_action_audit',
  'pin_comment_recommendations'
) ORDER BY name;

-- Check indexes
SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_admin_%' OR name LIKE 'idx_pin_%' ORDER BY name;

-- ============================================================================
-- ROLLBACK SCRIPT (for emergencies)
-- ============================================================================

-- -- Remove columns (SQLite limitation: can't drop columns easily)
-- -- Would require table recreation
-- DROP TABLE IF EXISTS admin_action_audit;
-- DROP TABLE IF EXISTS pin_comment_recommendations;
-- DELETE FROM migration_log WHERE migration_name = '003_phase2a_onboarding_admin';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
