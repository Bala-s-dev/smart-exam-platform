import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOption: z.string().min(1).max(500),
      }),
    )
    .min(1),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id },
      include: {
        exam: { include: { questions: true } },
        answers: true,
      },
    });

    if (!attempt || attempt.userId !== (session as any).id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(attempt);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const { answers } = submitSchema.parse(body);

    const attempt = await prisma.examAttempt.findUnique({
      where: { id },
      include: { exam: { include: { questions: true } } },
    });

    // SECURITY FIX: verify attempt ownership before allowing submission
    if (!attempt || attempt.userId !== (session as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (attempt.completedAt) {
      return NextResponse.json(
        { error: 'Attempt already submitted' },
        { status: 400 },
      );
    }

    // Grading logic
    let correctCount = 0;
    const answerRecords = [];

    for (const ans of answers) {
      const question = attempt.exam.questions.find(
        (q) => q.id === ans.questionId,
      );
      // SECURITY: silently skip answers for questions not in this exam
      if (!question) continue;

      const options = question.options as any[];
      const correctOption = options.find((o: any) => o.isCorrect);
      const isCorrect = correctOption?.text === ans.selectedOption;
      if (isCorrect) correctCount++;

      answerRecords.push({
        attemptId: attempt.id,
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        isCorrect,
      });
    }

    const totalQuestions = attempt.exam.questions.length;
    const scorePercentage =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const isPassed = scorePercentage >= attempt.exam.passingScore;

    await prisma.$transaction([
      prisma.answer.createMany({ data: answerRecords }),
      prisma.examAttempt.update({
        where: { id: attempt.id },
        data: { score: scorePercentage, isPassed, completedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      score: scorePercentage,
      isPassed,
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid submission data' },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
