import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || "")

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    // 1. Fetch User's Recent Performance
    const attempts = await prisma.examAttempt.findMany({
      where: { userId: (session as any).id, completedAt: { not: null } },
      take: 5,
      include: { exam: true },
      orderBy: { completedAt: "desc" }
    })

    if (attempts.length === 0) {
      return NextResponse.json({ 
        predictedScore: 0,
        feedback: "Take a few exams first so I can analyze your style!",
        recommendedFocus: "General Revision"
      })
    }

    const historyText = attempts.map(a => 
      `- Exam: ${a.exam.title}, Score: ${Math.round(a.score || 0)}%, Passed: ${a.isPassed}`
    ).join("\n")

    const prompt = `
      Analyze this student's recent exam performance:
      ${historyText}

      Based on this, provide a JSON response with:
      1. "predictedScore": A number (0-100) predicting their next score.
      2. "feedback": A brief 2-sentence motivational analysis.
      3. "recommendedFocus": A short string of what to study next.

      Output JSON only. No markdown.
    `

    // --- ROBUST AI CALL WITH FALLBACK ---
    let text = ""
    try {
      // PROMPT 1: Try the latest model (Fastest/Smartest)
      console.log("Attempting Gemini 2.5...")
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      const result = await model.generateContent(prompt)
      text = result.response.text()
    } catch (e) {
      // PROMPT 2: Fallback to Gemini 2.0 (More Stable)
      console.warn("Gemini 2.5 overloaded, switching to Gemini 2.0...")
      const modelFallback = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
      const resultFallback = await modelFallback.generateContent(prompt)
      text = resultFallback.response.text()
    }

    // Clean and Parse
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim()
    const prediction = JSON.parse(cleanText)

    return NextResponse.json(prediction)

  } catch (error: any) {
    console.error("AI Prediction Final Error:", error.message)
    // Fail gracefully instead of crashing
    return NextResponse.json({ 
      predictedScore: null, 
      feedback: "AI services are currently busy. Please try again in a moment.", 
      recommendedFocus: "Review your lowest scoring exam manually."
    })
  }
}