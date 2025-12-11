import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { questionSchema } from '@/lib/validators';

type Props = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Props) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ✅ Await params
  const { id } = await params;

  const questions = await prisma.question.findMany({
    where: { examId: id },
    select: {
      id: true,
      text: true,
      type: true,
      difficulty: true,
      options: true,
      explanation: true,
    },
  });

  return NextResponse.json(questions);
}

export async function POST(req: Request, { params }: Props) {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ✅ Await params
  const { id } = await params;

  try {
    const body = await req.json();
    const validated = questionSchema.parse(body);

    const question = await prisma.question.create({
      data: {
        examId: id,
        ...validated,
        options: validated.options as any,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
