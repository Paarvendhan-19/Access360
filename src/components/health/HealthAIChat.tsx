'use client';

import { useState } from 'react';
import { Send, Loader2, Heart, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function HealthAIChat() {
    const { dictionary } = useAccessibility();
    const t = dictionary.health;
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<'en' | 'hi' | 'ta'>('en');

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/health', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMessage, language }),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'ai', content: data.response }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'ai', content: t.errorMessage }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-rose-500 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <Heart className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg font-outfit">{t.companion}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => setLanguage('en')} className={cn("text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/30 transition-colors", language === 'en' ? "bg-white text-rose-500 font-bold" : "text-rose-100")}>EN</button>
                            <button onClick={() => setLanguage('hi')} className={cn("text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/30 transition-colors", language === 'hi' ? "bg-white text-rose-500 font-bold" : "text-rose-100")}>HI</button>
                            <button onClick={() => setLanguage('ta')} className={cn("text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/30 transition-colors", language === 'ta' ? "bg-white text-rose-500 font-bold" : "text-rose-100")}>TA</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.length === 0 && (
                    <div className="text-center py-10 space-y-4">
                        <h3 className="font-bold text-slate-800">{t.verifiedInfo}</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                            {t.askSymptoms}
                        </p>
                        <div className="flex flex-col gap-2 max-w-xs mx-auto">
                            <a href="https://www.who.int" target="_blank" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50">
                                {t.visitWho} <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://www.nhp.gov.in" target="_blank" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50">
                                {t.indianPortal} <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                            msg.role === 'user' ? "bg-rose-500 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                            <span className="text-slate-400 text-xs">{t.fetchingInfo}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={t.askPlaceholder}
                    className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-2 text-slate-700 focus:ring-2 focus:ring-rose-500 transition outline-none"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-rose-500 text-white p-2 rounded-2xl hover:bg-rose-600 disabled:opacity-50 transition"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
