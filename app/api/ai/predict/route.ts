import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || '');

export async function POST(req: Request) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. Fetch User's Recent Performance
    const attempts = await prisma.examAttempt.findMany({
      where: { userId: (session as any).id, completedAt: { not: null } },
      take: 5, // Analyze last 5 exams
      include: { exam: true },
      orderBy: { completedAt: 'desc' },
    });

    if (attempts.length === 0) {
      return NextResponse.json({
        feedback: 'Not enough data for prediction. Take a test first!',
      });
    }

    // 2. Format data for AI
    const historyText = attempts
      .map(
        (a) =>
          `- Exam: ${a.exam.title}, Score: ${a.score}%, Passed: ${a.isPassed}`
      )
      .join('\n');

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Analyze this student's recent exam performance:
      ${historyText}

      Based on this, provide a JSON response with:
      1. "predictedScore": A number (0-100) predicting their next score.
      2. "feedback": A brief 2-sentence motivational analysis.
      3. "recommendedFocus": A short string of what to study next.

      Output JSON only. No markdown.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const prediction = JSON.parse(text);

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('AI Prediction Error:', error);
    return NextResponse.json(
      { error: 'AI prediction failed' },
      { status: 500 }
    );
  }
}
