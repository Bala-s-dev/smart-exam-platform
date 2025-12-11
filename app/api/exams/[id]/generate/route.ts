import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateQuestionsAI } from '@/lib/ai';
import { aiGenerateSchema } from '@/lib/validators';

type Props = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Props) {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ✅ Await params
  const { id } = await params;

  try {
    const body = await req.json();
    const { topic, count, difficulty } = aiGenerateSchema.parse(body);

    const aiQuestions = await generateQuestionsAI(topic, count, difficulty);

    const createPromises = aiQuestions.map((q: any) =>
      prisma.question.create({
        data: {
          examId: id, // Use the awaited ID
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
