'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import { Users, ShieldAlert, Heart, Activity, Loader2, Sparkles, Shield, ArrowRight, X } from 'lucide-react';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

import { Suspense } from 'react';

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        }>
            <DashboardPageContent />
        </Suspense>
    );
}

function DashboardPageContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const queryRole = searchParams.get('role');
    const { dictionary } = useAccessibility();
    const t = dictionary.dashboard;
    const [data, setData] = useState<any>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const userRole = (queryRole as any) || (session?.user as any)?.role || 'student';
    const adminDenied = searchParams.get('adminDenied') === '1';
    const [deniedBannerOpen, setDeniedBannerOpen] = useState(true);

    useEffect(() => {
        if (userRole === 'admin') {
            const fetchData = async () => {
                try {
                    const [res, analysisRes] = await Promise.all([
                        fetch('/api/admin/analytics'),
                        fetch('/api/admin/analysis')
                    ]);
                    const d = await res.json();
                    const a = await analysisRes.json();
                    setData(d);
                    setAnalysis(a.analysis || '');
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setLoading(false);
        }
    }, [userRole]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (userRole === 'student') {
        return (
            <div className="relative">
                {/* Admin Access Denied Banner */}
                {adminDenied && deniedBannerOpen && (
                    <div className="mb-6 bg-orange-50 border border-orange-200 rounded-[2rem] p-5 flex items-start gap-4">
                        <div className="bg-orange-500 p-2 rounded-xl text-white shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-orange-900">{t.adminDeniedTitle}</p>
                            <p className="text-orange-700 text-sm font-medium mt-1">
                                {t.adminDeniedDesc}
                            </p>
                        </div>
                        <button onClick={() => setDeniedBannerOpen(false)} className="text-orange-400 hover:text-orange-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <StudentDashboard />
            </div>
        );
    }

    const stats = [
        { name: t.totalUsers, value: data?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: t.totalIncidents, value: data?.totalReports || 0, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
        { name: t.unverifiedReports, value: data?.activeCrises || 0, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
        { name: t.wellbeingIndex, value: '4.2/5', icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Admin Portal Entry Banner */}
            <div className="mb-10 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[3rem] p-8 flex items-center justify-between text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-32 opacity-5">
                    <Sparkles className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-600 p-2 rounded-xl">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300">{t.adminPortal}</span>
                    </div>
                    <h2 className="text-3xl font-black font-outfit tracking-tight mb-1">{t.controlCentre}</h2>
                    <p className="text-slate-400 font-medium text-sm">{t.controlCentreDesc}</p>
                </div>
                <Link
                    href="/admin"
                    className="relative z-10 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-3 shrink-0"
                >
                    {t.enterAdmin} <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

            <div className="mb-10">
                <h2 className="text-4xl font-bold text-slate-900 font-outfit mb-3 tracking-tight">{t.systemIntelligence}</h2>
                <p className="text-slate-500 text-lg">{t.systemIntelligenceDesc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className={`${stat.bg} p-4 rounded-2xl`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.name}</p>
                                <p className="text-2xl font-black text-slate-900 font-outfit">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {analysis && (
                <div className="bg-indigo-900/5 border border-indigo-100 p-8 rounded-[3rem] mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-24 h-24 text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-wider">{t.aiInsights}</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium italic">
                        "{analysis}"
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{t.insightsGenerated}</span>
                    </div>
                </div>
            )}

            <AnalyticsCharts data={data} />
        </div>
    );
}
