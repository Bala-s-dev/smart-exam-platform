import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { questionSchema } from '@/lib/validators';

type Props = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Props) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    // Students can only see questions for published exams
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { isPublished: true, instructorId: true },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const isInstructor = (session as any).role === 'INSTRUCTOR';
    const isOwner = exam.instructorId === (session as any).id;

    if (!isInstructor && !exam.isPublished) {
      return NextResponse.json(
        { error: 'Exam not available' },
        { status: 403 },
      );
    }
    if (isInstructor && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const questions = await prisma.question.findMany({
      where: { examId: id },
      select: {
        id: true,
        text: true,
        type: true,
        difficulty: true,
        options: true,
        // SECURITY: only return explanation to the exam owner
        explanation: isOwner,
      },
    });

    return NextResponse.json(questions);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Props) {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    // SECURITY FIX: verify exam belongs to this instructor
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
    const validated = questionSchema.parse(body);

    const question = await prisma.question.create({
      data: {
        examId: id,
        ...validated,
        options: validated.options as any,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 400 },
    );
  }
}
