import { sosService } from '@/lib/services/sos';
import dbConnect from '@/lib/mongodb';
import SOSAlert from '@/lib/models/SOSAlert';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/ai';

/** 
 * Compute an urgency score for SOS alert sorting.  
 * Score 1-10 based on time-of-day risk, repeat triggers, etc.
 */
async function getSOSUrgencyScore(userId: string, location: any, existingAlerts: any[]): Promise<number> {
    const now = new Date();
    const hour = now.getHours();
    const isNighttime = hour >= 22 || hour <= 6;
    const repeatCount = existingAlerts.filter(a => a.userId === userId && a.status === 'active').length;

    const prompt = `
        An SOS emergency alert has been triggered on a university campus. Determine the urgency score (1-10, where 10 is maximum emergency).
        
        Factors:
        - Time: ${now.toLocaleTimeString()} (Is nighttime: ${isNighttime})
        - Repeat alerts from same user: ${repeatCount}
        - Has GPS location: ${location ? 'Yes' : 'No'}
        
        Return ONLY a single number between 1 and 10.
    `;

    try {
        const result = await getChatCompletion(prompt, {
            systemPrompt: "You are a campus safety AI. Return only a single integer urgency score.",
            provider: 'groq'
        });
        const score = parseInt(result.trim(), 10);
        return isNaN(score) ? (isNighttime ? 8 : 6) : Math.max(1, Math.min(10, score));
    } catch {
        // Fallback heuristic scoring
        let score = 5;
        if (isNighttime) score += 3;
        if (repeatCount > 1) score += 1;
        if (!location) score -= 1;
        return Math.max(1, Math.min(10, score));
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { location } = await req.json();
        const userId = (session.user as any).id || session.user.email || 'unknown';

        // Fetch existing active alerts to check for repeats
        let existingAlerts: any[] = [];
        try {
            existingAlerts = await sosService.getActiveAlerts();
        } catch (e) {
            console.error('[SOS POST] Could not fetch existing alerts:', e);
        }

        const urgencyScore = await getSOSUrgencyScore(userId, location, existingAlerts);

        const alert = await sosService.triggerSOS(userId, location);

        // Store the urgency score alongside the alert
        if (alert?.id) {
            await dbConnect();
            await SOSAlert.findByIdAndUpdate(alert.id, { urgencyScore });
        }

        return NextResponse.json({ success: true, alert, urgencyScore });
    } catch (error: any) {
        console.error('[SOS POST] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();

        // Fetch ALL alerts (active + handled)
        const alerts = await SOSAlert.find()
            .limit(100)
            .lean();

        const formattedAlerts = alerts.map((doc: any) => ({ id: doc._id.toString(), ...doc }));

        // 🔍 ENRICHMENT: Fetch user profiles for all UIDs
        const userIds = [...new Set(formattedAlerts.map((a: any) => a.userId))].filter(Boolean);
        const userProfiles: Record<string, any> = {};

        if (userIds.length > 0) {
            const users = await User.find().lean();
            users.forEach((doc: any) => {
                userProfiles[doc._id.toString()] = {
                    name: doc.name || doc.email?.split('@')[0] || 'Unknown User',
                    email: doc.email || 'No email'
                };
            });
        }

        const enrichedAlerts = formattedAlerts.map((alert: any) => ({
            ...alert,
            userName: userProfiles[alert.userId]?.name || 'Unknown User',
            userEmail: userProfiles[alert.userId]?.email || 'No email'
        }));

        // Sort in-memory: urgency score descending, then timestamp descending
        const sorted = [...enrichedAlerts].sort((a: any, b: any) => {
            const urgencyDiff = (b.urgencyScore ?? 5) - (a.urgencyScore ?? 5);
            if (urgencyDiff !== 0) return urgencyDiff;
            return (b.timestamp ?? 0) - (a.timestamp ?? 0);
        });
        return NextResponse.json({ alerts: sorted });
    } catch (error: any) {
        console.error('[SOS GET] MongoDB error:', error?.message || error);
        return NextResponse.json({ alerts: [], error: error?.message });
    }
}
