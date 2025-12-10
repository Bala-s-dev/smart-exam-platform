import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const instructorId = (session as any).id;

    // 1. Get all exams created by this instructor
    const exams = await prisma.exam.findMany({
      where: { instructorId },
      include: { attempts: true },
    });

    // 2. Calculate Stats
    const totalExams = exams.length;
    let totalAttempts = 0;
    let totalScoreSum = 0;

    exams.forEach((exam) => {
      totalAttempts += exam.attempts.length;
      const examSum = exam.attempts.reduce(
        (acc, curr) => acc + (curr.score || 0),
        0
      );
      totalScoreSum += examSum;
    });

    const avgScore =
      totalAttempts > 0 ? (totalScoreSum / totalAttempts).toFixed(1) : 0;

    return NextResponse.json({
      totalExams,
      totalAttempts,
      avgScore: Number(avgScore),
      recentActivity: exams
        .slice(0, 5)
        .map((e) => ({ title: e.title, attempts: e.attempts.length })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
