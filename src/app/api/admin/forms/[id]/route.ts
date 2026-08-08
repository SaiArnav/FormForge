import { NextResponse } from 'next/server';
import { getAuthSession, checkRole } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const form = await db.form.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: {
            orderBy: { order: 'asc' },
          },
        },
      },
      _count: {
        select: { responses: true },
      },
    },
  });

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  return NextResponse.json({ form });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session || !checkRole(session.role, 'EDITOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, description, status, acceptingResponses, questions } = body;

    // Transaction to update form and replace questions & options cleanly
    const updatedForm = await db.$transaction(async (tx) => {
      // 1. Update form basic details
      const form = await tx.form.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
          ...(acceptingResponses !== undefined && { acceptingResponses }),
        },
      });

      // 2. If questions are provided, sync questions
      if (questions && Array.isArray(questions)) {
        // Delete existing questions (cascade deletes options)
        await tx.question.deleteMany({
          where: { formId: id },
        });

        // Re-create questions with options
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await tx.question.create({
            data: {
              formId: id,
              type: q.type,
              title: q.title || 'Untitled Question',
              description: q.description || null,
              required: Boolean(q.required),
              order: i,
              validation: q.validation ? JSON.stringify(q.validation) : null,
              options: {
                create: (q.options || []).map((opt: any, optIdx: number) => ({
                  value: typeof opt === 'string' ? opt : opt.value,
                  order: optIdx,
                  kind: opt && typeof opt === 'object' && opt.kind ? opt.kind : 'ROW',
                })),
              },
            },
          });
        }
      }

      return tx.form.findUnique({
        where: { id },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({ form: updatedForm });
  } catch (error: any) {
    console.error('Error updating form:', error);
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session || !checkRole(session.role, 'EDITOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await db.form.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
  }
}
