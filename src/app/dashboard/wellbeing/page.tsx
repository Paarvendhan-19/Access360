'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import {
    Heart,
    MessageCircle,
    TrendingUp,
    Smile,
    Meh,
    Frown,
    AlertCircle,
    Send,
    Loader2
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

export default function WellbeingPage() {
    const { dictionary } = useAccessibility();
    const t = dictionary.wellbeing;
    const [mood, setMood] = useState<'happy' | 'neutral' | 'stressed' | 'sad' | null>(null);
    const [note, setNote] = useState('');
    const [stats, setStats] = useState<any[]>([]);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/analytics');
            const data = await res.json();
            setStats(data.moodTrends || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchStats();
    }, []);

    if (!mounted) return null;

    const handleLogMood = async () => {
        if (!mood) return;
        setIsSaving(true);
        try {
            await fetch('/api/wellbeing/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood, note }),
            });
            fetchStats();
            setNote('');
            setMood(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatLoading(true);

        try {
            const res = await fetch('/api/wellbeing/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            console.error(err);
        } finally {
            setChatLoading(false);
        }
    };

    const MOOD_OPTIONS = [
        { key: 'happy', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50', label: t.great },
        { key: 'neutral', icon: Meh, color: 'text-blue-500', bg: 'bg-blue-50', label: t.okay },
        { key: 'stressed', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', label: t.stressed },
        { key: 'sad', icon: Frown, color: 'text-rose-500', bg: 'bg-rose-50', label: t.low },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-10">
                <h2 className="text-4xl font-bold text-slate-900 font-outfit mb-3 tracking-tight">{t.pageTitle}</h2>
                <p className="text-slate-500 text-lg">{t.pageDesc}</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10">
                    {/* Mood Tracker */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Heart className="w-32 h-32 text-rose-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-8 font-outfit">{t.howFeeling}</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
                            {MOOD_OPTIONS.map((m) => {
                                const Icon = m.icon;
                                return (
                                    <button
                                        key={m.key}
                                        onClick={() => setMood(m.key as any)}
                                        className={`p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all ${mood === m.key ? 'ring-4 ring-indigo-500/20 bg-indigo-50' : m.bg + ' grayscale hover:grayscale-0'}`}
                                    >
                                        <Icon className={`w-12 h-12 ${mood === m.key ? 'text-indigo-600' : m.color}`} />
                                        <span className={`font-bold ${mood === m.key ? 'text-indigo-600' : 'text-slate-500'}`}>{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={t.reflectionPlaceholder}
                                className="w-full bg-slate-50 border-none rounded-3xl p-6 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-32"
                            />
                            <button
                                onClick={handleLogMood}
                                disabled={!mood || isSaving}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : t.logMood}
                            </button>
                        </div>
                    </div>

                    {/* Mood Trends */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50">
                        <h3 className="text-2xl font-bold mb-8 font-outfit flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-indigo-600" />
                            {t.weeklySummary}
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <YAxis domain={[1, 5]} hide />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="avgMood" stroke="#6366f1" strokeWidth={5} dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Chatbot Column */}
                <div className="h-[800px] flex flex-col">
                    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col h-full overflow-hidden">
                        <div className="p-8 bg-indigo-600 text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold font-outfit">{t.supportBot}</h4>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">{t.onlineAdvice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                            {chatMessages.length === 0 && (
                                <div className="text-center py-10 opacity-40">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-sm font-medium">{t.chatEmpty}</p>
                                </div>
                            )}
                            {chatMessages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'}`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-100 p-4 rounded-2xl rounded-bl-none">
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-50">
                            <div className="relative">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={t.typePlaceholder}
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || chatLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-4 text-center px-4 leading-tight italic">
                                {t.aiDisclaimer}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
