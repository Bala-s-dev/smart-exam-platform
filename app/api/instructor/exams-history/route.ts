/* app/api/instructor/exams-history/route.ts */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const instructorId = (session as any).id;

  try {
    const exams = await prisma.exam.findMany({
      where: { instructorId },
      include: {
        attempts: {
          where: { completedAt: { not: null } },
          select: { score: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const history = exams.map((exam) => {
      const totalAttempts = exam.attempts.length;
      const avgScore =
        totalAttempts > 0
          ? Math.round(
              exam.attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) /
                totalAttempts
            )
          : 0;

      return {
        id: exam.id,
        title: exam.title,
        createdAt: exam.createdAt,
        totalStudents: totalAttempts,
        averageScore: avgScore,
      };
    });

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
