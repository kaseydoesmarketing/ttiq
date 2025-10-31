import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/titleiq.db');
const db = new Database(dbPath);

async function updatePassword(email, newPassword) {
  try {
    // Find the user
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✓ Found user: ${email} (${user.role})`);

    // Hash the new password with bcrypt (using salt rounds 12 to match the app)
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update the password
    const updateStmt = db.prepare(`
      UPDATE users
      SET password_hash = ?, updated_at = ?
      WHERE email = ?
    `);

    const result = updateStmt.run(passwordHash, Date.now(), email);

    if (result.changes > 0) {
      console.log(`✅ Password updated successfully for ${email}`);

      // Also increment password_version if the column exists (for session invalidation)
      try {
        const versionStmt = db.prepare(`
          UPDATE users
          SET password_version = COALESCE(password_version, 0) + 1
          WHERE email = ?
        `);
        versionStmt.run(email);
        console.log('✓ Password version incremented (all existing sessions invalidated)');
      } catch (err) {
        // Column might not exist yet, that's okay
        console.log('(Password version column not found, skipping)');
      }
    } else {
      console.error('❌ Failed to update password');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error updating password:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Main execution
const email = 'kasey@tightslice.com';
const password = 'BigDawd9475jd#';

console.log('🔐 TitleIQ Password Update');
console.log('========================');
console.log(`Email: ${email}`);
console.log(`New password: ${password.replace(/./g, '*').substring(0, 8)}...`);
console.log('');

updatePassword(email, password);
