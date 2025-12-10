import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || '');

export async function generateQuestionsAI(
  topic: string,
  count: number,
  difficulty: string
) {
  try {
    // Use 'gemini-1.5-flash' for speed and efficiency
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are a strict teacher. Generate ${count} ${difficulty} level multiple-choice questions about "${topic}".
      
      Output strictly in this JSON format:
      [
        {
          "text": "Question text here",
          "type": "MCQ",
          "difficulty": "${difficulty}",
          "explanation": "Brief explanation of why the answer is correct",
          "options": [
            { "text": "Option A", "isCorrect": false },
            { "text": "Option B", "isCorrect": true },
            { "text": "Option C", "isCorrect": false },
            { "text": "Option D", "isCorrect": false }
          ]
        }
      ]
      Do not add any markdown formatting, no \`\`\`json blocks, and no introductory text. Just the raw JSON array.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // CLEANUP: Remove markdown code blocks if Gemini adds them
    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Validate JSON parsing
    const questions = JSON.parse(text);
    return questions;
  } catch (error) {
    console.error('Gemini AI Generation Error:', error);
    throw new Error('Failed to generate questions via Gemini AI');
  }
}
