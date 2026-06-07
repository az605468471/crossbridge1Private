const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'crossbridge.db');
const db = new Database(DB_PATH);

// WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE NOT NULL,
    from_chain TEXT NOT NULL,
    to_chain TEXT NOT NULL,
    from_token TEXT NOT NULL,
    amount REAL NOT NULL,
    wallet_address TEXT,
    status TEXT DEFAULT 'pending',
    fee REAL,
    tx_hash TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id TEXT UNIQUE NOT NULL,
    symbol TEXT NOT NULL,
    condition TEXT NOT NULL,
    target_price REAL NOT NULL,
    triggered INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

console.log('Database initialized:', DB_PATH);

module.exports = db;
