-- Migration: Add user profile columns for personalized onboarding
-- Date: 2025-10-30
-- Purpose: Enable 10-12 step onboarding wizard with comprehensive user profiling

-- Add new columns to users table
ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN onboarding_step INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN content_type TEXT; -- Educational, Entertainment, Gaming, etc.
ALTER TABLE users ADD COLUMN niche TEXT; -- Specific niche/industry
ALTER TABLE users ADD COLUMN channel_size TEXT; -- 0-1K, 1K-10K, etc.
ALTER TABLE users ADD COLUMN primary_goal TEXT; -- Growth, monetization, engagement
ALTER TABLE users ADD COLUMN upload_schedule TEXT; -- Daily, Weekly, etc.
ALTER TABLE users ADD COLUMN social_links TEXT; -- JSON: {youtube, instagram, tiktok, twitter, linkedin, facebook}
ALTER TABLE users ADD COLUMN hashtags TEXT; -- JSON array of 5-10 hashtags
ALTER TABLE users ADD COLUMN keywords TEXT; -- JSON array of 5-10 target keywords
ALTER TABLE users ADD COLUMN demographics TEXT; -- JSON: {ageRange, location, interests}
ALTER TABLE users ADD COLUMN brand_voice TEXT; -- Professional, casual, energetic, educational
ALTER TABLE users ADD COLUMN competitors TEXT; -- JSON array of 3-5 competitor channels
ALTER TABLE users ADD COLUMN biggest_challenge TEXT; -- CTR, ranking, standing out, etc.

-- Create index for faster onboarding queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed, onboarding_step);
