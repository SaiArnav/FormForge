import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const form = await db.form.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!form || form.status !== 'PUBLISHED' || !form.acceptingResponses) {
      return NextResponse.json(
        { error: 'Form is not accepting responses' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { answers, completionTimeSeconds, fileIds } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
    }

    // Server-side Validation of Required Fields
    for (const q of form.questions) {
      if (q.required) {
        const val = answers[q.id];
        if (q.type === 'GRID') {
          const rows = await db.questionOption.findMany({
            where: { questionId: q.id, kind: 'ROW' },
          });
          const gridVal = val && typeof val === 'object' ? val : {};
          const allAnswered = rows.every((row) => {
            const rowVal = Array.isArray(gridVal[row.value]) ? gridVal[row.value][0] : gridVal[row.value];
            return rowVal !== undefined && rowVal !== null && rowVal !== '';
          });
          if (!allAnswered) {
            return NextResponse.json(
              { error: `"${q.title}" requires an answer for every row` },
              { status: 400 }
            );
          }
        } else if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0)
        ) {
          return NextResponse.json(
            { error: `"${q.title}" is a required field` },
            { status: 400 }
          );
        }
      }
    }

    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    const newResponse = await db.response.create({
      data: {
        formId: id,
        metadata: JSON.stringify({
          ip,
          userAgent,
          completionTimeSeconds: completionTimeSeconds || 120,
        }),
        answers: {
          create: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          })),
        },
      },
    });

    // Link uploaded files to the response
    if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
      await db.uploadedFile.updateMany({
        where: { id: { in: fileIds } },
        data: { responseId: newResponse.id },
      });
    }

    return NextResponse.json({ success: true, responseId: newResponse.id }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting form:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
