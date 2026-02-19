import React, { useState, useRef, useEffect } from 'react';
import { Message, UserRole, AgentStep } from '../types';
import { Subject, SUBJECT_COLORS, DEFAULT_THEME } from './SubjectCard';
import AgentActivityPanel from './AgentActivityPanel';
import MessageBubble from './MessageBubble';
import FileUploadPanel from './FileUploadPanel';
import { sendMessageToTutor } from '../services/tutorAgent';
import { VoiceButton, TTSToggle, speakText, stopSpeaking } from './VoiceButton';

const FASTAPI_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface SubjectViewProps {
    subject: Subject;
    userRole: UserRole;
    studentId: string;
    userName: string;
    onBack: () => void;
}

// Quick suggestion chips for students
const QUICK_SUGGESTIONS = [
    { label: '📖 Explain this topic', text: 'Explain the key concepts of this subject in simple terms' },
    { label: '🧠 Quiz me', text: 'Give me a short quiz to test my understanding of recent topics' },
    { label: '📝 Summarize notes', text: 'Summarize the key points from the course material' },
    { label: '❓ What should I study?', text: 'What are the most important topics I should focus on?' },
    { label: '🔗 Prerequisites', text: 'What are the prerequisites I need to know for this subject?' },
    { label: '📊 Compare concepts', text: 'Compare and contrast the main concepts covered so far' },
];

