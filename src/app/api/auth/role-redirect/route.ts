import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/role-redirect
 * Called as the OAuth callback URL to redirect users based on their role.
 * Admins → /admin, Students → /dashboard
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    const redirectUrl = role === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, process.env.NEXTAUTH_URL || 'http://localhost:3000'));
}
