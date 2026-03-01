import { Groq } from 'groq-sdk';
import OpenAI from 'openai';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here'
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export type AIProvider = 'groq' | 'openai';

interface ChatOptions {
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    provider?: AIProvider;
}

export async function getChatCompletion(prompt: string, options: ChatOptions = {}) {
    const {
        systemPrompt = "You are Access360 Campus AI, a supportive and inclusive assistant.",
        temperature = 0.7,
        provider = openai ? 'openai' : 'groq'
    } = options;

    try {
        if (provider === 'openai' && openai) {
            const response = await openai.chat.completions.create({
                model: options.model || "gpt-3.5-turbo",
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature,
            });
            return response.choices[0].message.content || "";
        } else {
            // Fallback to Groq
            const response = await groq.chat.completions.create({
                model: options.model || "llama-3.3-70b-versatile",
                messages: [
                    { role: 'system', content: systemPrompt || "You are Access360 Campus AI, a supportive and inclusive assistant." },
                    { role: 'user', content: prompt }
                ],
                temperature,
            });
            return response.choices[0].message.content || "";
        }
    } catch (error) {
        console.error(`AI Error (${provider}):`, error);
        // Emergency fallback to Groq if OpenAI fails
        if (provider === 'openai' && !options.provider) {
            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature,
            });
            return response.choices[0].message.content || "";
        }
        throw error;
    }
}
