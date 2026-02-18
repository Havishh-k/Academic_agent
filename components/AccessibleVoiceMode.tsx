import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Subject } from './SubjectCard';
import { sendMessageToTutor } from '../services/tutorAgent';
import { UserRole, Message } from '../types';
import { speakText, stopSpeaking } from './VoiceButton';

// ─── Types ───
type PulseState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AccessibleVoiceModeProps {
    subjects: Subject[];
    studentId: string;
    userName: string;
    onSignOut: () => void;
}

// ─── Pulse Colors & Animations per State ───
const PULSE_CONFIG: Record<PulseState, { color: string; glow: string; label: string; icon: string }> = {
    idle: {
        color: 'from-slate-600 to-slate-700',
        glow: 'shadow-slate-500/30',
        label: 'Tap to start listening...',
        icon: '🎙️',
    },
    listening: {
        color: 'from-[#2B5797] to-[#1a3a6e]',
        glow: 'shadow-[#2B5797]/50',
        label: 'Listening...',
        icon: '🎤',
    },
    thinking: {
        color: 'from-amber-500 to-orange-600',
        glow: 'shadow-amber-400/50',
        label: 'Thinking...',
        icon: '🧠',
    },
    speaking: {
        color: 'from-emerald-500 to-teal-600',
        glow: 'shadow-emerald-400/50',
        label: 'Speaking...',
        icon: '🔊',
    },
};