const SubjectView: React.FC<SubjectViewProps> = ({ subject, userRole, studentId, userName, onBack }) => {
    const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'quiz'>('chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentAgentSteps, setCurrentAgentSteps] = useState<AgentStep[]>([]);
    const [seedStatus, setSeedStatus] = useState<string | null>(null);
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Quiz state
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [quizHistory, setQuizHistory] = useState<any[]>([]);
    const [activeQuiz, setActiveQuiz] = useState<any>(null);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [quizResult, setQuizResult] = useState<any>(null);
    const [quizSubmitting, setQuizSubmitting] = useState(false);
    const [quizLoading, setQuizLoading] = useState(false);

    const theme = SUBJECT_COLORS[subject.subject_code] || DEFAULT_THEME;

    const getWelcomeMessage = (): Message => ({
        id: 'welcome',
        role: 'model',
        content: userRole === UserRole.STUDENT
            ? `Welcome to **${subject.subject_name}** (${subject.subject_code})! 🎓\n\nI'm your AI tutor for this subject. Ask me anything about the course material, or pick a quick option below to get started.`
            : `Welcome to **${subject.subject_name}** (${subject.subject_code}). 👨‍🏫\n\nManage course materials in the Files tab or use the chat for curriculum analysis and student insights.`,
        timestamp: Date.now(),
    });

    // Set welcome message on mount
    useEffect(() => {
        setMessages([getWelcomeMessage()]);
        setShowSuggestions(true);
        if (userRole === UserRole.STUDENT) {
            loadStudentQuizzes();
        }
    }, [subject.id]);

    const loadStudentQuizzes = async () => {
        setQuizLoading(true);
        try {
            const [quizRes, histRes] = await Promise.all([
                fetch(`${FASTAPI_BASE}/api/quiz/list/${subject.id}?published_only=true`),
                fetch(`${FASTAPI_BASE}/api/quiz/history/${studentId}?subject_id=${subject.id}`),
            ]);
            if (quizRes.ok) {
                const data = await quizRes.json();
                setAvailableQuizzes(data.quizzes || []);
            }
            if (histRes.ok) {
                const data = await histRes.json();
                setQuizHistory(data.attempts || []);
            }
        } catch (e) { console.error(e); } finally {
            setQuizLoading(false);
        }
    };

    const startQuiz = (quiz: any) => {
        let questions = quiz.questions;
        if (typeof questions === 'string') questions = JSON.parse(questions);
        setActiveQuiz({ ...quiz, questions });
        setQuizAnswers({});
        setQuizResult(null);
    };

    const submitQuiz = async () => {
        if (!activeQuiz) return;
        setQuizSubmitting(true);
        try {
            const answers = Object.entries(quizAnswers).map(([idx, opt]) => ({
                question_index: parseInt(idx),
                selected_option: opt,
            }));
            const res = await fetch(`${FASTAPI_BASE}/api/quiz/attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz_id: activeQuiz.id,
                    student_id: studentId,
                    answers,
                }),
            });
            if (res.ok) {
                const result = await res.json();
                setQuizResult(result);
                loadStudentQuizzes();
            }
        } catch (e) { console.error(e); } finally {
            setQuizSubmitting(false);
        }
    };

    // Cancel TTS on unmount (navigating away)
    useEffect(() => {
        return () => {
            stopSpeaking();
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleClearChat = () => {
        stopSpeaking();
        setMessages([getWelcomeMessage()]);
        setCurrentAgentSteps([]);
        setInput('');
        setShowSuggestions(true);
        if (inputRef.current) inputRef.current.style.height = 'auto';
    };

    const handleBack = () => {
        stopSpeaking();
        onBack();
    };

    const handleSend = async (textOverride?: string) => {
        const text = textOverride || input;
        if (!text.trim() || isLoading) return;

        // Hide suggestions after first user message
        setShowSuggestions(false);

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text.trim(),
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setCurrentAgentSteps([]);

        if (inputRef.current) inputRef.current.style.height = 'auto';

        const updatedMessages = [...messages, userMessage].filter(m => m.id !== 'welcome');

        try {
            const result = await sendMessageToTutor(updatedMessages, userRole, studentId, subject.id);
            const agentMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: result.response,
                timestamp: Date.now(),
                agentSteps: result.agentSteps,
                retrievedSources: result.retrievedSources,
            };
            setCurrentAgentSteps(result.agentSteps);
            setMessages(prev => [...prev, agentMessage]);
            // TTS: speak final answer only (not agent status)
            if (ttsEnabled && result.response) {
                speakText(result.response.replace(/[*#_`~]/g, ''));
            }
        } catch (error: any) {
            const errMsg = error?.message || String(error);
            let errorContent = 'I encountered an error. Please try again.';
            if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate')) {
                errorContent = '⚠️ **Rate Limit Reached** — Please wait a minute and try again.';
            }
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: errorContent,
                timestamp: Date.now(),
            }]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
    };

    // ... (imports remain the same, just re-declaring for context if needed, but assuming they are there)
    // We need to keep the imports. The tool replaces the active block.
    // I will replace the component content.

    // ─── FAB Animation Logic ───
    const getFabBorderColor = () => {
        if (!isLoading) return 'border-gray-200 shadow-sm';

        // Check current agent step
        if (currentAgentSteps.length > 0) {
            const lastStep = currentAgentSteps[currentAgentSteps.length - 1];
            if (lastStep.status === 'flagged') return 'border-red-500 shadow-red-200 shadow-md';

            switch (lastStep.agent) {
                case 'proctor': return 'border-amber-400 ring-2 ring-amber-100 shadow-amber-100 shadow-lg animate-pulse';
                case 'curator': return 'border-blue-400 ring-2 ring-blue-100 shadow-blue-100 shadow-lg animate-pulse';
                case 'tutor': return 'border-emerald-400 ring-2 ring-emerald-100 shadow-emerald-100 shadow-lg animate-pulse';
                default: return 'border-[#2B5797] animate-pulse';
            }
        }
        return 'border-[#9DBFE3] animate-pulse'; // Default loading
    };

    return (
        <div className="flex h-full w-full bg-[#F8F9FA] overflow-hidden font-sans">
            {/* ─── LEFT PANE: Artifacts / Context ─── */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 z-20 hidden md:flex">
                <div className="h-14 border-b border-gray-100 flex items-center px-4 font-bold text-[#212529] text-sm tracking-wide uppercase">
                    Course Artifacts
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* File Manager */}
                    <div className="mb-6">
                        <FileUploadPanel
                            courseId={subject.id}
                            onUploadComplete={(msg) => setSeedStatus(msg)}
                        />
                        {seedStatus && (
                            <div className="mt-2 text-xs text-slate-500 italic">{seedStatus}</div>
                        )}
                    </div>

                    {/* Quiz Trigger (Student Only) */}
                    {userRole === UserRole.STUDENT && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assessments</h3>
                            <button
                                onClick={() => setActiveTab('quiz')}
                                className="w-full py-3 rounded-xl bg-[#2B5797] text-white font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-[#1a3a6e] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <span>⚡</span> Enter Quiz Zone
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── RIGHT PANE: Chat Workspace ─── */}
            <div className="flex-1 flex flex-col relative bg-[#F8F9FA] min-w-0">
                {/* Header */}
                <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        </button>

                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ background: theme.gradient }}>
                            {theme.icon}
                        </div>
                        <div>
                            <h1 className="font-bold text-[#212529] text-base leading-none">{subject.subject_name}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {userRole === UserRole.STUDENT && (
                            <TTSToggle enabled={ttsEnabled} onToggle={() => setTtsEnabled(!ttsEnabled)} />
                        )}
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-gray-100 text-[#6C757D] border border-gray-200">
                            {subject.subject_code}
                        </span>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 pb-32 scroll-smooth" ref={messagesEndRef}>
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={msg.id}>
                                <MessageBubble message={msg} />
                                {msg.role === 'model' && msg.id !== 'welcome' && userRole === UserRole.STUDENT && (
                                    <div className="ml-12 mt-1 flex items-center gap-1">
                                        <button
                                            onClick={() => speakText(msg.content.replace(/[*#_`~]/g, ''))}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-[#2B5797] hover:bg-[#E8F0FE] transition-colors"
                                            title="Read aloud">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                                            Listen
                                        </button>
                                        <button
                                            onClick={() => stopSpeaking()}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Stop speaking">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                                            Stop
                                        </button>
                                    </div>
                                )}
                                {msg.role === 'model' && msg.agentSteps && (
                                    <div className="ml-12 max-w-2xl scale-95 origin-top-left opacity-90">
                                        {/* Optional: Static steps view */}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Live Agent Activity Panel (Loading) */}
                        {isLoading && (
                            <div className="max-w-3xl mx-auto">
                                <AgentActivityPanel steps={currentAgentSteps} isLoading={isLoading} />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* ─── FAB Input Area ─── */}
                <div className="absolute bottom-6 left-0 right-0 px-4 z-20 flex justify-center pointer-events-none">
                    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-gray-200 pointer-events-auto transition-all duration-300 relative group">

                        {/* Status Border Gradient Wrapper */}
                        <div className={`absolute -inset-1 rounded-[26px] bg-gradient-to-r opacity-50 blur-sm transition-all duration-500 ${isLoading
                            ? currentAgentSteps.some(s => s.status === 'flagged') ? 'from-red-300 to-orange-300'
                                : currentAgentSteps.some(s => s.agent === 'proctor') ? 'from-amber-300 to-orange-300'
                                    : currentAgentSteps.some(s => s.agent === 'curator') ? 'from-blue-300 to-cyan-300'
                                        : 'from-green-300 to-emerald-300'
                            : 'opacity-0'
                            }`}></div>

                        <div className={`relative bg-white rounded-2xl flex items-end p-2 border-2 transition-all duration-300 ${getFabBorderColor()}`}>
                            {/* Suggestions (Pop-up) */}
                            {showSuggestions && !isLoading && (
                                <div className="absolute bottom-full mb-4 left-0 w-full flex flex-wrap gap-2 justify-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                                    {QUICK_SUGGESTIONS.slice(0, 3).map((s, i) => (
                                        <button key={i} onClick={() => handleSend(s.text)}
                                            className="bg-white/90 backdrop-blur border border-slate-200 hover:border-[#6B9AD1] shadow-sm rounded-full px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-[#1a3a6e] hover:scale-105 transition-all">
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={adjustTextareaHeight}
                                onKeyDown={handleKeyDown}
                                placeholder={isLoading ? "AI is processing..." : "Ask your tutor anything..."}
                                disabled={isLoading}
                                className="flex-1 max-h-32 min-h-[44px] py-2.5 px-4 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 resize-none font-medium text-sm"
                                rows={1}
                            />

                            <div className="flex items-center gap-1 pb-1">
                                {userRole === UserRole.STUDENT && (
                                    <VoiceButton
                                        onTranscript={(text) => {
                                            setInput(text);
                                            // Auto-send after voice input
                                            setTimeout(() => handleSend(text), 200);
                                        }}
                                        disabled={isLoading}
                                    />
                                )}
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading
                                        ? 'bg-[#2B5797] text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95'
                                        : 'bg-gray-100 text-gray-300'
                                        }`}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quiz Modal Overlay */}
                {activeTab === 'quiz' && (
                    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
                            <button onClick={() => setActiveTab('chat')} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors z-10">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
                                {!activeQuiz && !quizResult && (
                                    <>
                                        <div className="w-20 h-20 bg-[#E8F0FE] text-[#2B5797] rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-inner">⚡</div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Zone</h2>
                                        <p className="text-slate-500 max-w-md mb-8">
                                            Test your knowledge with adaptive quizzes generated from your course materials.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                                            {availableQuizzes.map(q => (
                                                <button key={q.id} onClick={() => startQuiz(q)} className="p-4 rounded-xl border border-gray-200 hover:border-[#2B5797] hover:bg-[#E8F0FE] transition-all text-left group bg-white shadow-sm">
                                                    <h3 className="font-bold text-[#212529] group-hover:text-[#2B5797]">{q.title}</h3>
                                                    <p className="text-xs text-[#6C757D]">{q.difficulty} • {q.num_questions} Questions</p>
                                                </button>
                                            ))}
                                        </div>
                                        {availableQuizzes.length === 0 && !quizLoading && (
                                            <div className="text-slate-400 italic">No quizzes available. Ask your tutor to generate one!</div>
                                        )}
                                        <button
                                            onClick={() => { setActiveQuiz(null); setQuizResult(null); }}
                                            className="w-full mt-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
                                        >← Back to Chat</button>
                                    </>
                                )}

                                {activeQuiz && !quizResult && (
                                    <div className="w-full max-w-2xl text-left animate-fade-in pb-10">
                                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">{activeQuiz.title}</h3>
                                                <p className="text-sm text-slate-400">{activeQuiz.questions.length} Questions</p>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            {activeQuiz.questions.map((q: any, idx: number) => (
                                                <div key={idx} className="space-y-3">
                                                    <p className="font-bold text-slate-800 text-lg">{idx + 1}. {q.question}</p>
                                                    <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                                                        {q.options.map((opt: string) => (
                                                            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${quizAnswers[idx] === opt ? 'bg-[#E8F0FE] border-[#2B5797] ring-1 ring-[#2B5797]' : 'bg-white border-gray-200 hover:bg-gray-50'
                                                                }`}>
                                                                <input
                                                                    type="radio"
                                                                    name={`q-${idx}`}
                                                                    value={opt}
                                                                    checked={quizAnswers[idx] === opt}
                                                                    onChange={() => setQuizAnswers(prev => ({ ...prev, [idx]: opt }))}
                                                                    className="hidden"
                                                                />
                                                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${quizAnswers[idx] === opt ? 'border-[#2B5797] bg-[#2B5797]' : 'border-gray-300'}`}>
                                                                    {quizAnswers[idx] === opt && <span className="w-2 h-2 rounded-full bg-white"></span>}
                                                                </span>
                                                                <span className="text-sm text-slate-700">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur py-4">
                                            <button
                                                onClick={submitQuiz}
                                                disabled={quizSubmitting || Object.keys(quizAnswers).length < activeQuiz.questions.length}
                                                className="w-full py-4 bg-[#2B5797] text-white rounded-xl font-bold shadow-lg hover:bg-[#1a3a6e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {quizSubmitting ? 'Submitting...' : 'Submit Quiz'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {quizResult && (
                                    <div className="text-center animate-fade-in py-8">
                                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">🏆</div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Completed!</h2>
                                        <p className="text-xl text-slate-600 mb-8">You scored <strong className="text-green-600">{quizResult.score}%</strong></p>
                                        <button onClick={() => { setQuizResult(null); setActiveQuiz(null); }} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-all">
                                            Back to Quiz List
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectView;
