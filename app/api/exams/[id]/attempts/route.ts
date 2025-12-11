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
    // 1. Fetch Exam Topics first
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { topics: { include: { topic: true } } },
    });

    if (!exam)
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    // 2. Fetch Attempts
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId: id,
        completedAt: { not: null },
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { score: 'asc' }, // Show lowest scores first for better visibility
    });

    // 3. Return combined data
    return NextResponse.json({
      attempts,
      examTopics: exam.topics.map((t) => t.topic.name), // e.g. ["React", "State"]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attempts' },
      { status: 500 }
    );
  }
}
