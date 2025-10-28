import Database from 'better-sqlite3';

const db = new Database('./database/titleiq.db');

console.log('Adding password reset columns to users table...');

try {
  // Check if columns already exist
  const schema = db.prepare('PRAGMA table_info(users)').all();
  const hasResetToken = schema.some(col => col.name === 'password_reset_token');
  const hasResetExpires = schema.some(col => col.name === 'password_reset_expires');

  if (!hasResetToken) {
    db.prepare('ALTER TABLE users ADD COLUMN password_reset_token TEXT').run();
    console.log('✓ Added password_reset_token column');
  } else {
    console.log('✓ password_reset_token column already exists');
  }

  if (!hasResetExpires) {
    db.prepare('ALTER TABLE users ADD COLUMN password_reset_expires INTEGER').run();
    console.log('✓ Added password_reset_expires column');
  } else {
    console.log('✓ password_reset_expires column already exists');
  }

  console.log('\n✅ Migration complete');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
