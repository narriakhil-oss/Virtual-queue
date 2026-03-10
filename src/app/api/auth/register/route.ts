import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user already exists
    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existingUser = checkStmt.get(email);
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Insert new user
    // We set is_verified to 1 to bypass the login check
    const insertStmt = db.prepare('INSERT INTO users (name, email, password, phone, is_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)');
    const result = insertStmt.run(name, email, password, phone || null, 1, null);

    const userId = result.lastInsertRowid;
    
    // Generate JWT token
    const token = signToken({ id: userId, email, role: 'user' });

    const response = NextResponse.json({ message: 'User registered successfully', user: { id: userId, name, email, role: 'user' } });
    
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
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

