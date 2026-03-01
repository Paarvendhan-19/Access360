'use client';

import { useState } from 'react';
import { Send, Sparkles, Loader2, MousePointer2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AIAssistant() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'normal' | 'ELI10' | 'bullet'>('normal');

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMessage, mode }),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'ai', content: data.response }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-indigo-600 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg font-outfit">AI Assistant</h2>
                        <p className="text-indigo-100 text-sm">Always here to help</p>
                    </div>
                </div>
                <div className="flex gap-2 bg-indigo-700/50 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('normal')}
                        className={cn("px-3 py-1 text-xs rounded-md transition", mode === 'normal' ? "bg-white text-indigo-700 font-bold" : "text-indigo-200 hover:bg-white/10")}
                    >
                        Normal
                    </button>
                    <button
                        onClick={() => setMode('ELI10')}
                        className={cn("px-3 py-1 text-xs rounded-md transition", mode === 'ELI10' ? "bg-white text-indigo-700 font-bold" : "text-indigo-200 hover:bg-white/10")}
                    >
                        Simplify
                    </button>
                    <button
                        onClick={() => setMode('bullet')}
                        className={cn("px-3 py-1 text-xs rounded-md transition", mode === 'bullet' ? "bg-white text-indigo-700 font-bold" : "text-indigo-200 hover:bg-white/10")}
                    >
                        Bullets
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.length === 0 && (
                    <div className="text-center py-10">
                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MousePointer2 className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h3 className="font-bold text-slate-800">Ask ANTIGRAVITY anything</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                            Get help with campus resources, simplify complex text, or just chat!
                        </p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                            msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                            <span className="text-slate-400 text-xs">AI is thinking...</span>
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
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 transition outline-none"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
