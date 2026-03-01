'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import AccessibilityToolbar from '@/components/accessibility/AccessibilityToolbar';
import LearningBot from '@/components/dashboard/LearningBot';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Bell } from 'lucide-react';

import { Suspense } from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-outfit">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Experience...</p>
                </div>
            </div>
        }>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Suspense>
    );
}

function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const queryRole = searchParams.get('role');

    const userRole = (queryRole as any) || (session?.user as any)?.role || 'student';

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar userRole={userRole} />
            <main className="flex-1 ml-72 min-h-screen">
                {/* Top Header Bar — matches admin portal */}
                <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-40 px-10 flex items-center justify-between shadow-sm">
                    <div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                            {userRole === 'admin' ? 'Admin Intelligence' : 'Student Experience'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Notification bell */}
                        <button className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Bell className="w-4 h-4" />
                        </button>
                        {/* User pill */}
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl pl-3 pr-4 py-1.5">
                            <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-indigo-200">
                                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 leading-none">{session?.user?.name || 'Guest'}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mt-0.5">{userRole}</p>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="p-10">
                    {children}
                </div>
            </main>
            <AccessibilityToolbar />
            <LearningBot />
        </div>
    );
}
