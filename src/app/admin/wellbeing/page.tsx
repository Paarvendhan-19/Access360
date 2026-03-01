'use client';

import { useEffect, useState } from 'react';
import {
    Heart, TrendingUp, PieChart as PieChartIcon, BarChart3, Smile, AlertCircle, Loader2, Zap, ShieldAlert
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdminWellbeingAnalytics() {
    const [data, setData] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, analysisRes] = await Promise.all([
                    fetch('/api/admin/analytics'),
                    fetch('/api/admin/analysis')
                ]);
                const analytics = await analyticsRes.json();
                const aiAnalysis = await analysisRes.json();
                setData(analytics);
                setAnalysis(aiAnalysis);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const MOOD_COLORS = { happy: '#10b981', neutral: '#6366f1', stressed: '#f59e0b', sad: '#ef4444' };

    const moodStats = [
        { name: 'Happy', value: 45, color: MOOD_COLORS.happy },
        { name: 'Neutral', value: 30, color: MOOD_COLORS.neutral },
        { name: 'Stressed', value: 15, color: MOOD_COLORS.stressed },
        { name: 'Sad', value: 10, color: MOOD_COLORS.sad },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
    );

    const anomalies: any[] = analysis?.anomalies || [];

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tight mb-2">Wellbeing Intelligence</h2>
                    <p className="text-slate-500 text-lg font-medium">Anonymized campus mental health trends with AI anomaly detection.</p>
                </div>
                <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">Privacy Verified</span>
                </div>
            </div>

            {/* AI Summary */}
            {analysis?.summary && (
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap className="w-48 h-48 rotate-12 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-500/20 p-2 rounded-xl border border-white/10">
                                <Zap className="w-5 h-5 text-indigo-300" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300">AI Campus Wellbeing Summary</span>
                        </div>
                        <p className="text-xl font-bold leading-relaxed italic max-w-4xl">"{analysis.summary}"</p>
                        {analysis.recommendation && (
                            <p className="mt-4 text-indigo-200 text-sm font-medium">💡 {analysis.recommendation}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Anomaly Alerts */}
            {anomalies.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 font-outfit flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-orange-500" />
                        AI-Detected Mood Anomalies
                        <span className="text-xs font-black text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">{anomalies.length} detected</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {anomalies.map((anomaly: any, i: number) => (
                            <div key={i} className={cn(
                                "p-6 rounded-[2.5rem] border relative overflow-hidden",
                                anomaly.severity === 'high' ? 'bg-red-50 border-red-100' :
                                    anomaly.severity === 'medium' ? 'bg-orange-50 border-orange-100' :
                                        'bg-yellow-50 border-yellow-100'
                            )}>
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-2.5 rounded-2xl shrink-0",
                                        anomaly.severity === 'high' ? 'bg-red-500 text-white' :
                                            anomaly.severity === 'medium' ? 'bg-orange-500 text-white' :
                                                'bg-yellow-500 text-white'
                                    )}>
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{anomaly.day}</p>
                                        <p className="font-bold text-slate-900 text-sm leading-snug">{anomaly.description}</p>
                                        <span className={cn(
                                            "mt-2 inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                            anomaly.severity === 'high' ? 'bg-red-200 text-red-700' :
                                                anomaly.severity === 'medium' ? 'bg-orange-200 text-orange-700' :
                                                    'bg-yellow-200 text-yellow-700'
                                        )}>{anomaly.severity} severity</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mood Distribution Pie */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-2xl font-bold text-slate-900 font-outfit mb-8 flex items-center gap-3">
                        <PieChartIcon className="w-6 h-6 text-indigo-600" />
                        Campus Mood Distribution
                    </h3>
                    <div className="h-80 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={moodStats} innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                                    {moodStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 text-center pointer-events-none">
                            <p className="text-4xl font-black text-slate-900 font-outfit">84%</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participation</p>
                        </div>
                    </div>
                </div>

                {/* Weekly Sentiment Bar */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-bold text-slate-900 font-outfit mb-8 flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-indigo-600" />
                        Weekly Sentiment Trends
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.moodTrends || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <YAxis hide domain={[0, 5]} />
                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="avgMood" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white">
                    <Smile className="w-10 h-10 mb-4 opacity-70" />
                    <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Happiness Index</p>
                    <p className="text-3xl font-black font-outfit">7.8/10</p>
                    <p className="text-xs font-bold mt-4 text-indigo-200">+4% from last week</p>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                    <ShieldAlert className="w-10 h-10 mb-4 text-orange-400" />
                    <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Burnout Risk</p>
                    <p className={cn("text-3xl font-black font-outfit", anomalies.some(a => a.severity === 'high') ? 'text-red-400' : 'text-orange-400')}>
                        {anomalies.some(a => a.severity === 'high') ? 'Elevated' : 'Low'}
                    </p>
                    <p className="text-xs font-bold mt-4 text-slate-500">{anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'} detected by AI</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm border-l-8 border-l-emerald-500">
                    <TrendingUp className="w-10 h-10 mb-4 text-emerald-600" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Peer Support Score</p>
                    <p className="text-3xl font-black font-outfit text-slate-900">High</p>
                    <p className="text-xs font-bold mt-4 text-slate-500">Community resilience is trending</p>
                </div>
            </div>
        </div>
    );
}