const AccessibleVoiceMode: React.FC<AccessibleVoiceModeProps> = ({
    subjects,
    studentId,
    userName,
    onSignOut,
}) => {
    // ─── State ───
    const [pulseState, setPulseState] = useState<PulseState>('idle');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(subjects[0] || null);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
    const [error, setError] = useState('');

    const recognitionRef = useRef<any>(null);
    const isAutoLooping = useRef(false);
    const historyEndRef = useRef<HTMLDivElement>(null);

    // ─── Auto-scroll transcript ───
    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationHistory]);

    // ─── Cleanup on unmount ───
    useEffect(() => {
        return () => {
            stopSpeaking();
            recognitionRef.current?.abort();
            isAutoLooping.current = false;
        };
    }, []);

    // ─── Start Listening ───
    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        stopSpeaking();
        setTranscript('');
        setError('');
        setPulseState('listening');
        isAutoLooping.current = true;

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        let finalTranscript = '';

        recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }
            setTranscript(finalTranscript || interim);
        };

        recognition.onend = () => {
            if (finalTranscript.trim() && isAutoLooping.current) {
                handleSendMessage(finalTranscript.trim());
            } else if (isAutoLooping.current) {
                // No speech detected — restart listening
                setTimeout(() => {
                    if (isAutoLooping.current) startListening();
                }, 300);
            } else {
                setPulseState('idle');
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech' && isAutoLooping.current) {
                setTimeout(() => {
                    if (isAutoLooping.current) startListening();
                }, 300);
            } else if (event.error !== 'aborted') {
                setError(`Microphone error: ${event.error}`);
                setPulseState('idle');
                isAutoLooping.current = false;
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [selectedSubject]);

    // ─── Stop Everything ───
    const stopEverything = useCallback(() => {
        isAutoLooping.current = false;
        recognitionRef.current?.abort();
        stopSpeaking();
        setPulseState('idle');
        setTranscript('');
    }, []);

    // ─── Send Message to Tutor ───
    const handleSendMessage = async (text: string) => {
        setPulseState('thinking');
        setTranscript('');

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: Date.now(),
        };

        setConversationHistory(prev => [...prev, userMessage]);
        setAiResponse('');

        try {
            const allMessages = [...conversationHistory, userMessage].filter(m => m.id !== 'welcome');
            const result = await sendMessageToTutor(
                allMessages,
                UserRole.STUDENT,
                studentId,
                selectedSubject?.id || ''
            );

            const response = result.response || 'I could not generate a response. Please try again.';
            setAiResponse(response);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: response,
                timestamp: Date.now(),
            };
            setConversationHistory(prev => [...prev, aiMessage]);

            // ─── Speak the response ───
            setPulseState('speaking');
            const cleanText = response.replace(/[*#_`~\[\]]/g, '').replace(/\n+/g, '. ');

            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = 'en-GB';
                utterance.rate = 0.95;
                utterance.pitch = 1.0;

                const voices = window.speechSynthesis.getVoices();
                const britishVoice = voices.find(v =>
                    v.lang === 'en-GB' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('British'))
                ) || voices.find(v => v.lang === 'en-GB');
                if (britishVoice) utterance.voice = britishVoice;

                utterance.onend = () => {
                    // Loop back to listening
                    if (isAutoLooping.current) {
                        setTimeout(() => startListening(), 500);
                    } else {
                        setPulseState('idle');
                    }
                };
                utterance.onerror = () => {
                    if (isAutoLooping.current) {
                        setTimeout(() => startListening(), 500);
                    } else {
                        setPulseState('idle');
                    }
                };

                window.speechSynthesis.speak(utterance);
            } else {
                // No TTS — just loop back
                if (isAutoLooping.current) {
                    setTimeout(() => startListening(), 1000);
                } else {
                    setPulseState('idle');
                }
            }
        } catch (err: any) {
            console.error('Voice mode error:', err);
            const errMsg = err?.message?.includes('429')
                ? 'Rate limit reached. Please wait a moment.'
                : 'Something went wrong. Please try again.';
            setError(errMsg);
            setAiResponse(errMsg);
            setPulseState('idle');
            isAutoLooping.current = false;
        }
    };

    // ─── Handle Pulse Click ───
    const handlePulseClick = () => {
        if (pulseState === 'idle') {
            startListening();
        } else {
            stopEverything();
        }
    };

    const config = PULSE_CONFIG[pulseState];

    // ─── Render ───
    return (
        <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-sans"
            style={{ userSelect: 'none' }}>

            {/* ─── Top Bar ─── */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B5797] to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#2B5797]/30">
                        AI
                    </div>
                    <div>
                        <h1 className="text-white/90 font-bold text-lg">Welcome, {userName.split(' ')[0]}</h1>
                        <p className="text-white/40 text-xs">Voice-First Mode • Accessibility Enabled</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Subject Selector */}
                    {subjects.length > 1 && (
                        <select
                            value={selectedSubject?.id || ''}
                            onChange={(e) => {
                                const sub = subjects.find(s => s.id === e.target.value);
                                if (sub) {
                                    setSelectedSubject(sub);
                                    setConversationHistory([]);
                                    setAiResponse('');
                                    stopEverything();
                                }
                            }}
                            className="bg-white/5 border border-white/10 text-white/80 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2B5797] backdrop-blur-sm"
                        >
                            {subjects.map(s => (
                                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                                    {s.subject_code} — {s.subject_name}
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={onSignOut}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 border border-red-500/20 transition-colors"
                    >
                        ↪ Sign Out
                    </button>
                </div>
            </div>

            {/* ─── Subject Badge ─── */}
            {selectedSubject && (
                <div className="absolute top-20 text-center z-10">
                    <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-sm font-medium backdrop-blur-sm">
                        {selectedSubject.subject_code} • {selectedSubject.subject_name}
                    </span>
                </div>
            )}

            {/* ─── Central Pulse ─── */}
            <div className="relative flex flex-col items-center gap-8 z-10">

                {/* Outer Glow Rings */}
                <div className="relative">
                    {pulseState !== 'idle' && (
                        <>
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-20 blur-3xl scale-[2.5] ${pulseState === 'listening' ? 'animate-pulse' : pulseState === 'thinking' ? 'animate-spin' : 'animate-bounce'}`}
                                style={{ animationDuration: pulseState === 'thinking' ? '3s' : '2s' }} />
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-10 blur-2xl scale-[3.5] animate-pulse`}
                                style={{ animationDuration: '3s' }} />
                        </>
                    )}

                    {/* Main Pulse Circle */}
                    <button
                        onClick={handlePulseClick}
                        className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${config.color} shadow-2xl ${config.glow} 
                            flex items-center justify-center cursor-pointer transition-all duration-500 
                            hover:scale-105 active:scale-95 group
                            ${pulseState === 'listening' ? 'animate-pulse' : ''}`}
                        style={{
                            animationDuration: pulseState === 'listening' ? '1.5s' : '2s',
                        }}
                    >
                        <span className="text-5xl filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                            {config.icon}
                        </span>

                        {/* Ripple ring for listening */}
                        {pulseState === 'listening' && (
                            <div className="absolute inset-0 rounded-full border-2 border-[#4A7BC5]/50 animate-ping" />
                        )}
                        {/* Spinning ring for thinking */}
                        {pulseState === 'thinking' && (
                            <div className="absolute inset-[-4px] rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
                        )}
                    </button>
                </div>

                {/* State Label */}
                <p className={`text-lg font-semibold transition-colors duration-500 ${pulseState === 'idle' ? 'text-white/40' :
                        pulseState === 'listening' ? 'text-[#6B9AD1]' :
                            pulseState === 'thinking' ? 'text-amber-300' :
                                'text-emerald-300'
                    }`}>
                    {config.label}
                </p>

                {/* Live Transcript (what student is saying) */}
                {transcript && pulseState === 'listening' && (
                    <div className="max-w-2xl text-center animate-fade-in">
                        <p className="text-4xl font-bold text-white/90 leading-relaxed tracking-wide">
                            "{transcript}"
                        </p>
                    </div>
                )}

                {/* AI Response */}
                {aiResponse && (pulseState === 'speaking' || pulseState === 'idle') && (
                    <div className="max-w-2xl text-center animate-fade-in">
                        <p className="text-2xl text-white/70 leading-relaxed font-light">
                            {aiResponse.length > 300 ? aiResponse.slice(0, 300) + '…' : aiResponse}
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-fade-in">
                        {error}
                    </div>
                )}
            </div>

            {/* ─── Conversation History Panel ─── */}
            {conversationHistory.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 max-h-[30vh] overflow-y-auto px-6 py-4 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent z-10">
                    <div className="max-w-2xl mx-auto space-y-3">
                        {conversationHistory.slice(-10).map((msg) => (
                            <div key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-[#2B5797]/20 text-[#9DBFE3] border border-[#2B5797]/20 rounded-br-md'
                                        : 'bg-white/5 text-white/60 border border-white/5 rounded-bl-md'
                                    }`}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-1">
                                        {msg.role === 'user' ? 'You' : 'AI Tutor'}
                                    </span>
                                    {msg.content.length > 200 ? msg.content.slice(0, 200) + '…' : msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={historyEndRef} />
                    </div>
                </div>
            )}

            {/* ─── Keyboard Shortcut Hint ─── */}
            <div className="absolute bottom-4 right-6 text-white/20 text-xs z-10">
                {pulseState === 'idle' ? 'Click the orb or press Space to begin' : 'Click orb to stop'}
            </div>

            {/* ─── Background subtle grid pattern ─── */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '40px 40px',
            }} />
        </div>
    );
};

export default AccessibleVoiceMode;
