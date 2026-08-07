import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const count = await db.adminUser.count();
  return NextResponse.json({ hasUsers: count > 0 });
}
