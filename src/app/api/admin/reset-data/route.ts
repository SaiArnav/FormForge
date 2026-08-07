import { NextResponse } from 'next/server';
import { getAuthSession, checkRole } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session || !checkRole(session.role, 'OWNER')) {
    return NextResponse.json(
      { error: 'Forbidden: Only Owners can reset workspace data' },
      { status: 403 }
    );
  }

  try {
    // Delete all responses, files, questions, and forms in transaction
    await db.$transaction([
      db.uploadedFile.deleteMany(),
      db.responseAnswer.deleteMany(),
      db.response.deleteMany(),
      db.questionOption.deleteMany(),
      db.question.deleteMany(),
      db.form.deleteMany(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'All forms, questions, and responses have been successfully purged.',
    });
  } catch (error: any) {
    console.error('Error purging data:', error);
    return NextResponse.json(
      { error: 'Failed to reset workspace data' },
      { status: 500 }
    );
  }
}
