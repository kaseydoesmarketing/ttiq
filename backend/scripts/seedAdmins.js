import db from '../utils/db.js';
import bcrypt from 'bcrypt';

const admins = [
  'kasey@tightslice.com',
  'themenup365@gmail.com',
  'shemka.womenofexcellence@gmail.com',
];

console.log('[SEED] Starting admin account seeding...');

for (const email of admins) {
  try {
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!existing) {
      const hash = bcrypt.hashSync('changeme_admin_password', 10);
      const userId = 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(7);
      
      db.prepare(`
        INSERT INTO users (
          id, email, password_hash, role, plan, status, billing_status,
          trial_expires, model_provider, created_at
        )
        VALUES (?, ?, ?, 'admin', 'creator_pro', 'active', 'lifetime', NULL, 'openai', ?)
      `).run(userId, email, hash, Date.now());
      
      console.log(`[SEED] ✓ Created admin account: ${email}`);
    } else {
      db.prepare(`
        UPDATE users
        SET role = 'admin',
            plan = 'creator_pro',
            status = 'active',
            billing_status = 'lifetime'
        WHERE email = ?
      `).run(email);
      
      console.log(`[SEED] ✓ Updated existing account to admin: ${email}`);
    }
  } catch (error) {
    console.error(`[SEED] ✗ Failed to seed ${email}:`, error.message);
  }
}

console.log('[SEED] Admin seeding complete. All admin accounts have unlimited access.');
console.log('[SEED] Default password: changeme_admin_password (change after first login)');

process.exit(0);
