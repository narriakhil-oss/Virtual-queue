const Database = require('better-sqlite3');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const db = new Database(path.join(dataDir, 'vqueue.db'));

const numUsers = 15;
const numTokens = 25;

try {
  console.log('Generating test bots and queue tokens...');

  // 1. Ensure Services Exist
  const servicesStmt = db.prepare('SELECT id, name FROM services');
  let services = servicesStmt.all();

  if (services.length === 0) {
    console.log('No services found. Creating default services...');
    const insertService = db.prepare('INSERT INTO services (name, location) VALUES (?, ?)');
    insertService.run('General Consultation', 'Desk 1');
    insertService.run('Specialist Checkup', 'Desk 2');
    insertService.run('Pharmacy', 'Counter A');
    services = servicesStmt.all();
  }

  // 2. Generate Dummy Users
  const userIds = [];
  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)'
  );

  for (let i = 1; i <= numUsers; i++) {
    const email = `testbot${i}@example.com`;
    // Check if user already exists
    const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    if (checkUser) {
      userIds.push(checkUser.id);
    } else {
      const result = insertUser.run(`Test Bot ${i}`, email, 'password123', 'user', 1);
      userIds.push(result.lastInsertRowid);
    }
  }
  console.log(`Ensured ${userIds.length} test users exist.`);

  // 3. Generate Dummy Tokens
  const insertToken = db.prepare(`
    INSERT INTO tokens (user_id, service_id, token_number, queue_position, status, is_emergency, emergency_utr)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let addedTokens = 0;
  let addedEmergencies = 0;

  for (let i = 0; i < numTokens; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    
    // Check if user already has an active token in this exact service
    const activeTokenCheck = db.prepare(
      `SELECT id FROM tokens WHERE user_id = ? AND service_id = ? AND status IN ('pending', 'scheduled', 'waiting')`
    ).get(userId, service.id);

    if (!activeTokenCheck) {
      // Get next queue position for this service
      const posResult = db.prepare(`SELECT MAX(queue_position) as maxPos FROM tokens WHERE service_id = ?`).get(service.id);
      const nextPosition = (posResult.maxPos || 0) + 1;

      const prefix = String.fromCharCode(64 + service.id); // 1->A, 2->B
      const tokenNumber = `${prefix}-${nextPosition}`;

      // ~20% chance to be an emergency
      const isEmergency = Math.random() < 0.2 ? 1 : 0;
      const utr = isEmergency ? `TEST${Math.floor(10000000 + Math.random() * 90000000)}` : null;

      // Random wait status (waiting vs pending)
      const status = Math.random() < 0.5 ? 'waiting' : 'pending';

      insertToken.run(userId, service.id, tokenNumber, nextPosition, status, isEmergency, utr);
      
      addedTokens++;
      if (isEmergency) addedEmergencies++;
    }
  }

  console.log(`Successfully generated ${addedTokens} new queue tokens.`);
  console.log(`Included ${addedEmergencies} emergency priority tokens.`);
  console.log('Done! You can now check your Admin Dashboard or Public Displays.');

} catch (err) {
  console.error('Error generating bots:', err);
} finally {
  db.close();
}
