import { useState, useCallback, useEffect } from 'react';

export function useSpeechToText() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState<any>(null);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const reco = new SpeechRecognition();
                reco.continuous = true;
                reco.interimResults = true;
                reco.lang = 'en-US';

                reco.onresult = (event: any) => {
                    let interimTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            setTranscript(prev => prev + event.results[i][0].transcript + ' ');
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }
                };

                reco.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                };

                reco.onend = () => {
                    setIsListening(false);
                };

                setRecognition(reco);
            } else {
                setIsSupported(false);
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognition) {
            try {
                recognition.start();
                setIsListening(true);
            } catch (e) {
                console.error('Start listening error:', e);
            }
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition]);

    return { isListening, transcript, startListening, stopListening, setTranscript, isSupported };
}

export function useTextToSpeech() {
    const speak = (text: string, lang: string = 'en-US') => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        }
    };

    const stop = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    return { speak, stop };
}
