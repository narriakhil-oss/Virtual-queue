import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT id, name, location FROM services');
    const services = stmt.all();

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Fetch services error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
