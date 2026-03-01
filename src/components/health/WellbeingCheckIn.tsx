'use client';

import { useState } from 'react';
import { Smile, Frown, Meh, Laugh, Angry, CheckCircle2, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const moods = [
    { score: 1, icon: Angry, color: 'text-red-500', bg: 'bg-red-50' },
    { score: 2, icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50' },
    { score: 3, icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { score: 4, icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
    { score: 5, icon: Laugh, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

export default function WellbeingCheckIn() {
    const { dictionary } = useAccessibility();
    const t = dictionary.wellbeing;
    const [selectedScore, setSelectedScore] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (selectedScore === null) return;
        setLoading(true);

        try {
            const res = await fetch('/api/health/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moodScore: selectedScore, note }),
            });
            if (res.ok) setSubmitted(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center">
                <div className="bg-green-50 p-4 rounded-full mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 font-outfit">{t.logSaved}</h3>
                <p className="text-slate-500 mb-6 italic">"{t.logSavedQuote}"</p>
                <button onClick={() => setSubmitted(false)} className="text-indigo-600 font-bold hover:underline">{t.logAnother}</button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-lg">
            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-outfit">{t.howFeeling}</h3>
            <p className="text-slate-500 mb-8">{t.moodPrivacy}</p>

            <div className="flex justify-between mb-8">
                {moods.map((mood) => {
                    const Icon = mood.icon;
                    const active = selectedScore === mood.score;
                    return (
                        <button
                            key={mood.score}
                            onClick={() => setSelectedScore(mood.score)}
                            className={cn(
                                "p-4 rounded-2xl transition-all duration-200 transform hover:scale-110",
                                active ? cn(mood.bg, "ring-2 ring-indigo-500 ring-offset-2 scale-110") : "hover:bg-slate-50"
                            )}
                        >
                            <Icon className={cn("w-10 h-10", mood.color)} />
                        </button>
                    );
                })}
            </div>

            <textarea
                placeholder={t.addNote}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-indigo-500 transition outline-none mb-6 min-h-[120px]"
            />

            <button
                onClick={handleSubmit}
                disabled={loading || selectedScore === null}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.saveEntry}
            </button>
        </div>
    );
}
