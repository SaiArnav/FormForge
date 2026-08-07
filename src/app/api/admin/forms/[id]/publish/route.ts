import { NextResponse } from 'next/server';
import { getAuthSession, checkRole } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session || !checkRole(session.role, 'EDITOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { status, acceptingResponses } = await request.json();

    const form = await db.form.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(acceptingResponses !== undefined && { acceptingResponses }),
      },
    });

    return NextResponse.json({ form });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update publish state' }, { status: 500 });
  }
}
