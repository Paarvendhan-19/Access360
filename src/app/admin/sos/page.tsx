'use client';

import { useEffect, useState } from 'react';
import {
    Activity, AlertTriangle, CheckCircle2, MessageSquare, Clock, MapPin,
    Loader2, ShieldAlert, User, ArrowUpRight, Zap, Flame
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function UrgencyBar({ score }: { score: number }) {
    const pct = (score / 10) * 100;
    const color = score >= 8 ? 'bg-red-500' : score >= 5 ? 'bg-orange-500' : 'bg-blue-400';
    return (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
    );
}

export default function SOSMonitoringPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [firebaseError, setFirebaseError] = useState<string | null>(null);

    const fetchAlerts = async () => {
        try {
            const res = await fetch('/api/crisis/sos');
            const data = await res.json();
            if (data.alerts) setAlerts(data.alerts);
            if (data.firebaseError) setFirebaseError(data.firebaseError);
            else setFirebaseError(null);
        } catch (err) {
            console.error('Fetch SOS Alerts Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    const markAsHandled = async (id: string) => {
        try {
            const res = await fetch('/api/admin/sos/handled', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) fetchAlerts();
        } catch (err) {
            console.error(err);
        }
    };

    const activeAlerts = alerts.filter(a => a.status === 'active');
    const handledAlerts = alerts.filter(a => a.status === 'handled');

    // Highest urgency first (already sorted by API, but re-confirm)
    const sortedActive = [...activeAlerts].sort((a, b) => (b.urgencyScore ?? 5) - (a.urgencyScore ?? 5));

    return (
        <div className="space-y-10">
            {firebaseError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                    <ShieldAlert className="w-6 h-6 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold text-red-700 text-sm">Firebase Credentials Expired</p>
                        <p className="text-red-600 text-xs mt-1">The Firebase service account key has expired. Go to <strong>Firebase Console → Project Settings → Service Accounts → Generate new private key</strong>, then update <code className="bg-red-100 px-1 rounded">.env.local</code> and restart the server.</p>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tight mb-2">SOS Response Hub</h2>
                    <p className="text-slate-500 text-lg font-medium">Emergency broadcasts sorted by AI urgency score — highest risk first.</p>
                </div>
                <div className="flex gap-4">
                    {activeAlerts.length > 0 && (
                        <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100 flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                            <span className="text-sm font-black text-red-600 uppercase tracking-widest">{activeAlerts.length} Active Alerts</span>
                        </div>
                    )}
                    <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex items-center gap-3">
                        <Zap className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">AI Urgency Ranked</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Alerts List */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 font-outfit flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Live Emergency Feed
                        <span className="text-xs font-bold text-indigo-500 ml-2 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Sorted by AI Score</span>
                    </h3>

                    {loading ? (
                        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
                            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Waiting for Broadcasts...</p>
                        </div>
                    ) : sortedActive.length === 0 ? (
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center">
                            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h4 className="text-2xl font-bold text-slate-900 font-outfit mb-2">All Clear</h4>
                            <p className="text-slate-500 font-medium">No active SOS alerts currently reported on campus.</p>
                        </div>
                    ) : (
                        sortedActive.map((alert) => {
                            const urgency = alert.urgencyScore ?? 5;
                            const isCriticalUrgency = urgency >= 8;
                            return (
                                <div key={alert.id} className={cn(
                                    "bg-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group transition-all duration-300",
                                    isCriticalUrgency ? "border-l-8 border-l-red-600 shadow-red-100" : "border-l-8 border-l-orange-400 shadow-orange-50"
                                )}>
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <ShieldAlert className="w-32 h-32 text-red-600" />
                                    </div>

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 p-3 rounded-2xl text-slate-600">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Triggered By</p>
                                                <p className="text-lg font-bold text-slate-900 truncate w-48">{alert.userName || 'Unknown User'}</p>
                                                <p className="text-[10px] font-medium text-slate-400 truncate w-48">{alert.userEmail}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">AI Urgency</p>
                                            <div className={cn(
                                                "text-3xl font-black font-outfit",
                                                isCriticalUrgency ? "text-red-600" : urgency >= 5 ? "text-orange-500" : "text-blue-500"
                                            )}>{urgency}<span className="text-base text-slate-400">/10</span></div>
                                            <UrgencyBar score={urgency} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                                        <div className="bg-slate-50 p-4 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-1 text-slate-400"><Clock className="w-3 h-3" /><span className="text-[10px] font-black uppercase tracking-widest">Time</span></div>
                                            <p className="text-sm font-bold text-slate-700">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-1 text-slate-400"><MapPin className="w-3 h-3" /><span className="text-[10px] font-black uppercase tracking-widest">Location</span></div>
                                            <p className="text-sm font-bold text-slate-700">
                                                {alert.location ? `${parseFloat(alert.location.lat).toFixed(3)}, ${parseFloat(alert.location.lng).toFixed(3)}` : 'Unavailable'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 relative z-10">
                                        <button onClick={() => markAsHandled(alert.id)}
                                            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" /> Mark as Handled
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Handled History */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 font-outfit flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        Response History
                    </h3>
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                            {handledAlerts.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 italic font-medium">No archive alerts yet.</div>
                            ) : handledAlerts.map((alert) => (
                                <div key={alert.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{alert.userId}</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(alert.timestamp).toLocaleString()}</p>
                                                {alert.urgencyScore && (
                                                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">Score: {alert.urgencyScore}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
