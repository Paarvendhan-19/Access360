'use client';

import { useState } from 'react';
import { ShieldAlert, AlertCircle, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function CrisisReportForm() {
    const { dictionary } = useAccessibility();
    const t = dictionary.crisis;
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const severityLabels: Record<string, string> = {
        low: t.low,
        medium: t.medium,
        high: t.high,
        critical: t.critical,
    };

    const handleSubmit = async () => {
        if (!description.trim()) return;
        setLoading(true);

        const location = { lat: 12.9716 + (Math.random() - 0.5) * 0.1, lng: 77.5946 + (Math.random() - 0.5) * 0.1 };

        try {
            const res = await fetch('/api/crisis/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'Safety',
                    description,
                    severity,
                    location
                }),
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
            <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex flex-col items-center text-center">
                <CheckCircle2 className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-red-900 mb-1 font-outfit">{t.reportSubmitted}</h3>
                <p className="text-red-700 text-sm mb-4">{t.reportSubmittedDesc}</p>
                <button onClick={() => setSubmitted(false)} className="text-red-900 font-bold hover:underline">{t.submitAnother}</button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-50 p-3 rounded-2xl">
                    <ShieldAlert className="w-6 h-6 text-red-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 font-outfit">{t.submitReport}</h3>
                    <p className="text-slate-500 text-xs">{t.reportDesc}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.severityLevel}</label>
                    <div className="grid grid-cols-4 gap-2">
                        {(['low', 'medium', 'high', 'critical'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setSeverity(s)}
                                className={cn(
                                    "py-2 rounded-xl text-xs font-bold transition-all border",
                                    severity === s
                                        ? "bg-red-600 text-white border-red-600"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-red-200"
                                )}
                            >
                                {severityLabels[s]}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.description}</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t.describeSituation}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-red-500 transition outline-none min-h-[100px]"
                    />
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                    <Camera className="w-6 h-6 text-slate-400" />
                    <span className="text-sm text-slate-500 font-medium">{t.addPhoto}</span>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !description.trim()}
                    className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.broadcastReport}
                </button>
            </div>
        </div>
    );
}
