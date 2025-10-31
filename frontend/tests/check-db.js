// Database inspection script for production server
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Adjust path for production server
  const dbPath = process.env.DB_PATH || join(__dirname, '../../../backend/database/titleiq.db');

  console.log('Connecting to database:', dbPath);
  const db = new Database(dbPath, { readonly: true });

  console.log('\n=== DATABASE SCHEMA CHECK ===\n');

  // Get users table schema
  const schemaQuery = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
  const schema = schemaQuery.get();

  if (schema) {
    console.log('Users table schema:');
    console.log(schema.sql);
    console.log('');

    // Check for onboarding columns
    const hasOnboardingStep = schema.sql.includes('onboarding_step');
    const hasOnboardingCompleted = schema.sql.includes('onboarding_completed');
    const hasNiche = schema.sql.includes('niche');
    const hasKeywords = schema.sql.includes('keywords');

    console.log('Onboarding columns:');
    console.log(`  onboarding_step: ${hasOnboardingStep ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`  onboarding_completed: ${hasOnboardingCompleted ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`  niche: ${hasNiche ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`  keywords: ${hasKeywords ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log('');
  }

  // Count users
  const countQuery = db.prepare('SELECT COUNT(*) as count FROM users');
  const { count } = countQuery.get();
  console.log(`Total users: ${count}`);

  // Check recent users
  const recentQuery = db.prepare(`
    SELECT COUNT(*) as count
    FROM users
    WHERE created_at > ?
  `);
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const { count: recentCount } = recentQuery.get(sevenDaysAgo);
  console.log(`Users created in last 7 days: ${recentCount}`);

  // Check for onboarding data
  const onboardingQuery = db.prepare(`
    SELECT email, onboarding_step, niche, keywords
    FROM users
    WHERE onboarding_step > 0 OR niche IS NOT NULL
    LIMIT 5
  `);

  const usersWithOnboarding = onboardingQuery.all();
  if (usersWithOnboarding.length > 0) {
    console.log('\nUsers with onboarding data:');
    usersWithOnboarding.forEach(user => {
      console.log(`  ${user.email}: Step ${user.onboarding_step || 0}, Niche: ${user.niche || 'N/A'}`);
    });
  } else {
    console.log('\nNo users have completed onboarding yet.');
  }

  db.close();
  console.log('\n✓ Database check complete\n');

} catch (error) {
  console.error('Database check failed:', error.message);
  process.exit(1);
}
