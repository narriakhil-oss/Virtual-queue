import db from './db';

/**
 * Calculates the next available appointment slot for a given service.
 * It checks today's schedule. If today is booked or business hours are over,
 * it rolls to the next available day.
 */
export function calculateNextAvailableSlot(serviceId: number): string | null {
  // 1. Get service schedule constraints
  const svcStmt = db.prepare('SELECT operating_start, operating_end, service_duration_mins FROM services WHERE id = ?');
  const service = svcStmt.get(serviceId) as { operating_start: string, operating_end: string, service_duration_mins: number };
  
  if (!service) return null;

  const now = new Date();
  
  // Format current time in IST to work with local hours
  const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  const currentHour = nowIST.getHours();
  const currentMin = nowIST.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

  // Parse operating hours (assuming 'HH:MM' 24h format)
  const [startHour, startMin] = service.operating_start.split(':').map(Number);
  const [endHour, endMin] = service.operating_end.split(':').map(Number);

  // 2. Fetch the latest scheduled appointment from the database that is today or later
  const latestStmt = db.prepare(`
    SELECT appointment_time 
    FROM tokens 
    WHERE service_id = ? AND status = 'scheduled'
    ORDER BY appointment_time DESC 
    LIMIT 1
  `);
  
  const latestToken = latestStmt.get(serviceId) as { appointment_time: string } | undefined;

  let proposedTime: Date;

  if (latestToken && latestToken.appointment_time) {
    // If there is an existing appointment, the next slot is right after it
    proposedTime = new Date(latestToken.appointment_time.endsWith('Z') ? latestToken.appointment_time : latestToken.appointment_time + 'Z');
    proposedTime.setMinutes(proposedTime.getMinutes() + service.service_duration_mins);
  } else {
    // If no appointments exist, the slot is right now
    proposedTime = new Date(nowIST); 
  }

  // Ensure proposed time is at least "now" (can't book in the past)
  if (proposedTime < nowIST) {
    proposedTime = new Date(nowIST);
  }
  
  // Round up to nearest 5 minutes for clean scheduling
  const remainder = proposedTime.getMinutes() % 5;
  if (remainder !== 0) {
      proposedTime.setMinutes(proposedTime.getMinutes() + (5 - remainder));
      proposedTime.setSeconds(0);
      proposedTime.setMilliseconds(0);
  }

  // 3. Check against operating hours constraints
  let proposedHour = proposedTime.getHours();
  let proposedMin = proposedTime.getMinutes();
  
  // If we are proposing a time before opening, bump to opening time
  if (proposedHour < startHour || (proposedHour === startHour && proposedMin < startMin)) {
    proposedTime.setHours(startHour, startMin, 0, 0);
  }
  
  // If we are proposing a time after closing, bump to tomorrow's opening time
  if (proposedHour > endHour || (proposedHour === endHour && proposedMin >= endMin)) {
    proposedTime.setDate(proposedTime.getDate() + 1);
    proposedTime.setHours(startHour, startMin, 0, 0);
  }

  // Convert back to UTC ISO string for SQLite/Standardization
  return proposedTime.toISOString();
}

/**
 * Sweeps the queue for a given service and automatically marks any 'scheduled' tokens
 * as 'served' if their appointment time + service duration has already passed right now.
 */
export function purgeExpiredTokens(serviceId: number): void {
  const svcStmt = db.prepare('SELECT service_duration_mins FROM services WHERE id = ?');
  const service = svcStmt.get(serviceId) as { service_duration_mins: number };
  if (!service) return;

  const now = new Date();

  // Find all currently scheduled appointments
  const scheduledStmt = db.prepare(`SELECT id, appointment_time FROM tokens WHERE service_id = ? AND status = 'scheduled'`);
  const scheduledTokens = scheduledStmt.all(serviceId) as { id: number, appointment_time: string }[];

  const updateStmt = db.prepare(`UPDATE tokens SET status = 'served' WHERE id = ?`);

  const transaction = db.transaction(() => {
    for (const token of scheduledTokens) {
      if (!token.appointment_time) continue;
      
      const apptTime = new Date(token.appointment_time.endsWith('Z') ? token.appointment_time : token.appointment_time + 'Z');
      
      // Add the duration to the start time to get the Expiration time
      apptTime.setMinutes(apptTime.getMinutes() + service.service_duration_mins);

      // If the expiration time is cleanly in the past compared to right now, mark it served
      if (apptTime < now) {
        updateStmt.run(token.id);
      }
    }
  });

  transaction();
}

/**
 * Sweeps all services to auto-expire appointments that have passed their window.
 */
export function purgeAllExpiredTokens(): void {
  const servicesStmt = db.prepare('SELECT id FROM services');
  const services = servicesStmt.all() as { id: number }[];
  
  for (const service of services) {
    purgeExpiredTokens(service.id);
  }
}
