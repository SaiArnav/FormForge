import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');
  const format = searchParams.get('format') || 'csv';

  const whereClause: any = {};
  if (formId) whereClause.formId = formId;

  try {
    const responses = await db.response.findMany({
      where: whereClause,
      orderBy: { submittedAt: 'desc' },
      include: {
        form: { select: { title: true } },
        answers: {
          include: {
            question: { select: { title: true } },
          },
        },
      },
    });

    if (format === 'json') {
      return NextResponse.json({ responses });
    }

    // Build CSV Output
    // 1. Gather all unique question titles as header columns
    const questionTitlesSet = new Set<string>();
    responses.forEach((r) => {
      r.answers.forEach((a) => questionTitlesSet.add(a.question.title));
    });
    const questionTitles = Array.from(questionTitlesSet);

    const headers = ['Response ID', 'Form Title', 'Submitted At', ...questionTitles];

    const rows = responses.map((r) => {
      const answersMap: Record<string, string> = {};
      r.answers.forEach((a) => {
        answersMap[a.question.title] = a.value;
      });

      const rowValues = [
        r.id,
        `"${r.form.title.replace(/"/g, '""')}"`,
        r.submittedAt.toISOString(),
        ...questionTitles.map((qTitle) => {
          const val = answersMap[qTitle] || '';
          return `"${val.replace(/"/g, '""')}"`;
        }),
      ];

      return rowValues.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="formforge_responses_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
