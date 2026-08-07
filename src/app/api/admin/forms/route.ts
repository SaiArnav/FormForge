import { NextResponse } from 'next/server';
import { getAuthSession, checkRole } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const forms = await db.form.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      admin: {
        select: { name: true, email: true },
      },
      _count: {
        select: {
          responses: true,
          questions: true,
        },
      },
    },
  });

  return NextResponse.json({ forms });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session || !checkRole(session.role, 'EDITOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newForm = await db.form.create({
      data: {
        title,
        description: description || '',
        status: 'DRAFT',
        createdBy: session.userId,
        questions: {
          create: [
            {
              type: 'SHORT_ANSWER',
              title: 'Untitled Question',
              required: false,
              order: 0,
            },
          ],
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json({ form: newForm }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating form:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
