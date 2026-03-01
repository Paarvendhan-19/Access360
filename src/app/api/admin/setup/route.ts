import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/setup
 * 
 * Promotes a user to admin role.
 * Protected by a SETUP_SECRET environment variable.
 * Run this ONCE to set up the first admin account.
 * 
 * Body: { email: string, secret: string }
 */
export async function POST(req: Request) {
    try {
        const { email, secret } = await req.json();

        // Validate against secret key in env
        const setupSecret = process.env.ADMIN_SETUP_SECRET || 'access360-admin-2024';
        if (secret !== setupSecret) {
            return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 });
        }

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await dbConnect();

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({
                error: `No user found with email: ${email}. Please sign up first, then run this endpoint.`
            }, { status: 404 });
        }

        user.role = 'admin';
        await user.save();

        console.log(`[AdminSetup] Promoted ${email} to admin role.`);

        return NextResponse.json({
            success: true,
            message: `✅ ${email} has been promoted to admin. You can now sign out and back in to access /admin.`
        });
    } catch (error: any) {
        console.error('[AdminSetup Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/admin/setup
 * Returns setup instructions.
 */
export async function GET() {
    return NextResponse.json({
        message: '👋 Access360 Admin Setup',
        instructions: [
            '1. Make a POST request to this endpoint',
            '2. Body: { "email": "<your-email>", "secret": "access360-admin-2024" }',
            '3. Sign out and sign back in to get the updated admin role',
            '4. Navigate to /admin to access the admin portal'
        ],
        note: 'Set ADMIN_SETUP_SECRET in .env.local to change the default secret'
    });
}
