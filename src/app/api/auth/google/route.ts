import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, name, googleId } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing Google profile data' }, { status: 400 });
    }

    // 1. Check if user already exists
    const checkStmt = db.prepare('SELECT id, role FROM users WHERE email = ?');
    let user = checkStmt.get(email) as any;
    
    let userId;
    let role;

    // 2. Auto-register them if they don't exist
    if (!user) {
      // We generate a random password for OAuth users since they don't log in via password
      const randomPassword = Math.random().toString(36).slice(-8) + '!!GoogAuth';
      
      const insertStmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
      const result = insertStmt.run(name, email, randomPassword);
      
      userId = result.lastInsertRowid;
      role = 'user'; // Default to standard user
    } else {
      userId = user.id;
      role = user.role;
    }

    // 3. Generate our internal JWT token seamlessly
    const token = signToken({ id: userId, email, role });

    const response = NextResponse.json({ 
      message: 'Google login successful', 
      user: { id: userId, name, email, role } 
    });
    
    // 4. Set HTTP-only cookie to respect existing auth architecture
    response.cookies.set('vqueue_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
