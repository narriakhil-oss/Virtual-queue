const Database = require('better-sqlite3');
const db = new Database('./data/vqueue.db');

const stmt = db.prepare(`
  UPDATE users 
  SET password = 'akhil 123@' 
  WHERE email = 'narriakhil@gmail.com'
`);

stmt.run();

console.log("Password updated successfully ✅");

db.close();