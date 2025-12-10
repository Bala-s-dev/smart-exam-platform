import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

// Optional: Admin only route to add new topics on the fly
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const topic = await prisma.topic.create({ data: { name } });
    return NextResponse.json(topic);
  } catch (error) {
    return NextResponse.json(
      { error: 'Topic already exists' },
      { status: 400 }
    );
  }
}
