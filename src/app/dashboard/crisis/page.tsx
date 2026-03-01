'use client';

export const dynamic = 'force-dynamic';

import dynamicImport from 'next/dynamic';
import CrisisReportForm from '@/components/crisis/CrisisReportForm';
import SOSButton from '@/components/crisis/SOSButton';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

// Dynamic import for Leaflet (client-side only)
const CrisisMap = dynamicImport(() => import('@/components/crisis/CrisisMap'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-3xl" />
});

export default function CrisisPage() {
    const { dictionary } = useAccessibility();
    const t = dictionary.crisis;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-10">
                <div className="flex-1">
                    <h2 className="text-4xl font-bold text-slate-900 font-outfit mb-3 tracking-tight">{t.pageTitle}</h2>
                    <p className="text-slate-500 text-lg">{t.pageDesc}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <SOSButton />
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">{t.emergencySos}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100">
                        <CrisisMap />
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-50 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800 mb-1">{t.campusReadiness}</h4>
                            <p className="text-sm text-slate-500">{t.campusReadinessDesc}</p>
                        </div>
                        <div className="text-4xl font-black text-indigo-600 font-outfit">
                            84<span className="text-lg text-slate-300">/100</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <CrisisReportForm />

                    <div className="bg-indigo-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <h4 className="text-xl font-bold mb-4 font-outfit">{t.verificationBadge}</h4>
                        <p className="text-indigo-200 text-sm mb-6">{t.verificationBadgeDesc}</p>
                        <button className="w-full bg-white/10 border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition">
                            {t.volunteerLogin}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
