#!/usr/bin/env node

/**
 * Database Migration Runner
 * Run with: node backend/migrations/run-migration.js
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/titleiq.db');
const migrationPath = join(__dirname, 'add-user-profile-columns.sql');

console.log('🚀 Starting database migration...');
console.log(`📂 Database: ${dbPath}`);
console.log(`📄 Migration: ${migrationPath}`);

try {
  const db = new Database(dbPath);
  const migration = fs.readFileSync(migrationPath, 'utf8');

  // Split by semicolons and execute each statement
  const statements = migration
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  db.transaction(() => {
    for (const statement of statements) {
      try {
        db.exec(statement);
        console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
      } catch (error) {
        // Ignore "duplicate column" errors for reruns
        if (error.message.includes('duplicate column')) {
          console.log(`⏭️  Skipped (already exists): ${statement.substring(0, 60)}...`);
        } else {
          throw error;
        }
      }
    }
  })();

  db.close();
  console.log('✅ Migration completed successfully!');
  console.log('🎉 User profile columns are now available.');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
