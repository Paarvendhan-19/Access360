import { moodService } from '@/lib/services/moods';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { mood, note } = await req.json();

        const log = await moodService.logMood(
            (session.user as any).id,
            mood,
            note
        );

        return NextResponse.json({ success: true, log });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
