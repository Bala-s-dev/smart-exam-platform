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
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId: id,
        completedAt: { not: null }, // Only show completed exams
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { score: 'desc' },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attempts' },
      { status: 500 }
    );
  }
}
