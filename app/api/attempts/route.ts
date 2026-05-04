import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const startAttemptSchema = z.object({
  examId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { examId } = startAttemptSchema.parse(body);

    // SECURITY FIX: verify exam exists AND is published
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    if (!exam.isPublished) {
      return NextResponse.json(
        { error: 'Exam is not available' },
        { status: 403 },
      );
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        userId: (session as any).id,
        examId,
        startedAt: new Date(),
      },
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to start exam' },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const attempts = await prisma.examAttempt.findMany({
      where: { userId: (session as any).id },
      include: {
        exam: { select: { title: true, passingScore: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
    return NextResponse.json(attempts);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
