import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vqueue_auth')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = payload.id;

    // Auto-expire any finished scheduled tokens before fetching
    const { purgeAllExpiredTokens } = require('@/lib/availability');
    purgeAllExpiredTokens();

    // Get all user's active tokens with their service details
    const stmt = db.prepare(`
      SELECT t.id, t.token_number, t.queue_position, t.status, t.service_id, t.created_at, t.appointment_time, s.name as service_name
      FROM tokens t
      JOIN services s ON t.service_id = s.id
      WHERE t.user_id = ? AND t.status IN ('pending', 'scheduled', 'waiting', 'served')
      ORDER BY t.created_at DESC
    `);
    const myTokens = stmt.all(userId) as any[];

    // For each token, let's find the current served position and people ahead if relevant
    const enrichedTokens = myTokens.map(token => {
      if (token.status === 'served' || token.status === 'pending' || token.status === 'scheduled') {
         return { ...token, people_ahead: 0, estimated_wait_mins: 0, current_serving: 0 };
      }

      // Get count of people waiting ahead of this user for this service
      const aheadStmt = db.prepare(`
        SELECT COUNT(*) as count FROM tokens 
        WHERE service_id = ? AND status = 'waiting' AND queue_position < ?
      `);
      const peopleAhead = (aheadStmt.get(token.service_id, token.queue_position) as any).count;

      // Estimate wait time: say, 5 mins per person
      const waitTime = peopleAhead * 5;

      // Get currently serving position
      const servingStmt = db.prepare(`
        SELECT MAX(queue_position) as pos FROM tokens 
        WHERE service_id = ? AND status = 'served'
      `);
      const currentServing = (servingStmt.get(token.service_id) as any).pos || 0;

      return {
        ...token,
        people_ahead: peopleAhead,
        estimated_wait_mins: waitTime,
        current_serving: currentServing
      };
    });

    return NextResponse.json({ tokens: enrichedTokens });
  } catch (error) {
    console.error('Queue status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
