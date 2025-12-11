import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session as any).role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const userId = (session as any).id;

  try {
    // 1. Fetch all completed attempts
    const attempts = await prisma.examAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      include: {
        exam: {
          include: { topics: { include: { topic: true } } },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    // 2. Calculate Stats
    const totalAttempts = attempts.length;
    if (totalAttempts === 0) return NextResponse.json({ empty: true });

    const totalScore = attempts.reduce(
      (acc, curr) => acc + (curr.score || 0),
      0
    );
    const averageScore = Math.round(totalScore / totalAttempts);

    // 3. Identify Weak Topics (Aggregation)
    // We count how many times a student failed an exam containing a specific topic
    const topicPerformance: Record<string, { failed: number; total: number }> =
      {};

    attempts.forEach((attempt) => {
      const isFail = !attempt.isPassed;
      attempt.exam.topics.forEach((t) => {
        const name = t.topic.name;
        if (!topicPerformance[name])
          topicPerformance[name] = { failed: 0, total: 0 };

        topicPerformance[name].total += 1;
        if (isFail) topicPerformance[name].failed += 1;
      });
    });

    // Convert to array and filter for topics with > 50% failure rate
    const weakTopics = Object.entries(topicPerformance)
      .map(([name, stats]) => ({
        name,
        failRate: (stats.failed / stats.total) * 100,
      }))
      .filter((t) => t.failRate > 0)
      .sort((a, b) => b.failRate - a.failRate); // Worst first

    return NextResponse.json({
      averageScore,
      totalAttempts,
      weakTopics,
      history: attempts.map((a) => ({
        id: a.id,
        examId: a.exam.id,
        title: a.exam.title,
        date: a.completedAt,
        score: Math.round(a.score || 0),
        isPassed: a.isPassed,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
