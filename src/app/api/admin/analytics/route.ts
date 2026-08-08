import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') === '30D' ? '30D' : '7D';

  try {
    const totalForms = await db.form.count();
    const totalResponses = await db.response.count();

    const responses = await db.response.findMany({
      orderBy: { submittedAt: 'desc' },
      take: 100,
      include: {
        form: { select: { title: true } },
        answers: {
          take: 3,
          include: { question: { select: { title: true } } },
        },
      },
    });

    // Calculate average completion time
    let totalSeconds = 0;
    let validSecCount = 0;

    responses.forEach((r) => {
      if (r.metadata) {
        try {
          const parsed = JSON.parse(r.metadata);
          if (parsed.completionTimeSeconds) {
            totalSeconds += parsed.completionTimeSeconds;
            validSecCount++;
          }
        } catch {}
      }
    });

    const avgCompletionTime = validSecCount > 0 ? Math.round(totalSeconds / validSecCount) : 0;
    const completionRate = totalResponses > 0 ? 100 : 0;

    // Generate recent activity table items
    const recentActivity = responses.slice(0, 10).map((r) => {
      let durationSec = 0;
      try {
        if (r.metadata) durationSec = JSON.parse(r.metadata).completionTimeSeconds || 0;
      } catch {}

      // Find respondent name if present
      const nameAnswer =
        r.answers.find((a) => a.question.title.toLowerCase().includes('name'))?.value ||
        'Anonymous Respondent';
      const initials =
        nameAnswer
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'AR';

      return {
        id: r.id,
        formId: r.formId,
        formTitle: r.form.title,
        submittedAt: r.submittedAt.toISOString(),
        completionTimeSeconds: durationSec,
        status: 'COMPLETED' as const,
        respondentName: nameAnswer,
        respondentInitials: initials,
      };
    });

    // Generate submission trends for selected range
    const days = range === '30D' ? 30 : 7;
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysMap: Record<string, number> = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label =
        range === '30D'
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : daysOfWeek[d.getDay()];
      daysMap[label] = 0;
    }

    const { submissionTrends, allResponses } = (() => {
      if (range === '30D') {
        const since = new Date();
        since.setDate(since.getDate() - 29);
        since.setHours(0, 0, 0, 0);
        const all = responses;
        const last30 = responses.filter((r) => r.submittedAt >= since);
        const map: Record<string, number> = {};
        last30.forEach((r) => {
          const label = r.submittedAt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          map[label] = (map[label] || 0) + 1;
        });
        const trends = Object.keys(daysMap).map((label) => ({
          date: label,
          count: map[label] || 0,
        }));
        return { submissionTrends: trends, allResponses: all };
      }

      const map: Record<string, number> = {};
      responses.forEach((r) => {
        const dayLabel = daysOfWeek[r.submittedAt.getDay()];
        if (daysMap[dayLabel] !== undefined) {
          map[dayLabel] = (map[dayLabel] || 0) + 1;
        }
      });
      const trends = Object.keys(daysMap).map((label) => ({
        date: label,
        count: map[label] || 0,
      }));
      return { submissionTrends: trends, allResponses: responses };
    })();

    // Group responses by role/option if available, else standard category map
    const responsesByRoleOrCategory: Array<{ category: string; count: number }> = [];
    const roleCounts: Record<string, number> = {};

    allResponses.forEach((r) => {
      r.answers.forEach((a) => {
        if (
          a.question.title.toLowerCase().includes('role') ||
          a.question.title.toLowerCase().includes('category')
        ) {
          roleCounts[a.value] = (roleCounts[a.value] || 0) + 1;
        }
      });
    });

    Object.entries(roleCounts).forEach(([category, count]) => {
      responsesByRoleOrCategory.push({ category, count });
    });

    return NextResponse.json({
      totalForms,
      totalResponses,
      avgCompletionTime,
      completionRate,
      recentActivity,
      submissionTrends,
      responsesByRoleOrCategory,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
