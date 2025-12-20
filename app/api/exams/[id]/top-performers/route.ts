/* app/api/exams/[id]/top-performers/route.ts */
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
    // 1. Verify exam ownership
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { instructorId: true, title: true },
    });

    if (!exam)
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    if (exam.instructorId !== (session as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch Top 5 Attempts by score descending
    const topPerformers = await prisma.examAttempt.findMany({
      where: {
        examId: id,
        completedAt: { not: null },
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { score: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      examTitle: exam.title,
      performers: topPerformers.map((p) => ({
        id: p.id,
        name: p.user.name,
        email: p.user.email,
        score: Math.round(p.score || 0),
        date: p.completedAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
