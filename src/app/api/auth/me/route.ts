import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vqueue_auth')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Fetch latest user info
    const stmt = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?');
    const user = stmt.get(payload.id);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
