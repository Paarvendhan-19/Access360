'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, MessageCircle, X, GraduationCap, Lightbulb, BookOpen, Languages as LanguageIcon } from 'lucide-react';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

interface Message {
    role: 'user' | 'ai';
    content: string;
    originalContent?: string;
}

export default function LearningBot() {
    const { dictionary, language } = useAccessibility();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'normal' | 'ELI10' | 'bullet'>('normal');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const suggestQuestions = [
        { icon: GraduationCap, text: dictionary.bot.suggestions.photosynthesis },
        { icon: Lightbulb, text: dictionary.bot.suggestions.study },
        { icon: BookOpen, text: dictionary.bot.suggestions.water },
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText) return;

        setMessages((prev: Message[]) => [...prev, { role: 'user', content: messageText }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: messageText,
                    mode,
                    language: language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English',
                }),
            });
            const data = await res.json();
            setMessages((prev: Message[]) => [...prev, { role: 'ai', content: data.response || data.error || 'No response' }]);
        } catch {
            setMessages((prev: Message[]) => [...prev, { role: 'ai', content: dictionary.bot.placeholder }]);
        } finally {
            setLoading(false);
        }
    };

    const translateMessage = async (index: number) => {
        const msg = messages[index];
        if (!msg || msg.role !== 'ai') return;

        // If already translated and original exists, toggle back
        if (msg.originalContent) {
            const updated = [...messages];
            updated[index] = { ...msg, content: msg.originalContent, originalContent: undefined };
            setMessages(updated);
            return;
        }

        setLoading(true);
        try {
            const targetLang = language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English';
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Translate this text to ${targetLang}:\n\n${msg.content}`,
                    type: 'translate',
                }),
            });
            const data = await res.json();
            if (data.response) {
                const updated = [...messages];
                updated[index] = { ...msg, content: data.response, originalContent: msg.content };
                setMessages(updated);
            }
        } catch (err) {
            console.error('Translation failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen
                    ? 'bg-slate-800 rotate-0 scale-90'
                    : 'bg-gradient-to-br from-indigo-500 to-indigo-700 hover:shadow-indigo-300/50 hover:scale-110'
                    }`}
                aria-label={isOpen ? 'Close chat' : 'Open learning bot'}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Pulse ring when closed */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-[59] w-14 h-14 rounded-full bg-indigo-500/30 animate-ping pointer-events-none" />
            )}

            {/* Chat Panel */}
            <div
                className={`fixed bottom-24 right-6 z-[60] w-[400px] max-h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base font-outfit">{dictionary.bot.title}</h2>
                            <p className="text-indigo-200 text-xs">{dictionary.bot.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex gap-1 bg-indigo-800/40 p-1 rounded-lg">
                        {(['normal', 'ELI10', 'bullet'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-2.5 py-1 text-[10px] rounded-md font-bold transition-all ${mode === m
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-indigo-200 hover:bg-white/10'
                                    }`}
                            >
                                {m === 'ELI10' ? dictionary.bot.modes.simple : m === 'bullet' ? dictionary.bot.modes.bullets : dictionary.bot.modes.normal}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/80 min-h-[300px] max-h-[400px]">
                    {messages.length === 0 && (
                        <div className="text-center py-6">
                            <div className="bg-indigo-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                                <GraduationCap className="w-7 h-7 text-indigo-500" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm">{dictionary.bot.emptyTitle}</h3>
                            <p className="text-slate-400 text-xs max-w-[250px] mx-auto mt-1">
                                {dictionary.bot.emptyDesc}
                            </p>
                            <div className="mt-4 space-y-2">
                                {suggestQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q.text)}
                                        className="w-full flex items-center gap-2 px-3 py-2 bg-white text-left rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-xs text-slate-600 group"
                                    >
                                        <q.icon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 shrink-0" />
                                        <span>{q.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div
                                className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap relative group ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                    : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm'
                                    }`}
                            >
                                {msg.content}
                                {msg.role === 'ai' && (
                                    <button
                                        onClick={() => translateMessage(i)}
                                        className={`absolute -right-8 bottom-0 p-1.5 transition-all ${msg.originalContent
                                            ? 'text-indigo-600 opacity-100 scale-110'
                                            : 'text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100'}`}
                                        title={msg.originalContent ? "Show Original" : dictionary.bot.translate}
                                    >
                                        <LanguageIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                                <span className="text-slate-400 text-xs">{dictionary.bot.thinking}</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder={dictionary.bot.placeholder}
                        className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 transition outline-none"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    );
}
