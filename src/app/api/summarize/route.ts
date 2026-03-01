import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { text, type = 'summary' } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const prompt = type === 'summary'
            ? `Summarize the following text for a student. Keep it concise and easy to read. Use bullet points for key takeaways:\n\n${text}`
            : `Explain the following concept simply as if I am a beginner:\n\n${text}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful campus assistant specializing in inclusive learning and accessibility. Help students understand complex materials by providing clear, simplified summaries.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
        });

        const result = chatCompletion.choices[0]?.message?.content || 'No summary generated.';

        return NextResponse.json({ summary: result });
    } catch (error: any) {
        console.error('AI Summary Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
