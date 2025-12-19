import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Props = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Props) {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  try {
    // 1. Fetch Exam with Topics and all Attempts
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        topics: { include: { topic: true } },
        attempts: {
          where: { completedAt: { not: null } },
          select: { score: true, isPassed: true },
        },
      },
    });

    if (!exam)
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    if (exam.instructorId !== (session as any).id) {
      return NextResponse.json(
        { error: 'You do not have permission to view this exam’s stats' },
        { status: 403 }
      );
    }

    const totalAttempts = exam.attempts.length;

    // 2. Calculate Average Percentage
    let averageScore = 0;
    let passRate = 0;

    if (totalAttempts > 0) {
      const totalScore = exam.attempts.reduce(
        (acc, curr) => acc + (curr.score || 0),
        0
      );
      averageScore = totalScore / totalAttempts;

      const passedCount = exam.attempts.filter((a) => a.isPassed).length;
      passRate = (passedCount / totalAttempts) * 100;
    }

    // 3. Identify Weak Areas
    // Logic: If class average is below 65%, the Exam's topics are flagged as "Weak"
    const weakTopics: string[] = [];
    if (averageScore < 65 && totalAttempts > 0) {
      exam.topics.forEach((t) => weakTopics.push(t.topic.name));
    }

    return NextResponse.json({
      totalAttempts,
      averageScore: Math.round(averageScore),
      passRate: Math.round(passRate),
      topics: exam.topics.map((t) => t.topic.name),
      weakTopics, // Returns topics if the class is struggling
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
