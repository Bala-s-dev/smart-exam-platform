import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: userId, role } = session as any;

  try {
    const whereClause =
      role === 'INSTRUCTOR' ? { instructorId: userId } : { isPublished: true };

    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: {
        _count: { select: { questions: true } },
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
    const { title, description, customTopic, durationMinutes, passingScore } =
      body;

    // 1. Handle Topic (Find existing or Create new)
    let topicId;
    const existingTopic = await prisma.topic.findUnique({
      where: { name: customTopic },
    });

    if (existingTopic) {
      topicId = existingTopic.id;
    } else {
      const newTopic = await prisma.topic.create({
        data: { name: customTopic },
      });
      topicId = newTopic.id;
    }

    // 2. Create Exam
    const exam = await prisma.exam.create({
      data: {
        title,
        description, 
        durationMinutes,
        passingScore,
        isPublished: true,
        instructorId: (session as any).id,
        topics: {
          create: [{ topic: { connect: { id: topicId } } }],
        },
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create exam' },
      { status: 400 }
    );
  }
}
