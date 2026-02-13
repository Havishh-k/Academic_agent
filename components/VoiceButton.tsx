import React, { useState, useRef, useCallback, useEffect } from 'react';

// Type declarations for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface VoiceButtonProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
}

/**
 * Voice Input Button — STT via Web Speech API.
 * Works best in Chrome/Edge. Falls back gracefully.
 */
const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscript, disabled }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<any>(null);
    const lastTranscriptRef = useRef<string>('');

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            // Deduplicate: ignore if same as last transcript
            if (transcript && transcript !== lastTranscriptRef.current) {
                lastTranscriptRef.current = transcript;
                onTranscript(transcript);
            }
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Clear last transcript after a delay so next press is fresh
            setTimeout(() => { lastTranscriptRef.current = ''; }, 500);
        };

        recognitionRef.current = recognition;
        lastTranscriptRef.current = '';
        recognition.start();
        setIsListening(true);
    }, [isListening, onTranscript]);

    if (!isSupported) return null;

    return (
        <button
            onClick={toggleListening}
            disabled={disabled}
            title={isListening ? 'Stop listening' : 'Voice input'}
            style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isListening
                    ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                    : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: '#fff',
                boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.5)' : '0 2px 8px rgba(124, 58, 237, 0.3)',
                transition: 'all 0.2s ease',
                animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
                opacity: disabled ? 0.5 : 1,
                flexShrink: 0,
            }}
        >
            {isListening ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
            ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
            )}
        </button>
    );
};


/**
 * TTS Toggle Button — Text-to-Speech via Web Speech API.
 * Toggling OFF immediately stops any ongoing speech.
 */
interface TTSToggleProps {
    enabled: boolean;
    onToggle: () => void;
}

const TTSToggle: React.FC<TTSToggleProps> = ({ enabled, onToggle }) => {
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    if (!isSupported) return null;

    const handleClick = () => {
        // If currently enabled, stop any ongoing speech when disabling
        if (enabled) {
            stopSpeaking();
        }
        onToggle();
    };

    return (
        <button
            onClick={handleClick}
            title={enabled ? 'Disable voice output' : 'Enable voice output'}
            style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: enabled ? 'rgba(139, 92, 246, 0.1)' : '#fff',
                color: enabled ? '#7C3AED' : '#9CA3AF',
                transition: 'all 0.2s',
            }}
        >
            {enabled ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
            )}
        </button>
    );
};


/**
 * Stop any ongoing TTS speech immediately.
 */
export const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

/**
 * Speak text using Web Speech API.
 * Only call for final assistant messages, not for status/agent updates.
 */
export const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    // Prefer a British English voice
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(v =>
        v.lang === 'en-GB' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('British'))
    ) || voices.find(v => v.lang === 'en-GB')
        || voices.find(v => v.name.includes('British') || v.name.includes('UK'));
    if (britishVoice) utterance.voice = britishVoice;
    window.speechSynthesis.speak(utterance);
};


export { VoiceButton, TTSToggle };
export default VoiceButton;
