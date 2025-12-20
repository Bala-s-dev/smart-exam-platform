import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Props = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Props) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        topics: { include: { topic: true } },
        instructor: { select: { name: true } },
        questions: {
          select: { id: true, type: true },
        },
      },
    });

    if (!exam)
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Props) {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const count = await prisma.exam.count({
      where: { id, instructorId: (session as any).id },
    });

    if (count === 0)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.exam.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete exam' },
      { status: 500 }
    );
  }
}
