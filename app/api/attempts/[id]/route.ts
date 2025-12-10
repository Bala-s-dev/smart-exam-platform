import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOption: z.string(),
    })
  ),
});

// 1. GET Request (Fetch Attempt)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

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
}

// 2. PUT Request (Submit Answers)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
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

    if (!attempt)
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    if (attempt.completedAt)
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 });

    // Grading Logic
    let correctCount = 0;
    const answerRecords = [];

    for (const ans of answers) {
      const question = attempt.exam.questions.find(
        (q) => q.id === ans.questionId
      );
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
        data: {
          score: scorePercentage,
          isPassed,
          completedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      score: scorePercentage,
      isPassed,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
