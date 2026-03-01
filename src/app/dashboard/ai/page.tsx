'use client';

import AIAssistant from '@/components/accessibility/AIAssistant';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

export default function AIDashboardPage() {
    const { dictionary } = useAccessibility();
    const t = dictionary.ai;

    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl mb-8">
                <h2 className="text-3xl font-bold text-slate-900 font-outfit mb-2">{t.hubTitle}</h2>
                <p className="text-slate-500">{t.hubDesc}</p>
            </div>
            <AIAssistant />
        </div>
    );
}
