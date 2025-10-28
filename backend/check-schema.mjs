import Database from 'better-sqlite3';

const db = new Database('./database/titleiq.db', { readonly: true });

console.log('Current users table schema:');
const schema = db.prepare('PRAGMA table_info(users)').all();
schema.forEach(col => {
  console.log(`  ${col.name}: ${col.type}`);
});

db.close();
