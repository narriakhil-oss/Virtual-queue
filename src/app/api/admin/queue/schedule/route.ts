import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vqueue_auth')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { tokenId, appointmentTime } = await req.json();

    if (!tokenId || !appointmentTime) {
      return NextResponse.json({ error: 'Token ID and Appointment Time are required' }, { status: 400 });
    }

    const updateStmt = db.prepare(`
      UPDATE tokens 
      SET status = 'scheduled', appointment_time = ? 
      WHERE id = ? AND status = 'pending'
    `);
    
    const result = updateStmt.run(appointmentTime, tokenId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Token not found or not in pending state' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment scheduled successfully' });
  } catch (error) {
    console.error('Schedule appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
