import { NextResponse } from 'next/server';
import { getAuthSession, checkRole } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (formId) {
    whereClause.formId = formId;
  }

  try {
    const totalCount = await db.response.count({ where: whereClause });

    const responses = await db.response.findMany({
      where: whereClause,
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit,
      include: {
        form: {
          select: { title: true },
        },
        answers: {
          include: {
            question: {
              select: { title: true, type: true },
            },
          },
        },
        files: true,
      },
    });

    // Client-side / In-memory search filtering if search term provided
    let filteredResponses = responses;
    if (search && search.trim() !== '') {
      const term = search.toLowerCase();
      filteredResponses = responses.filter((res) => {
        const formTitle = res.form.title.toLowerCase();
        const answersText = res.answers
          .map((a) => a.value.toLowerCase())
          .join(' ');
        return formTitle.includes(term) || answersText.includes(term);
      });
    }

    const formattedResponses = filteredResponses.map((r) => {
      let metaObj = {};
      try {
        if (r.metadata) metaObj = JSON.parse(r.metadata);
      } catch {}

      return {
        id: r.id,
        formId: r.formId,
        formTitle: r.form.title,
        submittedAt: r.submittedAt.toISOString(),
        metadata: metaObj,
        answers: r.answers.map((a) => ({
          id: a.id,
          questionId: a.questionId,
          questionTitle: a.question.title,
          questionType: a.question.type,
          value: a.value,
        })),
        files: r.files,
      };
    });

    return NextResponse.json({
      responses: formattedResponses,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAuthSession();
  if (!session || !checkRole(session.role, 'EDITOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Response ID required' }, { status: 400 });
  }

  try {
    await db.response.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete response' }, { status: 500 });
  }
}
