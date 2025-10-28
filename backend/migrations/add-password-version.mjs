import Database from 'better-sqlite3';

const db = new Database('./database/titleiq.db');

console.log('Adding password_version column to users table...');

try {
  const schema = db.prepare('PRAGMA table_info(users)').all();
  const hasPasswordVersion = schema.some(col => col.name === 'password_version');

  if (!hasPasswordVersion) {
    // Add password_version column (defaults to 1 for existing users)
    db.prepare('ALTER TABLE users ADD COLUMN password_version INTEGER NOT NULL DEFAULT 1').run();
    console.log('✓ Added password_version column');

    // Count affected rows
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log(`✓ Set password_version=1 for ${count.count} existing users`);
  } else {
    console.log('✓ password_version column already exists');
  }

  console.log('\n✅ Migration complete');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
