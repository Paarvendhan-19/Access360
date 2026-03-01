'use client';

import { useState } from 'react';
import { AlertTriangle, Wifi, Loader2 } from 'lucide-react';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

export default function SOSButton() {
    const { dictionary } = useAccessibility();
    const t = dictionary.crisis;
    const [active, setActive] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const startSOS = () => {
        setActive(true);
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    const submitSOS = async () => {
                        try {
                            const location = {
                                lat: 12.9716 + (Math.random() - 0.5) * 0.01,
                                lng: 77.5946 + (Math.random() - 0.5) * 0.01
                            };

                            await fetch('/api/crisis/sos', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    location
                                }),
                            });
                        } catch (err) {
                            console.error('SOS Broadcast failed:', err);
                        }
                    };
                    submitSOS();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="relative">
            {!active ? (
                <button
                    onClick={startSOS}
                    className="group relative flex items-center justify-center w-32 h-32"
                >
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
                    <div className="absolute inset-2 bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl group-active:scale-95 transition-transform">
                        <AlertTriangle className="w-8 h-8 mb-1" />
                        <span className="font-bold text-xs">{t.sos}</span>
                    </div>
                </button>
            ) : (
                <div className="bg-red-900 w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-inner border-4 border-red-700">
                    {countdown > 0 ? (
                        <span className="text-4xl font-bold">{countdown}</span>
                    ) : (
                        <>
                            <Wifi className="w-8 h-8 animate-pulse mb-1" />
                            <span className="font-bold text-[10px]">{t.broadcasting}</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
