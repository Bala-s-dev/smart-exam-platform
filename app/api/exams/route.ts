import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { examSchema } from '@/lib/validators';

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: userId, role } = session as any;

  try {
    const whereClause =
      role === 'INSTRUCTOR'
        ? { instructorId: userId } // Instructors see their own
        : { isPublished: true }; // Students see only published

    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: {
        _count: { select: { questions: true } }, // Useful for UI badges
        topics: { include: { topic: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session as any).role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = examSchema.parse(body);

    const exam = await prisma.exam.create({
      data: {
        title: validated.title,
        description: validated.description,
        durationMinutes: validated.durationMinutes,
        passingScore: validated.passingScore,
        isPublished: validated.isPublished,
        instructorId: (session as any).id,
        // Magic of Prisma: Connect existing topics via the join table
        topics: {
          create: validated.topicIds.map((id) => ({
            topic: { connect: { id } },
          })),
        },
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create exam' },
      { status: 400 }
    );
  }
}
