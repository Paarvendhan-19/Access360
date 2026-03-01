'use client';

import { useEffect, useState } from 'react';
import {
    Brain, ShieldAlert, HeartPulse, ArrowRight, BellRing,
    Clock, X, Sparkles, MessageSquare, Zap, TrendingUp, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAccessibility } from '@/components/providers/AccessibilityProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const PRIORITY_CONFIG = {
    High: { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-500', text: 'text-red-900', sub: 'text-red-600' },
    Medium: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-500', text: 'text-orange-900', sub: 'text-orange-600' },
    Low: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-600', text: 'text-indigo-900', sub: 'text-indigo-600' },
};

export default function StudentDashboard() {
    const { data: session } = useSession();
    const { dictionary, language } = useAccessibility();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [dismissed, setDismissed] = useState<string[]>([]);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/admin/announcements');
            const data = await res.json();
            if (data.announcements) setAnnouncements(data.announcements);
        } catch (err) {
            console.error('Fetch Announcements Error:', err);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
        const interval = setInterval(fetchAnnouncements, 30000);
        return () => clearInterval(interval);
    }, []);

    const activeAnnouncements = announcements.filter(a => !dismissed.includes(a.id));

    const modules = [
        {
            title: dictionary.common.learning,
            desc: dictionary.dashboard.newFeatures,
            icon: Brain,
            href: '/dashboard/accessibility',
            color: 'indigo',
            accent: 'from-indigo-600 to-indigo-800',
            lightBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            stat: dictionary.dashboard.newFeatures,
        },
        {
            title: dictionary.common.crisis,
            desc: dictionary.dashboard.realtimeUpdates,
            icon: ShieldAlert,
            href: '/dashboard/crisis',
            color: 'red',
            accent: 'from-red-500 to-rose-700',
            lightBg: 'bg-red-50',
            iconColor: 'text-red-600',
            stat: dictionary.dashboard.realtimeUpdates,
        },
        {
            title: dictionary.common.wellbeing,
            desc: dictionary.dashboard.dailyCheckin,
            icon: HeartPulse,
            href: '/dashboard/wellbeing',
            color: 'emerald',
            accent: 'from-emerald-500 to-teal-700',
            lightBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            stat: dictionary.dashboard.dailyCheckin,
        },
    ];

    const firstName = session?.user?.name?.split(' ')[0] || (language === 'ta' ? 'அன்பரே' : language === 'hi' ? 'नमस्ते' : 'there');
    const hour = new Date().getHours();
    const greeting = dictionary.dashboard.greeting;

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Welcome Header */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em] mb-2">{greeting}</p>
                    <h2 className="text-5xl font-black text-slate-900 font-outfit tracking-tight mb-3">
                        {firstName}
                        <span className="text-slate-300">.</span>
                    </h2>
                    <p className="text-slate-500 text-lg font-medium">{dictionary.dashboard.search}</p>
                </div>
                <div className="hidden md:flex items-center gap-3 bg-white border border-slate-100 rounded-3xl px-6 py-4 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-slate-600">{dictionary.dashboard.allSystems}</span>
                </div>
            </div>

            {/* Announcements */}
            {activeAnnouncements.length > 0 && (
                <div className="space-y-3">
                    {activeAnnouncements.map((ann) => {
                        const config = PRIORITY_CONFIG[ann.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.Low;
                        return (
                            <div
                                key={ann.id}
                                className={cn(
                                    "p-5 rounded-[2rem] border flex items-start gap-4 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300",
                                    config.bg, config.border
                                )}
                            >
                                <div className={cn("p-2.5 rounded-2xl shrink-0 text-white", config.icon)}>
                                    <BellRing className="w-5 h-5" />
                                </div>
                                <div className="flex-1 pr-10">
                                    <div className="flex items-center gap-3 mb-0.5">
                                        <h4 className={cn("font-black font-outfit text-base", config.text)}>{ann.title}</h4>
                                        <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1", config.text)}>
                                            <Clock className="w-3 h-3" />
                                            {new Date(ann.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={cn("font-medium text-sm leading-relaxed", config.sub)}>{ann.message}</p>
                                </div>
                                <button
                                    onClick={() => setDismissed([...dismissed, ann.id])}
                                    className="absolute top-5 right-5 p-1.5 hover:bg-black/5 rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {modules.map((mod) => {
                    const Icon = mod.icon;
                    return (
                        <Link
                            key={mod.title}
                            href={mod.href}
                            className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-300 block overflow-hidden relative"
                        >
                            {/* Decorative gradient blob */}
                            <div className={cn(
                                "absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl",
                                mod.lightBg
                            )} />

                            <div className="relative z-10">
                                <div className={cn("w-14 h-14 rounded-[1.25rem] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110", mod.lightBg)}>
                                    <Icon className={cn("w-7 h-7", mod.iconColor)} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 font-outfit mb-2">{mod.title}</h3>
                                <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">{mod.desc}</p>

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{mod.stat}</span>
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-300 shadow-lg group-hover:scale-110",
                                        `bg-gradient-to-br ${mod.accent}`
                                    )}>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-6">
                {[
                    { label: dictionary.common.crisis, value: '0', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: language === 'ta' ? 'AI அமர்வுகள்' : language === 'hi' ? 'AI सत्र' : 'AI Sessions', value: '12', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: language === 'ta' ? 'மனநிலை தொடர்' : language === 'hi' ? 'मूड स्ट्रैक' : 'Mood Streak', value: '7d', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex items-center gap-5 group hover:shadow-lg hover:shadow-slate-100 transition-all">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
                                <Icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 font-outfit">{stat.value}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Hero Banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.07]">
                    <Sparkles className="w-72 h-72 rotate-12" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-indigo-200 text-xs font-black uppercase tracking-widest mb-6 border border-white/10">
                        <Sparkles className="w-3 h-3" />
                        {language === 'ta' ? 'தினசரி உத்வேகம்' : language === 'hi' ? 'दैनिक प्रेरणा' : 'Daily Inspiration'}
                    </div>
                    <h3 className="text-3xl font-bold font-outfit mb-4 leading-tight">
                        {dictionary.dashboard.inspiration}
                    </h3>
                    <p className="text-indigo-200/80 text-base font-medium mb-8 leading-relaxed">
                        {dictionary.dashboard.inspirationSub}
                    </p>
                    <Link
                        href="/dashboard/wellbeing"
                        className="inline-flex items-center gap-3 bg-white text-indigo-900 px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/30 group"
                    >
                        <MessageSquare className="w-5 h-5" />
                        {dictionary.dashboard.chatWellbeing}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
