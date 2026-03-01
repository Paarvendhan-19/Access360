'use client';

import { useEffect, useState } from 'react';
import {
    Megaphone,
    Plus,
    Trash2,
    Clock,
    Tag,
    Loader2,
    Send,
    BellRing,
    Layout
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('Low');

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/admin/announcements');
            const data = await res.json();
            if (data.announcements) setAnnouncements(data.announcements);
        } catch (err) {
            console.error('Fetch Announcements Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
        const interval = setInterval(fetchAnnouncements, 15000); // Poll every 15 seconds
        return () => clearInterval(interval);
    }, []);

    const createAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, message, priority })
            });
            if (res.ok) {
                setTitle('');
                setMessage('');
                setPriority('Low');
                setIsCreating(false);
                fetchAnnouncements();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteAnnouncement = async (id: string) => {
        if (!confirm('Permanently remove this announcement?')) return;
        try {
            const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchAnnouncements();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tight mb-2">Campus Broadcasts</h2>
                    <p className="text-slate-500 text-lg font-medium">Issue university-wide alerts and updates directly to student dashboards.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-indigo-600 px-8 py-4 rounded-[2rem] font-bold text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3"
                >
                    <Plus className="w-5 h-5" />
                    Compose New
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-10 rounded-[3rem] border-2 border-indigo-100 shadow-2xl shadow-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={createAnnouncement} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">Subject Title</label>
                                <input
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Winter Term Inclusion Seminar"
                                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">Priority Escalation</label>
                                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                                    {['Low', 'Medium', 'High'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className={cn(
                                                "flex-1 py-4 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                                priority === p ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">Detailed Message</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe the announcement in detail..."
                                rows={4}
                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-all"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 px-10 py-4 rounded-2xl font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-3"
                            >
                                <Send className="w-5 h-5" />
                                Launch Announcement
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Accessing Broadcast Archive...</p>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center">
                        <Layout className="w-16 h-16 text-slate-200 mb-6" />
                        <h4 className="text-2xl font-bold text-slate-900 font-outfit mb-2">No Active Broadcasts</h4>
                        <p className="text-slate-500 font-medium">Your global campus communications will appear here.</p>
                    </div>
                ) : announcements.map((ann) => (
                    <div key={ann.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative group overflow-hidden flex flex-col h-full transition-all hover:shadow-xl hover:shadow-indigo-50">
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                ann.priority === 'High' ? 'bg-red-50 text-red-600' :
                                    ann.priority === 'Medium' ? 'bg-orange-50 text-orange-600' :
                                        'bg-blue-50 text-blue-600'
                            )}>
                                <BellRing className="w-3 h-3" />
                                {ann.priority} Priority
                            </div>
                            <button
                                onClick={() => deleteAnnouncement(ann.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 font-outfit mb-3 pr-8 leading-tight">{ann.title}</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 flex-1">{ann.message}</p>

                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {new Date(ann.timestamp).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Megaphone className="w-3 h-3" />
                                Live
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
