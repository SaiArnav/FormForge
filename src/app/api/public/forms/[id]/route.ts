import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const form = await db.form.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      acceptingResponses: true,
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          required: true,
          order: true,
          validation: true,
          options: {
            orderBy: { order: 'asc' },
            select: { id: true, value: true, order: true },
          },
        },
      },
    },
  });

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  if (form.status !== 'PUBLISHED') {
    return NextResponse.json(
      { error: 'This form is currently in draft mode and not accepting public responses.' },
      { status: 403 }
    );
  }

  if (!form.acceptingResponses) {
    return NextResponse.json(
      { error: 'This form is no longer accepting responses.' },
      { status: 403 }
    );
  }

  return NextResponse.json({ form });
}
