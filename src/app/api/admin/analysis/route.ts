import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { moodService } from '@/lib/services/moods';
import { getChatCompletion } from '@/lib/ai';

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch last week of mood data
        const moods = await moodService.getWeeklyStats();

        const prompt = `
            Analyze the following mood trend data for a university campus community measured over the last 7 days.
            Data: ${JSON.stringify(moods)}
            
            Return a valid JSON object with the following structure (no markdown, just pure JSON):
            {
              "summary": "<3-sentence overall campus wellbeing summary>",
              "anomalies": [
                {
                  "day": "<day identifier from data>",
                  "description": "<concise description of the anomaly>",
                  "severity": "low" | "medium" | "high"
                }
              ],
              "recommendation": "<one actionable recommendation for campus admin>"
            }
            
            Anomalies are sudden drops or spikes in mood scores compared to adjacent days.
            If there are no anomalies, return an empty array.
        `;

        const rawAnalysis = await getChatCompletion(prompt, {
            systemPrompt: "You are an expert campus wellbeing analyst. Always return valid JSON only, with no surrounding text or markdown.",
            provider: 'groq'
        });

        // Safely parse JSON
        let parsed: any = { summary: rawAnalysis, anomalies: [], recommendation: '' };
        try {
            // Strip any potential markdown code fences
            const cleaned = rawAnalysis.replace(/```json|```/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch {
            // Fallback: surface raw text as summary
            parsed = { summary: rawAnalysis, anomalies: [], recommendation: '' };
        }

        return NextResponse.json({ analysis: parsed.summary, anomalies: parsed.anomalies, recommendation: parsed.recommendation });
    } catch (error) {
        console.error('Mood Analysis Error:', error);
        return NextResponse.json({ error: 'Failed to analyze moods' }, { status: 500 });
    }
}
