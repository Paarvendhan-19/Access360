'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    ShieldAlert,
    Activity,
    BarChart3,
    Megaphone,
    Users,
    LogOut,
    Sparkles,
    ChevronLeft
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAccessibility } from '@/components/providers/AccessibilityProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const { dictionary } = useAccessibility();

    const navLinks = [
        { name: dictionary.common.overview, href: '/admin', icon: LayoutDashboard },
        { name: dictionary.sidebar.incidents, href: '/admin/incidents', icon: ShieldAlert },
        { name: dictionary.sidebar.sos, href: '/admin/sos', icon: Activity },
        { name: dictionary.common.wellbeing, href: '/admin/wellbeing', icon: BarChart3 },
        { name: dictionary.sidebar.announcements, href: '/admin/announcements', icon: Megaphone },
        { name: dictionary.sidebar.users, href: '/admin/users', icon: Users },
    ];

    return (
        <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="font-bold text-xl font-outfit text-white tracking-tight block leading-none">Access360</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-1 block">Admin Intelligence</span>
                    </div>
                </div>

                <nav className="space-y-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group relative overflow-hidden",
                                    active
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                                        : "hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")} />
                                <span className="font-bold text-sm tracking-tight">{link.name}</span>
                                {active && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/30" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-8 mt-auto border-t border-slate-800">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white group mb-2"
                >
                    <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span className="font-bold text-sm">{dictionary.sidebar.exitToStudent}</span>
                </Link>
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
