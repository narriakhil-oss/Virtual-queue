import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET all tokens in a service queue
export async function GET(req: Request, { params }: { params: Promise<{ serviceId: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vqueue_auth')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const resolvedParams = await params;
    const serviceId = parseInt(resolvedParams.serviceId);

    // Auto-expire any finished scheduled tokens before fetching
    const { purgeExpiredTokens } = require('@/lib/availability');
    purgeExpiredTokens(serviceId);

    const stmt = db.prepare(`
      SELECT t.id, t.token_number, t.queue_position, t.status, t.appointment_time, t.is_emergency, t.emergency_utr, u.name as user_name
      FROM tokens t
      JOIN users u ON t.user_id = u.id
      WHERE t.service_id = ? AND t.status IN ('pending', 'scheduled', 'waiting')
      ORDER BY 
        t.is_emergency DESC,
        CASE t.status 
          WHEN 'pending' THEN 1 
          WHEN 'scheduled' THEN 2 
          WHEN 'waiting' THEN 3 
          ELSE 4 
        END ASC,
        t.appointment_time ASC,
        t.queue_position ASC
    `);
    const queue = stmt.all(serviceId);

    const servedStmt = db.prepare(`
      SELECT token_number, queue_position FROM tokens 
      WHERE service_id = ? AND status = 'served' 
      ORDER BY queue_position DESC LIMIT 1
    `);
    const currentlyServing = servedStmt.get(serviceId) || null;

    const { calculateNextAvailableSlot } = require('@/lib/availability');
    const nextAvailableSlot = calculateNextAvailableSlot(serviceId);
    
    const svcStmt = db.prepare('SELECT * FROM services WHERE id = ?');
    const serviceDetails = svcStmt.get(serviceId);

    return NextResponse.json({ queue, currentlyServing, nextAvailableSlot, serviceDetails });
  } catch (error) {
    console.error('Admin Fetch Queue Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST to call the next token
export async function POST(req: Request, { params }: { params: Promise<{ serviceId: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vqueue_auth')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const resolvedParams = await params;
    const serviceId = parseInt(resolvedParams.serviceId);

    // Call the next person in line
    const transaction = db.transaction(() => {
      // Find the next person (scheduled first based on time, then waiting by position)
      const nextStmt = db.prepare(`
        SELECT id, token_number FROM tokens 
        WHERE service_id = ? AND status IN ('scheduled', 'waiting')
        ORDER BY 
          is_emergency DESC,
          CASE status WHEN 'scheduled' THEN 1 ELSE 2 END ASC,
          appointment_time ASC,
          queue_position ASC
        LIMIT 1
      `);
      const nextToken = nextStmt.get(serviceId) as any;

      if (!nextToken) {
        return null;
      }

      // Mark them as served
      const updateStmt = db.prepare(`UPDATE tokens SET status = 'served' WHERE id = ?`);
      updateStmt.run(nextToken.id);

      return nextToken.token_number;
    });

    const calledToken = transaction();

    if (!calledToken) {
      return NextResponse.json({ message: 'No more active tokens in the queue' });
    }

    return NextResponse.json({ message: `Called next token: ${calledToken}`, token: calledToken });
  } catch (error) {
    console.error('Admin Call Next Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
