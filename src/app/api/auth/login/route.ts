import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Check user credentials
    // Note: In a production app, you should compare the hashed password
    const stmt = db.prepare('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?');
    const user = stmt.get(email, password) as any;

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({ message: 'Login successful', user });
    
    // Set HTTP-only cookie
    response.cookies.set('vqueue_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
