import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateQuestionsAI } from '@/lib/ai';

type Props = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Props) {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { topic, syllabus, count, difficulty } = body;

    // 1. Generate using our lib function (Update logic below if needed)
    // We pass the syllabus context into the 'topic' string for the AI function
    // OR we update the AI function signature.
    // For simplicity, let's append syllabus to the topic prompt passed to AI.

    const contextPrompt = `Topic: ${topic}. Syllabus Context: ${
      syllabus || 'General knowledge'
    }`;

    const aiQuestions = await generateQuestionsAI(
      contextPrompt,
      count,
      difficulty
    );

    // 2. Save to DB
    const createPromises = aiQuestions.map((q: any) =>
      prisma.question.create({
        data: {
          examId: id,
          text: q.text,
          type: q.type,
          difficulty: q.difficulty,
          explanation: q.explanation,
          options: q.options,
        },
      })
    );

    await Promise.all(createPromises);

    return NextResponse.json({ success: true, count: aiQuestions.length });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || 'AI Generation Failed' },
      { status: 500 }
    );
  }
}
