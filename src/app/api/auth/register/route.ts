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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Insert new user
    // Note: In a production app, password should be hashed (e.g., using bcrypt)
    const insertStmt = db.prepare('INSERT INTO users (name, email, password, phone, is_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)');
    insertStmt.run(name, email, password, phone || null, 0, otp);

    // Send email using Nodemailer and Ethereal
    const nodemailer = require('nodemailer');
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const info = await transporter.sendMail({
      from: '"VQueue System" <no-reply@vqueue.com>',
      to: email,
      subject: "Verify your email address",
      text: `Your VQueue email verification code is: ${otp}`,
      html: `<p>Your VQueue email verification code is: <strong>${otp}</strong></p>`,
    });

    console.log("OTP Email sent: %s", info.messageId);
    console.log("Preview OTP Email URL: %s", nodemailer.getTestMessageUrl(info));

    return NextResponse.json({ message: 'OTP sent successfully', email }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

