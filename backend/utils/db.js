import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/titleiq.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      api_key TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      video_url TEXT,
      transcript TEXT,
      titles TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
    CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);
  `);
}

// User operations
export const userDb = {
  create: (id, email, password) => {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, api_key, created_at, updated_at)
      VALUES (?, ?, ?, NULL, ?, ?)
    `);
    return stmt.run(id, email, password, now, now);
  },

  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  updateApiKey: (userId, encryptedApiKey) => {
    const stmt = db.prepare(`
      UPDATE users
      SET api_key = ?, updated_at = ?
      WHERE id = ?
    `);
    return stmt.run(encryptedApiKey, Date.now(), userId);
  },

  deleteApiKey: (userId) => {
    const stmt = db.prepare(`
      UPDATE users
      SET api_key = NULL, updated_at = ?
      WHERE id = ?
    `);
    return stmt.run(Date.now(), userId);
  }
};

// Generation operations (for future history feature)
export const generationDb = {
  create: (id, userId, videoUrl, transcript, titles, description) => {
    const stmt = db.prepare(`
      INSERT INTO generations (id, user_id, video_url, transcript, titles, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      id,
      userId || null,
      videoUrl || null,
      transcript,
      JSON.stringify(titles),
      description,
      Date.now()
    );
  },

  findByUserId: (userId, limit = 10) => {
    const stmt = db.prepare(`
      SELECT * FROM generations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit);
  }
};

// Initialize database on import
initializeDatabase();

export default db;
