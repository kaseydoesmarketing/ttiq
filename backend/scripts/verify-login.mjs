import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/titleiq.db');
const db = new Database(dbPath);

async function verifyLogin(email, password) {
  try {
    console.log('🔍 Checking login for:', email);
    console.log('Password to test:', password);
    console.log('');

    // Find the user
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user) {
      console.error('❌ User not found in database');
      process.exit(1);
    }

    console.log('✓ User found in database');
    console.log('User details:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Plan:', user.plan);
    console.log('  Status:', user.status);
    console.log('  Password hash:', user.password_hash.substring(0, 50) + '...');
    console.log('');

    // Test password
    console.log('Testing password match...');
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (isValid) {
      console.log('✅ PASSWORD MATCHES - Login should work!');
    } else {
      console.log('❌ PASSWORD DOES NOT MATCH - This is the problem');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Test the login
const email = 'kasey@tightslice.com';
const password = 'BigDawd9475jd#';

verifyLogin(email, password);
