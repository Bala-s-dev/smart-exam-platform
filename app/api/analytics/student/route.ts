import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session as any).id;

  try {
    const attempts = await prisma.examAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      include: {
        exam: { include: { topics: { include: { topic: true } } } },
      },
      orderBy: { completedAt: 'desc' },
    });

    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce(
      (acc, curr) => acc + (curr.score || 0),
      0
    );
    const avgScore =
      totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : 0;

    // Identify Weak Topics (Topics appearing in failed exams)
    const weakTopicMap = new Map<string, number>();

    attempts
      .filter((a) => !a.isPassed)
      .forEach((attempt) => {
        attempt.exam.topics.forEach((et) => {
          const count = weakTopicMap.get(et.topic.name) || 0;
          weakTopicMap.set(et.topic.name, count + 1);
        });
      });

    // Convert map to array and sort by frequency
    const weakTopics = Array.from(weakTopicMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Top 3 weak topics

    return NextResponse.json({
      totalAttempts,
      avgScore: Number(avgScore),
      weakTopics,
      history: attempts.map((a) => ({
        examTitle: a.exam.title,
        score: a.score,
        date: a.completedAt,
        passed: a.isPassed,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
