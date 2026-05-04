import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateQuestionsAI } from '@/lib/ai';
import { rateLimit } from '@/lib/rate-limit';

type Props = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Props) {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limit AI generation: 20 calls per 15 min per instructor
  const { success } = await rateLimit(`ai-generate:${(session as any).id}`, {
    max: 20,
  });
  if (!success) {
    return NextResponse.json(
      { error: 'Too many generation requests. Please wait a few minutes.' },
      { status: 429 },
    );
  }

  const { id } = await params;

  try {
    // SECURITY FIX: verify the exam belongs to this instructor
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { instructorId: true },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    if (exam.instructorId !== (session as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { topic, syllabus, count, difficulty } = body;

    // SECURITY FIX: sanitise and cap user input before injecting into AI prompt
    const safeTopic = String(topic ?? '')
      .slice(0, 200)
      .replace(/[`'"\\]/g, '');
    const safeSyllabus = String(syllabus ?? 'General knowledge')
      .slice(0, 1000)
      .replace(/[`'"\\]/g, '');
    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 20);
    const safeDifficulty = ['EASY', 'MEDIUM', 'HARD'].includes(difficulty)
      ? difficulty
      : 'MEDIUM';

    const contextPrompt = `Topic: ${safeTopic}. Syllabus Context: ${safeSyllabus}`;

    const aiQuestions = await generateQuestionsAI(
      contextPrompt,
      safeCount,
      safeDifficulty,
    );

    const createPromises = aiQuestions.map((q: any) =>
      prisma.question.create({
        data: {
          examId: id,
          text: String(q.text ?? '').slice(0, 2000),
          type: ['MCQ', 'TRUE_FALSE'].includes(q.type) ? q.type : 'MCQ',
          difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(q.difficulty)
            ? q.difficulty
            : 'MEDIUM',
          explanation: q.explanation
            ? String(q.explanation).slice(0, 1000)
            : null,
          options: q.options,
        },
      }),
    );

    await Promise.all(createPromises);

    return NextResponse.json({ success: true, count: aiQuestions.length });
  } catch (error: any) {
    console.error('AI Generation error:', error?.message);
    return NextResponse.json(
      { error: 'AI generation failed' },
      { status: 500 },
    );
  }
}
