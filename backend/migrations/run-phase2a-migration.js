#!/usr/bin/env node

/**
 * Phase 2A Database Migration Runner
 * Run with: node backend/migrations/run-phase2a-migration.js
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/titleiq.db');
const migrationPath = join(__dirname, '003_phase2a_onboarding_admin.sql');

console.log('🚀 Starting Phase 2A database migration...');
console.log(`📂 Database: ${dbPath}`);
console.log(`📄 Migration: ${migrationPath}`);

try {
  const db = new Database(dbPath);
  const migration = fs.readFileSync(migrationPath, 'utf8');

  // Execute the entire migration as one script to handle multi-statement operations
  db.exec(migration);

  db.close();
  console.log('✅ Phase 2A migration completed successfully!');
  console.log('🎉 New features available:');
  console.log('   - Brand & Channel onboarding fields');
  console.log('   - Title preferences system');
  console.log('   - Admin action audit log');
  console.log('   - Pin comment recommendations');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
