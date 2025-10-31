#!/usr/bin/env node

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/titleiq.db');
const migrationPath = join(__dirname, '004_video_descriptions.sql');

console.log('[MIGRATION] Running 004_video_descriptions.sql...');
console.log('[MIGRATION] Database:', dbPath);

const db = new Database(dbPath);

try {
  // Read migration file
  const migration = readFileSync(migrationPath, 'utf-8');

  // Remove comments and split into statements
  const statements = migration
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`[MIGRATION] Found ${statements.length} statements to execute`);

  // Execute each statement individually
  statements.forEach((statement, index) => {
    try {
      db.exec(statement + ';');
      console.log(`[MIGRATION] ✅ Statement ${index + 1}/${statements.length} executed`);
    } catch (error) {
      // Ignore "duplicate column" errors (migration already ran)
      if (error.message.includes('duplicate column') || error.message.includes('already exists')) {
        console.log(`[MIGRATION] ⏭️  Statement ${index + 1} skipped (${error.message.substring(0, 50)}...)`);
      } else {
        console.error(`[MIGRATION] ❌ Statement ${index + 1} failed:`, statement.substring(0, 100));
        throw error;
      }
    }
  });

  console.log('[MIGRATION] ✅ Migration completed successfully!');

  // Verify table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='video_descriptions'").all();
  if (tables.length > 0) {
    console.log('[MIGRATION] ✅ video_descriptions table verified');

    // Show table schema
    const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='video_descriptions'").get();
    console.log('[MIGRATION] Table schema:', schema.sql);
  }

  db.close();
} catch (error) {
  console.error('[MIGRATION] ❌ Migration failed:', error.message);
  console.error(error.stack);
  db.close();
  process.exit(1);
}
