import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { isValidPhone } from '@/lib/sms';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vqueue_auth')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { phone } = await req.json();

    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit Indian mobile number' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE users SET phone = ? WHERE id = ?');
    stmt.run(phone, payload.id);

    return NextResponse.json({ message: 'Phone number saved successfully' });
  } catch (error) {
    console.error('Update phone error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
