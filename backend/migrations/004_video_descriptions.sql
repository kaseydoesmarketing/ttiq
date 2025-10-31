-- Migration: Add video_descriptions table for 4-layout description generator
-- Date: 2025-10-31

-- Create video_descriptions table
CREATE TABLE IF NOT EXISTS video_descriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  generation_id TEXT, -- links to user_generations
  video_title TEXT NOT NULL,
  layout_a TEXT, -- Creator/Educational
  layout_b TEXT, -- Show/Podcast
  layout_c TEXT, -- News/Commentary
  layout_d TEXT, -- Tech/Product Review
  selected_layout TEXT CHECK(selected_layout IN ('a', 'b', 'c', 'd')), -- which one user chose
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_video_descriptions_user_id ON video_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_video_descriptions_generation_id ON video_descriptions(generation_id);
CREATE INDEX IF NOT EXISTS idx_video_descriptions_created_at ON video_descriptions(created_at);

-- Add new fields to users table for description generator data
-- These are captured in the new 6-step onboarding

-- Primary/Secondary offers
ALTER TABLE users ADD COLUMN primary_offer_label TEXT;
ALTER TABLE users ADD COLUMN primary_offer_url TEXT;
ALTER TABLE users ADD COLUMN secondary_offer_label TEXT;
ALTER TABLE users ADD COLUMN secondary_offer_url TEXT;
ALTER TABLE users ADD COLUMN contact_email TEXT;

-- Affiliates (stored as JSON array)
ALTER TABLE users ADD COLUMN affiliates TEXT; -- JSON: [{ label, url }, ...]

-- Sponsor mention
ALTER TABLE users ADD COLUMN sponsor_mention TEXT;
