/**
 * Grant Creator Pro Lifetime to a user
 * Usage: node grant-lifetime.mjs <email> [notes]
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/titleiq.db');
const db = new Database(dbPath);

const email = process.argv[2];
const notes = process.argv[3] || 'Admin grant';
const adminId = 'admin_1761608522301_wp65oqnwi'; // kasey@tightslice.com

if (!email) {
  console.error('❌ Usage: node grant-lifetime.mjs <email> [notes]');
  process.exit(1);
}

try {
  // Find the user
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  console.log(`✓ Found user: ${email}`);
  console.log(`  Current plan: ${user.plan}`);
  console.log(`  Current status: ${user.billing_status}`);
  console.log('');

  // Check if already has lifetime
  if (user.plan === 'creator_pro' && user.billing_status === 'lifetime') {
    console.log('⚠️  User already has Creator Pro Lifetime access');
    process.exit(0);
  }

  // 1. Update user record
  console.log('1. Updating user plan...');
  const updateUser = db.prepare(`
    UPDATE users
    SET plan = ?,
        billing_status = ?,
        status = ?,
        updated_at = ?
    WHERE id = ?
  `);

  updateUser.run('creator_pro', 'lifetime', 'active', Date.now(), user.id);
  console.log('   ✅ User plan updated to Creator Pro Lifetime');

  // 2. Add entitlement record
  console.log('2. Adding entitlement record...');
  const addEntitlement = db.prepare(`
    INSERT INTO entitlements (user_id, label, source, granted_by, notes, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);

  addEntitlement.run(user.id, 'Pro — Lifetime', 'admin_grant', adminId, notes);
  console.log('   ✅ Entitlement record created');

  // 3. Verify
  console.log('');
  console.log('✅ Grant complete! User now has:');
  const updatedUser = db.prepare('SELECT plan, billing_status, status FROM users WHERE id = ?').get(user.id);
  console.log(`   Plan: ${updatedUser.plan}`);
  console.log(`   Status: ${updatedUser.billing_status}`);
  console.log(`   Access: ${updatedUser.status}`);
  console.log('');
  console.log('User benefits:');
  console.log('   • Unlimited title generations');
  console.log('   • Access to all AI models (OpenAI, Groq, Grok, Gemini)');
  console.log('   • No expiration date');
  console.log('   • All Creator Pro features');

} catch (error) {
  console.error('❌ Error granting lifetime access:', error.message);
  process.exit(1);
} finally {
  db.close();
}
