const Database = require('better-sqlite3');
const db = new Database('./data/vqueue.db');
// Check admin phone
const admin = db.prepare("SELECT id, name, email, phone, role FROM users WHERE role = 'admin'").get();
console.log('Admin user:', admin);
// Check all users with phones
const users = db.prepare("SELECT id, name, email, phone FROM users").all();
console.log('All users:', users);
db.close();
