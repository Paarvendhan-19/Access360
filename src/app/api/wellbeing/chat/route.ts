import { NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/ai';

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const reply = await getChatCompletion(message, {
            systemPrompt: "You are the Access360 Wellbeing Companion, a supportive AI assistant for university students. You provide empathetic, non-medical advice. If you detect critical distress, strongly advise contacting professional help or using the Crisis module.",
            // provider: 'openai' // This will default to OpenAI if key exists, else Groq
        });

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Wellbeing Chat Error:', error);
        return NextResponse.json({ error: 'Chat service unavailable' }, { status: 500 });
    }
}
