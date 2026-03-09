const Database = require('better-sqlite3');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const db = new Database(path.join(dataDir, 'vqueue.db'));

try {
  // Clear existing services
  const deleteStmt = db.prepare('DELETE FROM services');
  deleteStmt.run();

  // Reset auto-increment
  db.exec("DELETE FROM sqlite_sequence WHERE name='services'");

  const insertStmt = db.prepare('INSERT INTO services (name, location) VALUES (?, ?)');

  const services = [
    // 10 Government Services
    { name: 'RTO Office - Driving License Queue', location: 'Khairatabad, Hyderabad' },
    { name: 'Passport Seva Kendra', location: 'Begumpet, Hyderabad' },
    { name: 'GHMC Office - Property Tax', location: 'Tank Bund, Hyderabad' },
    { name: 'Aadhaar Seva Kendra', location: 'Madhapur, Hyderabad' },
    { name: 'MeeSeva Center - Certificates', location: 'Ameerpet, Hyderabad' },
    { name: 'Government Hospital OPD', location: 'Osmania General Hospital, Afzal Gunj' },
    { name: 'Electricity Board (TSSPDCL) Bill Payment', location: 'Mint Compound, Hyderabad' },
    { name: 'Hyderabad Water Board (HMWSSB) Complaints', location: 'Somajiguda, Hyderabad' },
    { name: 'Sub-Registrar Office - Property Registration', location: 'Banjara Hills, Hyderabad' },
    { name: 'District Collectorate Office', location: 'Abids, Hyderabad' },

    // 5 Private/Other Services
    { name: 'Apollo Hospitals Cardiology OPD', location: 'Jubilee Hills, Hyderabad' },
    { name: 'HDFC Bank Customer Support', location: 'Hi-Tech City, Hyderabad' },
    { name: 'VFS Global - Visa Processing', location: 'Punjagutta, Hyderabad' },
    { name: 'Reliance Digital Service Center', location: 'Kukatpally, Hyderabad' },
    { name: 'TCS Onboarding Verification', location: 'Gachibowli, Hyderabad' },
  ];

  const transaction = db.transaction((svcs) => {
    for (const svc of svcs) {
      insertStmt.run(svc.name, svc.location);
    }
  });

  transaction(services);
  
  console.log('Successfully added 15 Hyderabad services (10 Govt + 5 Private).');
} catch (error) {
  console.error('Error updating services:', error.message);
} finally {
  db.close();
}
