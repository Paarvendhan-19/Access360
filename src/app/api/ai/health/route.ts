import { generateAIResponse } from '@/lib/groq';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt, language = 'en' } = await req.json();

        const languageNames: any = {
            'en': 'English',
            'hi': 'Hindi',
            'ta': 'Tamil'
        };

        const systemPrompt = `
      You are Access360 Health AI. You help students log their wellbeing and mental health updates accurately and supportively.
      The user preferred language is: ${languageNames[language] || 'English'}.
      
      CRITICAL: You are NOT a doctor. You provide EDUCATIONAL health information only.
      MANDATORY: Every response MUST start with: "Disclaimer: This is not medical advice. Always consult with a healthcare professional." in the requested language.
      
      Suggest official sources like WHO (who.int) or Indian health portals (nhp.gov.in) when appropriate.
      Stay supportive, clear, and calm. If asked for a diagnosis, gently refuse and suggest seeing a professional.
    `;

        const response = await generateAIResponse(prompt, systemPrompt);

        return NextResponse.json({ response });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
