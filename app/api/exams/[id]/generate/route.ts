import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { questionSchema } from '@/lib/validators';

// GET: List questions for a specific exam
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Validation: In a real app, ensure student only sees questions during an active attempt
  // For now, we return them for the instructor/preview

  const questions = await prisma.question.findMany({
    where: { examId: params.id },
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

// POST: Add a single manual question
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = questionSchema.parse(body);

    const question = await prisma.question.create({
      data: {
        examId: params.id,
        ...validated,
        options: validated.options as any, // Cast JSON for Prisma
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
