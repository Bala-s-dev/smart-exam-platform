import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey)
    return NextResponse.json({ error: 'No API Key' }, { status: 500 });

  try {
    // Ask Google directly what models are available for this Key
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
