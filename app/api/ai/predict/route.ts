import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimit } from '@/lib/rate-limit';

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || '');

export async function POST(req: Request) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await rateLimit(`ai-predict:${(session as any).id}`, {
    max: 15,
  });
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a few minutes.' },
      { status: 429 },
    );
  }

  try {
    const attempts = await prisma.examAttempt.findMany({
      where: { userId: (session as any).id, completedAt: { not: null } },
      take: 5,
      include: { exam: { select: { title: true } } }, // only select what we need
      orderBy: { completedAt: 'desc' },
    });

    if (attempts.length === 0) {
      return NextResponse.json({
        predictedScore: 0,
        feedback: 'Take a few exams first so I can analyse your performance!',
        recommendedFocus: 'General Revision',
      });
    }

    // Build history text — no user-supplied content injected here
    const historyText = attempts
      .map(
        (a) =>
          `- Exam: ${a.exam.title}, Score: ${Math.round(a.score || 0)}%, Passed: ${a.isPassed}`,
      )
      .join('\n');

    const prompt = `
Analyze this student's recent exam performance:
${historyText}

Based on this data, respond with a JSON object containing exactly these three fields:
1. "predictedScore": integer between 0 and 100
2. "feedback": string, 1-2 motivational sentences
3. "recommendedFocus": string, brief topic or action to focus on

Output raw JSON only. No markdown, no code blocks, no extra text.
    `.trim();

    let text = '';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch {
      const fallback = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await fallback.generateContent(prompt);
      text = result.response.text();
    }

    const clean = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const prediction = JSON.parse(clean);

    // Validate AI output shape before returning to client
    return NextResponse.json({
      predictedScore: Math.min(
        100,
        Math.max(0, Number(prediction.predictedScore) || 0),
      ),
      feedback: String(prediction.feedback || '').slice(0, 500),
      recommendedFocus: String(prediction.recommendedFocus || '').slice(0, 200),
    });
  } catch (error: any) {
    console.error('AI Prediction error:', error?.message);
    return NextResponse.json({
      predictedScore: null,
      feedback: 'AI services are currently busy. Please try again in a moment.',
      recommendedFocus: 'Review your lowest scoring exam manually.',
    });
  }
}
