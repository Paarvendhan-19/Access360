import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function generateAIResponse(prompt: string, systemPrompt?: string) {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt || 'You are the Access360 Campus AI Companion. Your goal is to provide inclusive, supportive, and practical advice to students with accessibility, wellbeing, and crisis information in a friendly, supportive tone.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile',
        });

        return completion.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Groq AI Error:', error);
        throw new Error('Failed to generate AI response');
    }
}
