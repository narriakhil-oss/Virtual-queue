import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const cookieStore = await cookies();
    const token = cookieStore.get('vqueue_auth')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = payload.id;
    const { serviceId, isEmergency, utr } = await req.json();

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    if (isEmergency && (!utr || utr.trim().length !== 12)) {
      return NextResponse.json({ error: 'A valid 12-digit UTR is required for Emergency Queue' }, { status: 400 });
    }

    // 2. Check if user already has an active token for this service
    const checkStmt = db.prepare(`
      SELECT id FROM tokens 
      WHERE user_id = ? AND service_id = ? AND (status = 'waiting' OR status = 'pending' OR status = 'scheduled')
    `);
    const activeToken = checkStmt.get(userId, serviceId);

    if (activeToken) {
      return NextResponse.json({ error: 'You are already in this queue', token: activeToken }, { status: 400 });
    }

    // 3. Generate token logic
    // Begin transaction for safety
    const joinQueue = db.transaction(() => {
      // Get the last queue position
      const posStmt = db.prepare(`SELECT MAX(queue_position) as maxPos FROM tokens WHERE service_id = ?`);
      const posResult = posStmt.get(serviceId) as { maxPos: number | null };
      const nextPosition = (posResult.maxPos || 0) + 1;

      // Generate a token number (e.g., A-1, B-5)
      const prefix = String.fromCharCode(64 + serviceId); // 1->A, 2->B
      const tokenNumber = `${prefix}-${nextPosition}`;

      const insertStmt = db.prepare(`
        INSERT INTO tokens (user_id, service_id, token_number, queue_position, status, is_emergency, emergency_utr)
        VALUES (?, ?, ?, ?, 'pending', ?, ?)
      `);
      const result = insertStmt.run(userId, serviceId, tokenNumber, nextPosition, isEmergency ? 1 : 0, isEmergency ? utr : null);

      return {
        id: result.lastInsertRowid,
        token_number: tokenNumber,
        queue_position: nextPosition
      };
    });

    const tokenData = joinQueue();

    return NextResponse.json({ 
      message: 'Joined queue successfully', 
      token: tokenData 
    });

  } catch (error) {
    console.error('Join queue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
