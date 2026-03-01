'use client';

import { useEffect, useState } from 'react';
import {
    ShieldAlert,
    CheckCircle2,
    Trash2,
    Search,
    Loader2,
    Clock,
    Flame,
    AlertCircle,
    MapPin,
    Zap,
    ArrowUpDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const SEVERITY_RANK: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
};

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [sortByAI, setSortByAI] = useState(true);

    const fetchIncidents = async () => {
        try {
            const res = await fetch('/api/crisis/reports');
            const data = await res.json();
            if (data.incidents) setIncidents(data.incidents);
        } catch (err) {
            console.error('Fetch Incidents Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
        const interval = setInterval(fetchIncidents, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/crisis/reports', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) fetchIncidents();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteIncident = async (id: string) => {
        if (!confirm('Are you sure you want to remove this report?')) return;
        try {
            const res = await fetch(`/api/crisis/reports?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchIncidents();
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = incidents
        .filter(i => {
            const matchesSearch = (i.description || '').toLowerCase().includes(search.toLowerCase()) ||
                (i.type || '').toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === 'all' || i.status === filter;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (!sortByAI) return b.timestamp - a.timestamp;
            const rankA = SEVERITY_RANK[a.severity] ?? 0;
            const rankB = SEVERITY_RANK[b.severity] ?? 0;
            if (rankB !== rankA) return rankB - rankA;
            return b.timestamp - a.timestamp;
        });

    const criticalCount = incidents.filter(i => ['critical', 'high'].includes(i.severity) && i.status !== 'resolved').length;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tight mb-2">Incident Management</h2>
                    <p className="text-slate-500 text-lg font-medium">Monitor and respond to safety reports in real-time.</p>
                </div>
                <div className="flex items-center gap-4">
                    {criticalCount > 0 && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-5 py-3 rounded-2xl animate-pulse">
                            <Zap className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-black text-red-600">{criticalCount} HIGH-RISK ACTIVE</span>
                        </div>
                    )}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search incidents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white border border-slate-200 pl-11 pr-6 py-3 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-3 items-center justify-between">
                <div className="flex gap-2">
                    {['all', 'pending', 'approved', 'resolved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                filter === f
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "bg-white text-slate-500 border border-slate-100 hover:border-indigo-200"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setSortByAI(!sortByAI)}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border",
                        sortByAI
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                            : "bg-white text-slate-500 border-slate-100"
                    )}
                >
                    <Zap className="w-3 h-3" />
                    AI Priority Sort {sortByAI ? 'ON' : 'OFF'}
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Incident Details</th>
                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">AI Severity</th>
                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
                                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing with Live Feed...</p>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-slate-400 italic font-medium font-outfit text-xl">
                                    No incidents matching your current view found.
                                </td>
                            </tr>
                        ) : filtered.map((incident) => {
                            const isCritical = incident.severity === 'critical';
                            const isHigh = incident.severity === 'high';
                            const isUrgent = isCritical || isHigh;
                            return (
                                <tr
                                    key={incident.id}
                                    className={cn(
                                        "group transition-colors",
                                        isCritical ? "bg-red-50/60 hover:bg-red-50" :
                                            isHigh ? "bg-orange-50/40 hover:bg-orange-50/60" :
                                                "hover:bg-slate-50/50"
                                    )}
                                >
                                    <td className="p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Pulsing indicator for urgent items */}
                                            <div className="relative">
                                                <div className={cn(
                                                    "p-3 rounded-2xl",
                                                    isCritical ? 'bg-red-100 text-red-600' :
                                                        isHigh ? 'bg-orange-100 text-orange-600' :
                                                            incident.type === 'Fire' ? 'bg-orange-50 text-orange-500' :
                                                                'bg-blue-50 text-blue-500'
                                                )}>
                                                    {incident.type === 'Fire' ? <Flame className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                                </div>
                                                {isUrgent && incident.status !== 'resolved' && (
                                                    <span className="absolute -top-1 -right-1 w-3 h-3">
                                                        <span className={cn(
                                                            "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                                                            isCritical ? "bg-red-500" : "bg-orange-500"
                                                        )} />
                                                        <span className={cn(
                                                            "relative inline-flex rounded-full h-3 w-3",
                                                            isCritical ? "bg-red-500" : "bg-orange-500"
                                                        )} />
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="font-bold text-slate-900 leading-tight">{incident.type}</p>
                                                    {isCritical && (
                                                        <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">⚡ AI FLAGGED</span>
                                                    )}
                                                    {isHigh && (
                                                        <span className="bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">⬆ HIGH RISK</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium max-w-md line-clamp-2 mb-1">{incident.description}</p>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[9px] font-bold">
                                                        Reporter: {incident.userName}
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 font-medium">
                                                        {incident.userEmail}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(incident.timestamp).toLocaleString()}</span>
                                                    {incident.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {parseFloat(incident.location.lat).toFixed(2)}°, {parseFloat(incident.location.lng).toFixed(2)}°</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                            isCritical ? 'bg-red-500 text-white shadow-lg shadow-red-200 ring-2 ring-red-300 ring-offset-2' :
                                                isHigh ? 'bg-orange-500 text-white shadow-md shadow-orange-100' :
                                                    incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-50 text-blue-600'
                                        )}>
                                            {incident.severity}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            incident.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                                                incident.status === 'approved' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-slate-100 text-slate-400'
                                        )}>
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                incident.status === 'resolved' ? 'bg-emerald-500' :
                                                    incident.status === 'approved' ? 'bg-blue-500' :
                                                        'bg-slate-400'
                                            )} />
                                            {incident.status}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {incident.status !== 'approved' && incident.status !== 'resolved' && (
                                                <button onClick={() => updateStatus(incident.id, 'approved')}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Approve">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            {incident.status !== 'resolved' && (
                                                <button onClick={() => updateStatus(incident.id, 'resolved')}
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Resolve">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button onClick={() => deleteIncident(incident.id)}
                                                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Delete">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
