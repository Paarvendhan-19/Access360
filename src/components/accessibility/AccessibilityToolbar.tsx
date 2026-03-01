'use client';

import { useState, useEffect } from 'react';
import { Settings, Eye, Type, Contrast, Layout, Languages, Volume2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { useAccessibility } from '@/components/providers/AccessibilityProvider';

export default function AccessibilityToolbar() {
    const {
        highContrast,
        fontSize,
        dyslexiaFont,
        focusMode,
        speechEnabled,
        language,
        dictionary,
        updatePreferences
    } = useAccessibility();

    useEffect(() => {
        const handleHover = (e: MouseEvent) => {
            if (!speechEnabled) return;
            const target = e.target as HTMLElement;
            const text = target.innerText || target.getAttribute('aria-label') || target.getAttribute('placeholder');
            if (text && text.length < 200) {
                window.speechSynthesis.cancel();
                const utterance = new window.SpeechSynthesisUtterance(text);
                utterance.rate = 1.1;
                window.speechSynthesis.speak(utterance);
            }
        };

        if (speechEnabled) {
            document.addEventListener('mouseover', handleHover);
        }

        return () => {
            document.removeEventListener('mouseover', handleHover);
            window.speechSynthesis.cancel();
        };
    }, [speechEnabled]);

    const handleSpeech = () => {
        if (!speechEnabled) {
            const utterance = new window.SpeechSynthesisUtterance("Speech support enabled. Hover over elements to hear them.");
            window.speechSynthesis.speak(utterance);
        }
        updatePreferences({ speechEnabled: !speechEnabled });
    };

    return (
        <div className="fixed bottom-6 right-24 flex flex-col items-end gap-3 group z-50">
            <div className="flex flex-col gap-2 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 origin-bottom bg-white/90 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/20 mb-2 w-64 translate-y-4 group-hover:translate-y-0">
                <div className="flex items-center justify-between px-4 mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{dictionary.accessibility.title}</p>
                    <div className="flex gap-1">
                        {(['en', 'ta', 'hi'] as const).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => updatePreferences({ language: lang })}
                                className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${language === lang ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <button
                        onClick={() => updatePreferences({ highContrast: !highContrast })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${highContrast ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                        <div className={`p-2 rounded-xl ${highContrast ? 'bg-white/10' : 'bg-slate-100'}`}>
                            <Contrast className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold">{dictionary.accessibility.highContrast}</span>
                    </button>

                    <button
                        onClick={() => {
                            const sizes: typeof fontSize[] = ['small', 'medium', 'large', 'xl'];
                            const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length];
                            updatePreferences({ fontSize: next });
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 text-slate-700 transition-all"
                    >
                        <div className="p-2 bg-slate-100 rounded-xl">
                            <Type className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-bold">{dictionary.accessibility.fontSize}: {fontSize.toUpperCase()}</span>
                        </div>
                    </button>

                    <button
                        onClick={() => updatePreferences({ dyslexiaFont: !dyslexiaFont })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${dyslexiaFont ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                        <div className={`p-2 rounded-xl ${dyslexiaFont ? 'bg-white' : 'bg-slate-100'}`}>
                            <Eye className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold">{dictionary.accessibility.dyslexiaFont}</span>
                    </button>

                    <button
                        onClick={() => updatePreferences({ focusMode: !focusMode })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${focusMode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                        <div className={`p-2 rounded-xl ${focusMode ? 'bg-white/20' : 'bg-slate-100'}`}>
                            <Layout className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold">{dictionary.accessibility.focusMode}</span>
                    </button>

                    <button
                        onClick={() => updatePreferences({ speechEnabled: !speechEnabled })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${speechEnabled ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                        <div className={`p-2 rounded-xl ${speechEnabled ? 'bg-white/10' : 'bg-slate-100'}`}>
                            <Volume2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold">{dictionary.accessibility.speech}</span>
                    </button>
                </div>
            </div>

            <button className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 rounded-[2rem] shadow-2xl hover:shadow-indigo-500/40 transition-all active:scale-95 group-hover:rotate-12">
                <Settings className="w-7 h-7" />
            </button>
        </div>
    );
}
