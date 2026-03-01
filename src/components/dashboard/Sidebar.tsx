'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
    Home,
    ShieldAlert,
    HeartPulse,
    LayoutDashboard,
    LogOut,
    Sparkles,
    Brain,
    ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAccessibility } from '@/components/providers/AccessibilityProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { Suspense } from 'react';

export default function Sidebar({ userRole = 'student' }: { userRole?: string }) {
    return (
        <Suspense fallback={<div className="w-72 bg-slate-900 h-screen fixed left-0 top-0" />}>
            <SidebarContent userRole={userRole} />
        </Suspense>
    );
}

function SidebarContent({ userRole = 'student' }: { userRole?: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');
    const { data: session } = useSession();
    const { dictionary } = useAccessibility();

    const allLinks = [
        { name: dictionary.sidebar.adminHub, href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
        { name: dictionary.sidebar.hub, href: '/dashboard', icon: Home, roles: ['student'] },
        { name: dictionary.common.learning, href: '/dashboard/accessibility', icon: Brain, roles: ['student', 'admin'] },
        { name: dictionary.common.crisis, href: '/dashboard/crisis', icon: ShieldAlert, roles: ['student', 'admin'] },
        { name: dictionary.common.wellbeing, href: '/dashboard/wellbeing', icon: HeartPulse, roles: ['student', 'admin'] },
    ];

    const links = allLinks.filter(link => link.roles.includes(userRole));

    return (
        <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50">
            {/* Brand */}
            <div className="p-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="font-bold text-xl font-outfit text-white tracking-tight block leading-none">Access360</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-1 block">
                            {userRole === 'admin' ? dictionary.sidebar.adminIntelligence : dictionary.sidebar.studentExperience}
                        </span>
                    </div>
                </div>

                {/* User pill */}
                <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3 mb-8 border border-slate-700/50">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20 shrink-0">
                        {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate leading-tight">{session?.user?.name || dictionary.common.guest}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-0.5">
                            {userRole === 'admin' ? dictionary.common.admin : dictionary.common.student}
                        </p>
                    </div>
                </div>

                {/* Nav section label */}
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 px-2 mb-3">{dictionary.sidebar.navigation}</p>

                <nav className="space-y-1.5">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const active = pathname === link.href;
                        const finalHref = roleParam ? `${link.href}?role=${roleParam}` : link.href;

                        return (
                            <Link
                                key={link.href}
                                href={finalHref}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group relative overflow-hidden",
                                    active
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                                        : "hover:bg-slate-800 hover:text-white text-slate-400"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 transition-transform duration-200 shrink-0", active ? "scale-110" : "group-hover:scale-110")} />
                                <span className="font-bold text-sm tracking-tight">{link.name}</span>
                                {active && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/30 rounded-l-full" />
                                )}
                                {!active && (
                                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-8 mt-auto border-t border-slate-800">
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 font-bold group"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{dictionary.common.signout}</span>
                </button>
            </div>
        </aside>
    );
}
