import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Mesazhi është i zbrazët' },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Je nje asistent i dobishem. Pergjigju shkurt dhe qarte.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;
    
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { error: 'Gabim gjatë komunikimit me AI' },
      { status: 500 }
    );
  }
}