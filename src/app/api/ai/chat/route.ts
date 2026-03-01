import { generateAIResponse } from '@/lib/groq';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
    try {
        const { prompt, mode, language, type } = await req.json();
        let systemPrompt = "You are Access360 AI, an inclusive campus assistant. Help students with their concerns in a supportive way.";

        if (type === 'translate') {
            systemPrompt = "You are a professional translator. Translate the given text exactly into the target language. Do not add any conversational filler or extra helpfulness. Just the translation.";
        } else {
            if (mode === 'ELI10') {
                systemPrompt += ' Explain the user input as if communicating with a 10-year-old. Use very simple language.';
            }
            if (mode === 'bullet') {
                systemPrompt += ' Format the response strictly as a clean, easy-to-read list of bullet points.';
            }
            if (language) {
                systemPrompt += ` Respond in ${language}.`;
            }
        }

        const response = await generateAIResponse(prompt, systemPrompt);

        return NextResponse.json({ response });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
