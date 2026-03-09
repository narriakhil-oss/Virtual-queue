const Database = require('better-sqlite3');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const db = new Database(path.join(dataDir, 'vqueue.db'));

try {
  const insertUserStmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id');
  const insertTokenStmt = db.prepare('INSERT INTO tokens (user_id, service_id, token_number, queue_position, status) VALUES (?, ?, ?, ?, ?)');

  // Get active services
  const getServicesStmt = db.prepare('SELECT id FROM services LIMIT 3');
  const targetServices = getServicesStmt.all();

  if (targetServices.length === 0) {
    throw new Error("No services found to attach bots to.");
  }

  db.transaction(() => {
    // Generate 15 dummy users
    const userIds = [];
    for (let i = 1; i <= 15; i++) {
      const res = insertUserStmt.get(`Mock User ${i}`, `mock${i}@example.com`, 'password123', 'user');
      userIds.push(res.id);
    }

    // Attach them randomly to the top 3 services
    userIds.forEach((userId, index) => {
      // Pick one of the first 3 services
      const svc = targetServices[index % targetServices.length];
      
      // Get next position logic
      const posStmt = db.prepare(`SELECT MAX(queue_position) as maxPos FROM tokens WHERE service_id = ?`);
      const posResult = posStmt.get(svc.id);
      const nextPosition = (posResult.maxPos || 0) + 1;

      // Prefix A, B, C for first three services
      const prefix = String.fromCharCode(64 + svc.id); 
      const tokenNumber = `${prefix}-${nextPosition}`;

      insertTokenStmt.run(userId, svc.id, tokenNumber, nextPosition, 'waiting');
    });
  })();

  console.log('Successfully inserted 15 bot users and generated active tokens in the first 3 services.');
} catch (error) {
  console.error('Error adding mock bots:', error.message);
} finally {
  db.close();
}
