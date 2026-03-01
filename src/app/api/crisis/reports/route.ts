import { incidentService } from '@/lib/services/incidents';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Incident from '@/lib/models/Incident';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/ai';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, location, description, severity: userSeverity, imageUrl } = await req.json();

        // AI Smart Prioritization
        const priorityPrompt = `
            Analyze this incident report and categorize its severity as 'low', 'medium', 'high', or 'critical'.
            Incident Type: ${type}
            Description: ${description}
            
            Return ONLY the severity word.
        `;

        const aiSeverity = await getChatCompletion(priorityPrompt, {
            systemPrompt: "You are a crisis dispatcher. Categorize incidents strictly by urgency.",
            provider: 'groq'
        });

        const finalSeverity = (['low', 'medium', 'high', 'critical'].includes(aiSeverity.toLowerCase().trim()))
            ? aiSeverity.toLowerCase().trim()
            : userSeverity;

        const report = await incidentService.createIncident({
            userId: (session.user as any).id || session.user.email || 'unknown',
            type,
            location,
            description,
            severity: finalSeverity,
            imageUrl,
        });

        return NextResponse.json({ success: true, report });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const incidents = await incidentService.getAllIncidents(100);

        // 🔍 ENRICHMENT: Fetch user profiles for all UIDs
        await dbConnect();
        const userIds = [...new Set(incidents.map((i: any) => i.userId))].filter(Boolean);
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

        const enrichedIncidents = incidents.map((incident: any) => ({
            ...incident,
            userName: userProfiles[incident.userId]?.name || 'Unknown User',
            userEmail: userProfiles[incident.userId]?.email || 'No email'
        }));

        return NextResponse.json({ incidents: enrichedIncidents });
    } catch (error: any) {
        console.error('[Reports GET] MongoDB error:', error?.message || error);
        return NextResponse.json({ incidents: [], error: error?.message });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, status } = await req.json();
        await incidentService.updateStatus(id, status);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
        }

        await dbConnect();
        await Incident.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
