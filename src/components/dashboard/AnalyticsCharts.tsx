'use client';

import { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAccessibility } from '@/components/providers/AccessibilityProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    data: any;
}

const COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981'];

export default function AnalyticsCharts({ data }: Props) {
    const { dictionary } = useAccessibility();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !data) return <div className="p-10 text-center text-slate-400">Loading charts...</div>;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mood Trends */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 font-outfit">{dictionary.analytics.wellbeingTrend}</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data?.moodTrends || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <YAxis domain={[1, 5]} hide />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line type="monotone" dataKey="avgMood" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Crisis Frequency */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 font-outfit">{dictionary.analytics.crisisFreq}</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.crisisFrequency || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                            <Bar dataKey="count" fill="#f43f5e" radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Accessibility Preferences */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 mb-6 font-outfit text-center">{dictionary.analytics.usage}</h3>
                <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data?.accessibilityStats || []}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data?.accessibilityStats?.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                )) || null}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {/* Recent Students */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 mb-6 font-outfit">{dictionary.analytics.recentActivity}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <th className="pb-4 px-4 font-bold">Name</th>
                                <th className="pb-4 px-4 font-bold">Email</th>
                                <th className="pb-4 px-4 font-bold">Role</th>
                                <th className="pb-4 px-4 font-bold">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                            {data?.recentUsers?.map((user: any) => (
                                <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-4 font-bold text-slate-900">{user.name}</td>
                                    <td className="py-4 px-4 text-slate-500">{user.email}</td>
                                    <td className="py-4 px-4 uppercase tracking-tighter text-[10px] font-bold">
                                        <span className={user.role === 'admin' ? 'text-indigo-600' : 'text-emerald-600'}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-slate-400 text-xs">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            )) || (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-400 italic">{dictionary.analytics.noRegistrations}</td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 font-outfit">{dictionary.analytics.recentIncidents}</h3>
                    <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{dictionary.analytics.liveAlerts}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <th className="pb-4 px-4 font-bold">Nature of Incident</th>
                                <th className="pb-4 px-4 font-bold">Severity</th>
                                <th className="pb-4 px-4 font-bold">Status</th>
                                <th className="pb-4 px-4 font-bold">Time</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                            {data?.recentIncidents?.map((incident: any) => (
                                <tr key={incident.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-4 font-bold text-slate-900 max-w-md truncate">{incident.description}</td>
                                    <td className="py-4 px-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                                            incident.severity === 'critical' ? 'bg-red-100 text-red-600' :
                                                incident.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-blue-100 text-blue-600'
                                        )}>
                                            {incident.severity}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-full",
                                            incident.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                                                incident.status === 'approved' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-slate-100 text-slate-400'
                                        )}>
                                            {incident.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-slate-400 text-xs">
                                        {new Date(incident.timestamp).toLocaleTimeString()}
                                    </td>
                                </tr>
                            )) || (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-400 italic">{dictionary.analytics.noIncidents}</td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
