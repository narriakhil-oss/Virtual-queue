const Database = require('better-sqlite3');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const db = new Database(path.join(dataDir, 'vqueue.db'));

try {
  // Check if admin already exists
  const checkStmt = db.prepare("SELECT id FROM users WHERE email = 'narriakhil@gmail.com'");
  const exists = checkStmt.get();

    if (exists) {
    // If exists but isn't admin (unlikely but possible), upgrade them
    const updateStmt = db.prepare("UPDATE users SET role = 'admin', password = 'akhil 123@', is_verified = 1 WHERE email = 'narriakhil@gmail.com'");
    updateStmt.run();
    console.log('Admin user and password updated successfully.');
  } else {
    // Insert new admin user
    const insertStmt = db.prepare("INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)");
    insertStmt.run('System Admin', 'narriakhil@gmail.com', 'akhil 123@', 'admin', 1);
    console.log('Admin user created successfully.');
  }
} catch (error) {
  console.error('Error setting up admin account:', error.message);
} finally {
  db.close();
}