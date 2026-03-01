import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { userService } from '@/lib/services/user';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prefs = await req.json();
        const userEmail = session.user.email;

        if (!userEmail) {
            return NextResponse.json({ error: 'User email not found' }, { status: 400 });
        }

        const user = await userService.getUserByEmail(userEmail);
        if (!user || !user.id) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Map the flat prefs from frontend to the UserPreferences structure
        const normalizedPrefs = {
            highContrast: prefs.highContrast ?? user.accessibilityPreferences?.highContrast ?? false,
            fontSize: prefs.fontSize ?? user.accessibilityPreferences?.fontSize ?? 'medium',
            dyslexiaFont: prefs.dyslexiaFont ?? user.accessibilityPreferences?.dyslexiaFont ?? false,
            focusMode: prefs.focusMode ?? user.accessibilityPreferences?.focusMode ?? false,
            speechEnabled: prefs.speechEnabled ?? user.accessibilityPreferences?.speechEnabled ?? false,
            language: prefs.language ?? user.accessibilityPreferences?.language ?? 'en',
        };

        await userService.updateUser(user.id, {
            accessibilityPreferences: normalizedPrefs as any
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Preferences Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
