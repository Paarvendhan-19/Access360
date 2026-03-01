'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    ShieldAlert,
    Activity,
    Heart,
    ArrowUpRight,
    Sparkles,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Megaphone,
    Zap
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Link from 'next/link';

export default function AdminOverview() {
    const [data, setData] = useState<any>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [activityMonitor, setActivityMonitor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [res, analysisRes, activityRes] = await Promise.all([
                    fetch('/api/admin/analytics'),
                    fetch('/api/admin/analysis'),
                    fetch('/api/admin/activity-monitor')
                ]);
                const d = await res.json();
                const a = await analysisRes.json();
                const act = await activityRes.json();
                setData(d);
                setAnalysis(a.analysis || '');
                setActivityMonitor(act);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const kpis = [
        {
            name: 'Total Campus Users',
            value: data?.totalUsers || 0,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: '+12% from last month'
        },
        {
            name: 'Active SOS Alerts',
            value: data?.activeSOS || 0,
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            trend: 'Direct response required'
        },
        {
            name: 'Pending Incidents',
            value: data?.totalReports || 0,
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            trend: '5 need urgent review'
        },
        {
            name: 'Inclusion Index',
            value: '94%',
            icon: Heart,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: 'Based on preference data'
        },
    ];

    if (loading) {
        return (
            <div className="flex animate-pulse flex-col gap-8">
                <div className="h-32 bg-slate-200 rounded-[2.5rem]" />
                <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tight mb-2">System Analytics</h2>
                    <p className="text-slate-500 text-lg font-medium">Real-time intelligence for a more inclusive campus.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                        Download Report
                    </button>
                    <Link
                        href="/admin/announcements"
                        className="bg-indigo-600 px-6 py-3 rounded-2xl font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                        New Announcement
                    </Link>
                </div>
            </div>

            {/* AI Insight Bar */}
            {analysis && (
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Sparkles className="w-48 h-48 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-500/20 backdrop-blur-md p-2 rounded-xl border border-white/10">
                                <Sparkles className="w-5 h-5 text-indigo-300" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300">AI Campus Summary</span>
                        </div>
                        <p className="text-2xl font-bold leading-relaxed max-w-4xl font-outfit italic">
                            "{analysis}"
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-50 group">
                            <div className={`${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.name}</p>
                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-4xl font-black text-slate-900 font-outfit">{stat.value}</span>
                                <ArrowUpRight className="w-5 h-5 text-emerald-500 mb-2" />
                            </div>
                            <p className="text-xs font-bold text-slate-400">{stat.trend}</p>
                        </div>
                    );
                })}
            </div>

            {/* AI Activity Monitor */}
            {activityMonitor && (
                <div className={`rounded-[3rem] p-8 border relative overflow-hidden ${activityMonitor.status === 'critical' ? 'bg-red-50 border-red-200' :
                    activityMonitor.status === 'elevated' ? 'bg-orange-50 border-orange-200' :
                        'bg-emerald-50 border-emerald-200'
                    }`}>
                    <div className="flex items-start gap-6">
                        <div className={`p-4 rounded-3xl shrink-0 ${activityMonitor.status === 'critical' ? 'bg-red-500 text-white' :
                            activityMonitor.status === 'elevated' ? 'bg-orange-500 text-white' :
                                'bg-emerald-500 text-white'
                            }`}>
                            <Zap className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-slate-900 font-outfit">AI Activity Monitor</h3>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${activityMonitor.status === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
                                    activityMonitor.status === 'elevated' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                        'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    }`}>{activityMonitor.status}</span>
                            </div>
                            <p className="text-slate-600 font-medium mb-5">{activityMonitor.summary}</p>
                            {activityMonitor.highlights?.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {activityMonitor.highlights.map((h: any, i: number) => (
                                        <div key={i} className={`p-4 rounded-2xl border ${h.level === 'danger' ? 'bg-red-50 border-red-100' :
                                            h.level === 'warning' ? 'bg-orange-50 border-orange-100' :
                                                'bg-white border-slate-100'
                                            }`}>
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{h.level}</p>
                                            <p className="font-bold text-slate-900 text-sm mb-1">{h.title}</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{h.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Mood Trend Chart */}
                <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-bold text-slate-900 font-outfit">Campus Mood Pulse</h3>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white shadow-sm text-indigo-600">7 Days</button>
                            <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500">30 Days</button>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.moodTrends || []}>
                                <defs>
                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <YAxis hide domain={[1, 5]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="avgMood"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorMood)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions / Recent Activity */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 font-outfit mb-6">Required Actions</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                                <div className="bg-red-500 p-2 rounded-xl text-white">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">3 Active SOS Alerts</p>
                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">Immediate Response</p>
                                </div>
                                <Link href="/admin/sos" className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                    <ArrowUpRight className="w-4 h-4 text-red-600" />
                                </Link>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <div className="bg-orange-500 p-2 rounded-xl text-white">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">8 Pending Reports</p>
                                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Review Queued</p>
                                </div>
                                <Link href="/admin/incidents" className="p-2 hover:bg-orange-100 rounded-lg transition-colors">
                                    <ArrowUpRight className="w-4 h-4 text-orange-600" />
                                </Link>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="bg-emerald-500 p-2 rounded-xl text-white">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">System Healthy</p>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">All services online</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-200">
                        <h3 className="text-xl font-bold font-outfit mb-4">Announcement Blast</h3>
                        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Push emergency notifications or campus updates directly to all student dashboards instantly.</p>
                        <Link
                            href="/admin/announcements"
                            className="bg-white text-indigo-600 w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all"
                        >
                            <Megaphone className="w-4 h-4" />
                            Compose Blast
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
