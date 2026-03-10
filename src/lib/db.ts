import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Connect to SQLite database
const db = new Database(path.join(dataDir, 'vqueue.db'));
db.pragma('journal_mode = WAL');

// Initialize schema
const initDB = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'user',
      is_verified BOOLEAN DEFAULT 0,
      verification_token TEXT
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      token_number TEXT NOT NULL,
      queue_position INTEGER NOT NULL,
      status TEXT DEFAULT 'waiting',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    );
  `);

  // Migration for appointment_time
  try {
    db.prepare('SELECT appointment_time FROM tokens LIMIT 1').get();
  } catch (err) {
    db.exec('ALTER TABLE tokens ADD COLUMN appointment_time DATETIME');
  }

  // Migration for is_emergency
  try {
    db.prepare('SELECT is_emergency FROM tokens LIMIT 1').get();
  } catch (err) {
    db.exec('ALTER TABLE tokens ADD COLUMN is_emergency BOOLEAN DEFAULT 0');
  }

  // Migration for email verification fields
  try {
    db.prepare('SELECT is_verified FROM users LIMIT 1').get();
  } catch (err) {
    db.exec('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0;');
    db.exec('ALTER TABLE users ADD COLUMN verification_token TEXT;');
    db.exec("UPDATE users SET is_verified = 1 WHERE email = 'narriakhil@gmail.com';");
  }

  // Migration for emergency_utr
  try {
    db.prepare('SELECT emergency_utr FROM tokens LIMIT 1').get();
  } catch (err) {
    db.exec('ALTER TABLE tokens ADD COLUMN emergency_utr TEXT');
  }

  // Migration for service operational hours
  try {
    db.prepare('SELECT operating_start FROM services LIMIT 1').get();
  } catch (err) {
    db.exec(`
      ALTER TABLE services ADD COLUMN operating_start TEXT DEFAULT '09:00';
      ALTER TABLE services ADD COLUMN operating_end TEXT DEFAULT '17:00';
      ALTER TABLE services ADD COLUMN service_duration_mins INTEGER DEFAULT 15;
    `);
  }

  // Insert default services if none exist
  const stmt = db.prepare('SELECT COUNT(*) as count FROM services');
  const count = (stmt.get() as { count: number }).count;
  
  if (count === 0) {
    const insertService = db.prepare('INSERT INTO services (name, location) VALUES (?, ?)');
    insertService.run('General Consultation', 'Desk 1');
    insertService.run('Specialist Checkup', 'Desk 2');
    insertService.run('Pharmacy', 'Counter A');
  }
};

initDB();

export default db;
