import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ serviceId: string }> }) {
  try {
    const resolvedParams = await params;
    const serviceId = parseInt(resolvedParams.serviceId);

    // Auto-expire any finished scheduled tokens before fetching
    const { purgeExpiredTokens } = require('@/lib/availability');
    purgeExpiredTokens(serviceId);

    // Get service info
    const svcStmt = db.prepare('SELECT name, location FROM services WHERE id = ?');
    const service = svcStmt.get(serviceId);

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Get current serving
    const servedStmt = db.prepare(`
      SELECT token_number, queue_position FROM tokens 
      WHERE service_id = ? AND status = 'served' 
      ORDER BY queue_position DESC LIMIT 1
    `);
    const currentlyServing = servedStmt.get(serviceId) || null;

    // Get next 5 waiting or scheduled
    const waitingStmt = db.prepare(`
      SELECT token_number, queue_position, status, appointment_time, is_emergency
      FROM tokens 
      WHERE service_id = ? AND status IN ('scheduled', 'waiting')
      ORDER BY 
        is_emergency DESC,
        CASE status WHEN 'scheduled' THEN 1 ELSE 2 END ASC,
        appointment_time ASC,
        queue_position ASC
      LIMIT 5
    `);
    const upNext = waitingStmt.all(serviceId);

    return NextResponse.json({ 
      service, 
      currentlyServing,
      upNext 
    });
  } catch (error) {
    console.error('Public display error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
