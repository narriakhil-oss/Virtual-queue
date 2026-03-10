import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vqueue_auth')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Total Daily Tokens
    // Only fetch tokens generated today (localtime)
    const dailyTotalStmt = db.prepare(`
      SELECT COUNT(id) as total 
      FROM tokens 
      WHERE date(created_at, 'localtime') = date('now', 'localtime')
    `);
    const dailyTotal = (dailyTotalStmt.get() as { total: number })?.total || 0;

    // 2. Daily Tokens Grouped by Service
    const dailyServiceStmt = db.prepare(`
      SELECT s.name as service_name, COUNT(t.id) as count
      FROM tokens t
      JOIN services s ON t.service_id = s.id
      WHERE date(t.created_at, 'localtime') = date('now', 'localtime')
      GROUP BY s.id
      ORDER BY count DESC
    `);
    const dailyBreakdown = dailyServiceStmt.all();

    // 3. Total Weekly Tokens (Last 7 days)
    const weeklyTotalStmt = db.prepare(`
      SELECT COUNT(id) as total 
      FROM tokens 
      WHERE date(created_at, 'localtime') >= date('now', '-7 days', 'localtime')
    `);
    const weeklyTotal = (weeklyTotalStmt.get() as { total: number })?.total || 0;

    // 4. Weekly Tokens Grouped by Service
    const weeklyServiceStmt = db.prepare(`
      SELECT s.name as service_name, COUNT(t.id) as count
      FROM tokens t
      JOIN services s ON t.service_id = s.id
      WHERE date(t.created_at, 'localtime') >= date('now', '-7 days', 'localtime')
      GROUP BY s.id
      ORDER BY count DESC
    `);
    const weeklyBreakdown = weeklyServiceStmt.all();

    return NextResponse.json({
      daily: {
        total: dailyTotal,
        breakdown: dailyBreakdown
      },
      weekly: {
        total: weeklyTotal,
        breakdown: weeklyBreakdown
      }
    });

  } catch (error) {
    console.error('Reports API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
