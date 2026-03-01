import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function proxy(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');
        const isAdminPage = req.nextUrl.pathname.startsWith('/admin');

        if (isAdminPage) {
            if (!isAuth) {
                return NextResponse.redirect(new URL('/auth/signin', req.url));
            }
            if (token?.role !== 'admin') {
                const url = new URL('/dashboard', req.url);
                url.searchParams.set('adminDenied', '1');
                return NextResponse.redirect(url);
            }
        }

        if (isDashboardPage && !isAuth) {
            return NextResponse.redirect(new URL('/auth/signin', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: () => true,
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
};
