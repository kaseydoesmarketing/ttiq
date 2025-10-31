/**
 * CRITICAL DATABASE MIGRATION
 * Adds missing onboarding columns to users table
 *
 * ZEROFAIL FINDING: Database schema is missing columns that the onboarding
 * wizard attempts to save, causing silent data loss.
 *
 * Missing columns:
 * - onboarding_completed (critical)
 * - niche
 * - channel_size
 * - primary_goal
 * - upload_schedule
 * - social_links (JSON)
 * - hashtags (JSON)
 * - keywords (JSON)
 * - demographics (JSON)
 * - brand_voice
 * - competitors (JSON)
 * - biggest_challenge
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/titleiq.db');

console.log('===================================================');
console.log('DATABASE MIGRATION: Add Onboarding Columns');
console.log('===================================================\n');

try {
  const db = new Database(dbPath);

  console.log('Starting migration...\n');

  // List of columns to add
  const columnsToAdd = [
    { name: 'onboarding_completed', type: 'INTEGER DEFAULT 0' },
    { name: 'content_type', type: 'TEXT' },
    { name: 'niche', type: 'TEXT' },
    { name: 'channel_size', type: 'TEXT' },
    { name: 'primary_goal', type: 'TEXT' },
    { name: 'upload_schedule', type: 'TEXT' },
    { name: 'social_links', type: 'TEXT' }, // JSON string
    { name: 'hashtags', type: 'TEXT' }, // JSON array
    { name: 'keywords', type: 'TEXT' }, // JSON array
    { name: 'demographics', type: 'TEXT' }, // JSON object
    { name: 'brand_voice', type: 'TEXT' },
    { name: 'competitors', type: 'TEXT' }, // JSON array
    { name: 'biggest_challenge', type: 'TEXT' }
  ];

  // Get existing columns
  const existingColumns = db.prepare("PRAGMA table_info(users)").all();
  const existingColumnNames = existingColumns.map(col => col.name);

  console.log('Existing columns:', existingColumnNames.join(', '), '\n');

  let addedCount = 0;
  let skippedCount = 0;

  // Add each column if it doesn't exist
  for (const column of columnsToAdd) {
    if (existingColumnNames.includes(column.name)) {
      console.log(`⏭  ${column.name} - Already exists, skipping`);
      skippedCount++;
    } else {
      try {
        const sql = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`;
        db.prepare(sql).run();
        console.log(`✓ ${column.name} - Added successfully`);
        addedCount++;
      } catch (error) {
        console.error(`✗ ${column.name} - Failed:`, error.message);
      }
    }
  }

  console.log('\n===================================================');
  console.log('Migration Summary:');
  console.log(`  Added: ${addedCount} columns`);
  console.log(`  Skipped: ${skippedCount} columns (already existed)`);
  console.log('===================================================\n');

  // Verify migration
  const newColumns = db.prepare("PRAGMA table_info(users)").all();
  const newColumnNames = newColumns.map(col => col.name);

  const missingColumns = columnsToAdd
    .map(col => col.name)
    .filter(name => !newColumnNames.includes(name));

  if (missingColumns.length === 0) {
    console.log('✓ Migration successful - All onboarding columns present\n');
  } else {
    console.error('✗ Migration incomplete - Missing columns:', missingColumns.join(', '), '\n');
    process.exit(1);
  }

  db.close();

} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
