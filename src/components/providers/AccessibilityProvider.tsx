'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import { getDictionary, Dictionary, Language } from '@/lib/i18n';

interface AccessibilityContextType {
    fontSize: 'small' | 'medium' | 'large' | 'xl';
    highContrast: boolean;
    dyslexiaFont: boolean;
    focusMode: boolean;
    speechEnabled: boolean;
    language: Language;
    dictionary: Dictionary;
    updatePreferences: (prefs: any) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [prefs, setPrefs] = useState<{
        fontSize: 'small' | 'medium' | 'large' | 'xl';
        highContrast: boolean;
        dyslexiaFont: boolean;
        focusMode: boolean;
        speechEnabled: boolean;
        language: string;
    }>({
        fontSize: 'medium',
        highContrast: false,
        dyslexiaFont: false,
        focusMode: false,
        speechEnabled: false,
        language: 'en'
    });

    useEffect(() => {
        if (session?.user) {
            const userPrefs = (session.user as any).accessibilityPreferences;
            if (userPrefs) {
                setPrefs({
                    fontSize: userPrefs.fontSize || 'medium',
                    highContrast: userPrefs.highContrast || false,
                    dyslexiaFont: userPrefs.dyslexiaFont || false,
                    focusMode: userPrefs.focusMode || false,
                    speechEnabled: userPrefs.speechEnabled || false,
                    language: userPrefs.language || 'en'
                });
            }
        } else {
            const saved = localStorage.getItem('access360_prefs');
            if (saved) {
                try { setPrefs(JSON.parse(saved)); } catch (e) { }
            }
        }
    }, [session]);

    // Apply global classes to body for layout-level styling
    useEffect(() => {
        const body = document.body;
        body.classList.toggle('high-contrast', prefs.highContrast);
        body.classList.toggle('dyslexia-mode', prefs.dyslexiaFont);
        body.classList.toggle('focus-mode', prefs.focusMode);

        // Remove old font classes
        body.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
        // Add current font class
        const fontClass = prefs.fontSize === 'xl' ? 'text-xl' : prefs.fontSize === 'large' ? 'text-lg' : prefs.fontSize === 'small' ? 'text-sm' : 'text-base';
        body.classList.add(fontClass);
    }, [prefs]);

    const updatePreferences = async (newPrefs: any) => {
        const updated = { ...prefs, ...newPrefs };
        setPrefs(updated);
        localStorage.setItem('access360_prefs', JSON.stringify(updated));

        if (session?.user) {
            try {
                await fetch('/api/user/preferences', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated),
                });
            } catch (err) {
                console.error('Failed to persist preferences:', err);
            }
        }
    };

    const dictionary = getDictionary(prefs.language as Language);

    return (
        <AccessibilityContext.Provider value={{ ...prefs, language: prefs.language as Language, dictionary, updatePreferences }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
    return context;
};
