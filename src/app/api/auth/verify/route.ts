import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Missing email or OTP' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT id, name, email, role, is_verified, verification_token FROM users WHERE email = ?');
    const user = stmt.get(email) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.is_verified === 1) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    if (user.verification_token !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // OTP matches, verify the user
    const updateStmt = db.prepare('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?');
    updateStmt.run(user.id);

    // Generate JWT token since they are now fully authenticated
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({ 
      message: 'Email verified successfully', 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
    
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
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
