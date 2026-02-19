import React, { useState, useEffect } from 'react';
import { Subject } from './SubjectCard';
import { NavId } from './AppSidebar';
import { supabase } from '../services/supabaseClient';
import {
    Upload, ClipboardList, BarChart2, Settings,
    BookOpen, FileText, Users, TrendingUp, Plus,
    CheckCircle2, ArrowRight, FolderOpen, Brain, Zap,
    ChevronDown, AlertTriangle, FileUp, Eye,
    Target, GraduationCap, Activity
} from 'lucide-react';

interface TeacherDashboardProps {
    subjects: Subject[];
    userName: string;
    onLogout: () => void;
    onSelectSubject: (s: Subject) => void;
    activeNavId?: NavId;
    onNavClick?: (navId: NavId) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
    subjects,
    userName,
    onLogout,
    onSelectSubject,
    activeNavId = 'dashboard',
    onNavClick,
}) => {
    const nav = (id: NavId) => onNavClick?.(id);

    switch (activeNavId) {
        case 'materials':
            return <FacultyMaterialsPage subjects={subjects} onSelectSubject={onSelectSubject} />;
        case 'quizgen':
            return <FacultyQuizGenPage subjects={subjects} />;
        case 'reports':
            return <FacultyReportsPage subjects={subjects} onNavClick={nav} />;
        case 'settings':
            return <FacultySettingsPage userName={userName} />;
        default:
            return <FacultyOverviewPage subjects={subjects} userName={userName} onSelectSubject={onSelectSubject} onNavClick={nav} />;
    }
};


// ═══════════════════════════════════════════════════════════════
//  FACULTY OVERVIEW (Dashboard)
// ═══════════════════════════════════════════════════════════════
const FacultyOverviewPage: React.FC<{
    subjects: Subject[];
    userName: string;
    onSelectSubject: (s: Subject) => void;
    onNavClick: (id: NavId) => void;
}> = ({ subjects, userName, onSelectSubject, onNavClick }) => {

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-6">
            {/* Portal Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#2B5797] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                            VSIT
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#212529]">Teacher Portal</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs text-[#6C757D] uppercase font-semibold tracking-wide">
                                    {userName.toUpperCase()} • FACULTY
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards — ALL CLICKABLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {[
                    { label: 'Subjects', value: subjects.length, icon: BookOpen, color: '#2B5797', bg: '#E8F0FE', dot: '#2B5797', navTo: 'materials' as NavId },
                    { label: 'At-Risk Students', value: 0, icon: AlertTriangle, color: '#FF9800', bg: '#FFF3E0', dot: '#D13438', navTo: 'reports' as NavId },
                    { label: 'Documents', value: 0, icon: FileText, color: '#6264A7', bg: '#F3E5F5', dot: '#6264A7', navTo: 'materials' as NavId },
                    { label: 'Threshold', value: '40%', icon: Target, color: '#4CAF50', bg: '#E8F5E9', dot: '#4CAF50', navTo: 'settings' as NavId },
                ].map((stat, i) => (
                    <button
                        key={i}
                        onClick={() => onNavClick(stat.navTo)}
                        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-[#2B5797]/30 transition-all text-left group active:scale-[0.98]"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: stat.bg }}>
                                <stat.icon size={22} style={{ color: stat.color }} />
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.dot }} />
                        </div>
                        <p className="text-3xl font-bold text-[#212529] mb-1">{stat.value}</p>
                        <p className="text-xs font-medium text-[#6C757D]">{stat.label}</p>
                        <p className="text-[11px] font-semibold text-[#2B5797] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view →
                        </p>
                    </button>
                ))}
            </div>

            {/* My Subjects — ALL CLICKABLE */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#212529]">My Subjects</h3>
                    <button
                        onClick={() => onNavClick('materials')}
                        className="text-xs text-[#2B5797] font-semibold hover:underline"
                    >
                        View All Subjects
                    </button>
                </div>
                {subjects.length === 0 ? (
                    <button
                        onClick={() => onNavClick('materials')}
                        className="w-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm hover:border-[#2B5797]/40 hover:shadow-md transition-all active:scale-[0.99]"
                    >
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={24} className="text-gray-400" />
                        </div>
                        <h4 className="text-base font-bold text-[#212529] mb-1">No Subjects Assigned</h4>
                        <p className="text-sm text-[#6C757D]">Contact admin to get subjects assigned to your profile.</p>
                    </button>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {subjects.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => onSelectSubject(sub)}
                                className="group bg-white rounded-xl border border-gray-200 hover:border-[#2B5797]/40 hover:shadow-lg p-5 text-left transition-all duration-200 active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                                        {sub.subject_code?.slice(0, 3) || '—'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[#212529] text-sm group-hover:text-[#2B5797] transition-colors truncate">{sub.subject_name}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold">{sub.subject_code}</p>
                                    </div>
                                    <ChevronDown size={16} className="text-gray-300 group-hover:text-[#2B5797] transform -rotate-90 transition-all" />
                                </div>
                                <p className="text-xs text-[#6C757D]">{sub.description || 'Manage materials and view student performance.'}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Activity — ALL CLICKABLE */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#212529]">Recent Activity</h3>
                    <button
                        onClick={() => onNavClick('reports')}
                        className="text-xs text-[#2B5797] font-semibold hover:underline"
                    >
                        View Reports
                    </button>
                </div>
                <div className="space-y-3">
                    {[
                        { text: 'New material uploaded to Linear Algebra', time: '2 hours ago', icon: Upload, iconBg: '#E8F0FE', iconColor: '#2B5797', navTo: 'materials' as NavId },
                        { text: 'Quiz generated for Machine Learning Module 3', time: '5 hours ago', icon: ClipboardList, iconBg: '#F3E5F5', iconColor: '#6264A7', navTo: 'quizgen' as NavId },
                        { text: '3 students completed the latest quiz', time: '1 day ago', icon: CheckCircle2, iconBg: '#E8F5E9', iconColor: '#4CAF50', navTo: 'reports' as NavId },
                    ].map((activity, i) => (
                        <button
                            key={i}
                            onClick={() => onNavClick(activity.navTo)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-[#2B5797]/20 transition-all text-left group active:scale-[0.99]"
                        >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: activity.iconBg }}>
                                <activity.icon size={16} style={{ color: activity.iconColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#212529] truncate">{activity.text}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{activity.time}</p>
                            </div>
                            <ArrowRight size={14} className="text-gray-200 group-hover:text-[#2B5797] shrink-0 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
//  MATERIALS — REAL DATA
// ═══════════════════════════════════════════════════════════════
interface FacDoc {
    source_document: string;
    chunk_count: number;
}

const FacultyMaterialsPage: React.FC<{
    subjects: Subject[];
    onSelectSubject: (s: Subject) => void;
}> = ({ subjects, onSelectSubject }) => {
    const [docsMap, setDocsMap] = useState<Record<string, FacDoc[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
    const [previewDoc, setPreviewDoc] = useState<{ name: string; courseId: string } | null>(null);
    const [previewContent, setPreviewContent] = useState<string[]>([]);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Fetch documents for faculty's subjects
    useEffect(() => {
        if (subjects.length === 0) { setLoading(false); return; }
        const fetchDocs = async () => {
            setLoading(true);
            try {
                const subjectIds = subjects.map(s => s.id);
                const { data, error } = await supabase
                    .from('knowledge_base')
                    .select('course_id, source_document')
                    .in('course_id', subjectIds);

                if (!error && data) {
                    const map: Record<string, Record<string, number>> = {};
                    data.forEach((row: any) => {
                        if (!row.course_id || !row.source_document) return;
                        if (!map[row.course_id]) map[row.course_id] = {};
                        map[row.course_id][row.source_document] = (map[row.course_id][row.source_document] || 0) + 1;
                    });
                    const result: Record<string, FacDoc[]> = {};
                    Object.entries(map).forEach(([cid, docs]) => {
                        result[cid] = Object.entries(docs).map(([name, count]) => ({
                            source_document: name,
                            chunk_count: count,
                        }));
                    });
                    setDocsMap(result);
                }
            } catch (e) {
                console.error('Failed to load docs:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [subjects]);

    const openPreview = async (courseId: string, docName: string) => {
        setPreviewDoc({ name: docName, courseId });
        setLoadingPreview(true);
        setPreviewContent([]);
        try {
            const { data, error } = await supabase
                .from('knowledge_base')
                .select('title, content')
                .eq('course_id', courseId)
                .eq('source_document', docName)
                .order('title');
            if (!error && data) setPreviewContent(data.map((d: any) => d.content));
        } catch (e) {
            console.error('Failed to load preview:', e);
        } finally {
            setLoadingPreview(false);
        }
    };

    const totalDocs = Object.values(docsMap).reduce((a, b) => a + b.length, 0);

    return (
        <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center">
                            <Upload size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#212529]">Course Materials</h2>
                            <p className="text-xs text-[#6C757D] mt-0.5">
                                {loading ? 'Loading...' : `${subjects.length} subjects · ${totalDocs} uploaded documents`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject Folders with Documents */}
            <h3 className="font-bold text-[#212529] mb-4">Subject Folders</h3>

            {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
                    <div className="w-8 h-8 border-3 border-[#2B5797] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Loading materials...</p>
                </div>
            ) : subjects.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <FolderOpen size={32} className="text-gray-300 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-[#212529] mb-1">No Subjects Available</h4>
                    <p className="text-sm text-[#6C757D]">You need assigned subjects to upload materials.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {subjects.map(sub => {
                        const docs = docsMap[sub.id] || [];
                        const isExpanded = expandedSubject === sub.id;

                        return (
                            <div key={sub.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-[#2B5797]/20 transition-all">
                                {/* Subject Header */}
                                <button
                                    onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}
                                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                        <FolderOpen size={22} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-[#212529] text-sm">{sub.subject_name}</h4>
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full uppercase">{sub.subject_code}</span>
                                        </div>
                                        <span className="text-xs text-[#6C757D] flex items-center gap-1 mt-1">
                                            <FileText size={12} />
                                            {docs.length} {docs.length === 1 ? 'file' : 'files'} uploaded
                                        </span>
                                    </div>
                                    <ArrowRight size={16} className={`text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </button>

                                {/* Expanded Documents */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 bg-gray-50/30">
                                        {docs.length === 0 ? (
                                            <div className="px-6 py-8 text-center">
                                                <FileText size={24} className="text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-400">No documents uploaded yet</p>
                                                <button
                                                    onClick={() => onSelectSubject(sub)}
                                                    className="mt-3 px-4 py-2 bg-[#2B5797] text-white rounded-lg text-xs font-semibold hover:bg-[#1e3f6e] transition-colors"
                                                >
                                                    <Upload size={14} className="inline mr-1" /> Upload Materials
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100">
                                                {docs.map((doc, j) => {
                                                    const isPDF = doc.source_document.toLowerCase().endsWith('.pdf');
                                                    return (
                                                        <button
                                                            key={j}
                                                            onClick={() => openPreview(sub.id, doc.source_document)}
                                                            className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-white transition-colors text-left group"
                                                        >
                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isPDF ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                                                }`}>
                                                                <FileText size={16} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-[#212529] truncate group-hover:text-[#2B5797] transition-colors">
                                                                    {doc.source_document}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                                    {doc.chunk_count} {doc.chunk_count === 1 ? 'chunk' : 'chunks'} indexed
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 uppercase">Preview</span>
                                                                <Eye size={14} className="text-gray-300 group-hover:text-[#2B5797] transition-colors" />
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary */}
            {!loading && subjects.length > 0 && (
                <div className="mt-6 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{subjects.length} subjects</span>
                    <span className="text-xs text-gray-400">{totalDocs} total documents</span>
                </div>
            )}

            {/* Document Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${previewDoc.name.toLowerCase().endsWith('.pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                    }`}>
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#212529] text-sm">{previewDoc.name}</h3>
                                    <p className="text-[10px] text-gray-400">{loadingPreview ? 'Loading...' : `${previewContent.length} chunks`}</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {loadingPreview ? (
                                <div className="text-center py-12">
                                    <div className="w-8 h-8 border-3 border-[#2B5797] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-sm text-gray-400">Loading document content...</p>
                                </div>
                            ) : previewContent.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText size={24} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No content found for this document</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {previewContent.map((chunk, i) => (
                                        <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Chunk {i + 1}</span>
                                            <p className="text-sm text-[#212529] leading-relaxed whitespace-pre-wrap">{chunk}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
//  QUIZ GENERATOR
// ═══════════════════════════════════════════════════════════════
const FASTAPI_BASE = 'http://localhost:8000';

interface QuizQuestion {
    question: string;
    options?: string[];
    correct_answer: string;
    explanation?: string;
}

interface GeneratedQuiz {
    id?: string;
    title: string;
    topic: string;
    questions: QuizQuestion[];
    created_at?: string;
    is_published?: boolean;
}

const FacultyQuizGenPage: React.FC<{ subjects: Subject[] }> = ({ subjects }) => {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [questionCount, setQuestionCount] = useState('10');
    const [difficulty, setDifficulty] = useState('medium');
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['MCQ']);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
    const [recentQuizzes, setRecentQuizzes] = useState<GeneratedQuiz[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(false);

    // Fetch recent quizzes when subject changes
    useEffect(() => {
        if (!selectedSubject) {
            setRecentQuizzes([]);
            return;
        }
        const fetchRecent = async () => {
            setLoadingRecent(true);
            try {
                const res = await fetch(`${FASTAPI_BASE}/api/quiz/list/${selectedSubject}`);
                if (res.ok) {
                    const data = await res.json();
                    setRecentQuizzes(data.quizzes || []);
                }
            } catch {
                // Backend may not be running — silently ignore
            } finally {
                setLoadingRecent(false);
            }
        };
        fetchRecent();
    }, [selectedSubject]);

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleGenerate = async () => {
        if (!selectedSubject) { setError('Please select a subject'); return; }
        const subjectName = subjects.find(s => s.id === selectedSubject)?.subject_name || '';
        const quizTopic = topic.trim() || subjectName;

        setGenerating(true);
        setError(null);
        setGeneratedQuiz(null);

        try {
            // Get current user's faculty id
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setError('Not authenticated'); setGenerating(false); return; }

            const { data: faculty } = await supabase
                .from('faculty')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!faculty) { setError('Faculty record not found'); setGenerating(false); return; }

            const res = await fetch(`${FASTAPI_BASE}/api/quiz/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: quizTopic,
                    subject_id: selectedSubject,
                    faculty_id: faculty.id,
                    question_count: parseInt(questionCount),
                    title: `${subjectName} — ${quizTopic} (${difficulty})`,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || `Server error ${res.status}`);
            }

            const data = await res.json();
            setGeneratedQuiz({
                id: data.quiz?.id,
                title: data.quiz?.title || quizTopic,
                topic: quizTopic,
                questions: data.questions || [],
                created_at: data.quiz?.created_at,
                is_published: data.quiz?.is_published ?? false,
            });

            // Refresh recent quizzes
            try {
                const listRes = await fetch(`${FASTAPI_BASE}/api/quiz/list/${selectedSubject}`);
                if (listRes.ok) {
                    const listData = await listRes.json();
                    setRecentQuizzes(listData.quizzes || []);
                }
            } catch { /* ignore */ }
        } catch (e: any) {
            setError(e.message || 'Failed to generate quiz. Is the backend server running?');
        } finally {
            setGenerating(false);
        }
    };

    const handlePublish = async (quizId: string) => {
        try {
            const res = await fetch(`${FASTAPI_BASE}/api/quiz/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quiz_id: quizId }),
            });
            if (res.ok) {
                setRecentQuizzes(prev => prev.map(q =>
                    q.id === quizId ? { ...q, is_published: true } : q
                ));
                if (generatedQuiz?.id === quizId) {
                    setGeneratedQuiz(prev => prev ? { ...prev, is_published: true } : null);
                }
            }
        } catch { /* ignore */ }
    };

    return (
        <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2B5797] to-[#6264A7] text-white flex items-center justify-center">
                        <Brain size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#212529]">AI Quiz Generator</h2>
                        <p className="text-xs text-[#6C757D] mt-0.5">Generate smart quizzes from your uploaded course materials</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Generator Form */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-bold text-[#212529] mb-5">Create New Quiz</h3>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Select Subject</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => { setSelectedSubject(e.target.value); setGeneratedQuiz(null); }}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#212529] outline-none focus:border-[#2B5797] focus:ring-2 focus:ring-[#2B5797]/10 transition-all cursor-pointer"
                            >
                                <option value="">Choose a subject...</option>
                                {subjects.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.subject_name} ({sub.subject_code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Topic (optional)</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Neural Networks, Sorting Algorithms..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#212529] outline-none focus:border-[#2B5797] focus:ring-2 focus:ring-[#2B5797]/10 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Questions</label>
                                <select
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#212529] outline-none focus:border-[#2B5797] transition-all cursor-pointer"
                                >
                                    {['5', '10', '15', '20', '25'].map(n => (
                                        <option key={n} value={n}>{n} Questions</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Difficulty</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#212529] outline-none focus:border-[#2B5797] transition-all cursor-pointer"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Question Types</label>
                            <div className="flex flex-wrap gap-2">
                                {['MCQ', 'True/False', 'Short Answer', 'Fill in Blanks'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => toggleType(type)}
                                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all active:scale-[0.96] ${selectedTypes.includes(type)
                                            ? 'border-[#2B5797] text-[#2B5797] bg-[#E8F0FE]'
                                            : 'border-gray-200 text-[#495057] hover:border-[#2B5797] hover:text-[#2B5797] hover:bg-[#E8F0FE]'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={generating || !selectedSubject}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2B5797] text-white rounded-xl text-sm font-bold hover:bg-[#1e3f6e] transition-colors shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <><Zap size={18} /> Generate Quiz</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Recent Quizzes */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-bold text-[#212529] mb-4">Recent Quizzes</h3>
                    {loadingRecent ? (
                        <div className="text-center py-10">
                            <div className="w-6 h-6 border-2 border-[#2B5797]/30 border-t-[#2B5797] rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-xs text-[#6C757D]">Loading...</p>
                        </div>
                    ) : recentQuizzes.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                <ClipboardList size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-[#212529] mb-1">No Quizzes Yet</p>
                            <p className="text-xs text-[#6C757D]">Generated quizzes will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {recentQuizzes.map((q, i) => (
                                <div key={q.id || i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-sm font-semibold text-[#212529] truncate">{q.title}</p>
                                    <p className="text-xs text-[#6C757D] mt-0.5">{q.questions?.length || 0} questions • {q.topic}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.is_published
                                            ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {q.is_published ? '✓ Published' : 'Draft'}
                                        </span>
                                        {!q.is_published && q.id && (
                                            <button
                                                onClick={() => handlePublish(q.id!)}
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F0FE] text-[#2B5797] hover:bg-[#2B5797] hover:text-white transition-colors"
                                            >
                                                Publish
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Generated Quiz Preview */}
            {generatedQuiz && generatedQuiz.questions.length > 0 && (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="font-bold text-[#212529]">📝 {generatedQuiz.title}</h3>
                            <p className="text-xs text-[#6C757D] mt-0.5">{generatedQuiz.questions.length} questions generated</p>
                        </div>
                        {generatedQuiz.id && !generatedQuiz.is_published && (
                            <button
                                onClick={() => handlePublish(generatedQuiz.id!)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                            >
                                ✓ Publish to Students
                            </button>
                        )}
                        {generatedQuiz.is_published && (
                            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold">✓ Published</span>
                        )}
                    </div>

                    <div className="space-y-4">
                        {generatedQuiz.questions.map((q, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-sm font-semibold text-[#212529] mb-2">
                                    <span className="text-[#2B5797] mr-2">Q{idx + 1}.</span>{q.question}
                                </p>
                                {q.options && q.options.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                        {q.options.map((opt, oi) => (
                                            <div
                                                key={oi}
                                                className={`text-xs px-3 py-2 rounded-lg border ${opt === q.correct_answer || q.correct_answer === String.fromCharCode(65 + oi)
                                                    ? 'bg-green-50 border-green-300 text-green-800 font-semibold'
                                                    : 'bg-white border-gray-200 text-[#495057]'
                                                    }`}
                                            >
                                                <span className="font-bold mr-1">{String.fromCharCode(65 + oi)}.</span> {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-green-700 mt-1"><span className="font-bold">Answer:</span> {q.correct_answer}</p>
                                {q.explanation && (
                                    <p className="text-xs text-[#6C757D] mt-1 italic">💡 {q.explanation}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
//  STUDENT REPORTS
// ═══════════════════════════════════════════════════════════════
const FacultyReportsPage: React.FC<{ subjects: Subject[]; onNavClick: (id: NavId) => void }> = ({ subjects, onNavClick }) => (
    <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-6">
        {/* Page Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#4CAF50] flex items-center justify-center">
                    <BarChart2 size={22} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#212529]">Student Reports</h2>
                    <p className="text-xs text-[#6C757D] mt-0.5">Performance analytics and engagement metrics across your subjects</p>
                </div>
            </div>
        </div>

        {/* Summary Cards — ALL CLICKABLE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {[
                { label: 'Total Students', value: '—', icon: Users, color: '#2B5797', bg: '#E8F0FE' },
                { label: 'Avg. Quiz Score', value: '—', icon: TrendingUp, color: '#4CAF50', bg: '#E8F5E9', navTo: 'quizgen' as NavId },
                { label: 'Active This Week', value: '—', icon: Activity, color: '#FF9800', bg: '#FFF3E0' },
                { label: 'At-Risk', value: '0', icon: AlertTriangle, color: '#D13438', bg: '#FDECEA' },
            ].map((stat, i) => (
                <button
                    key={i}
                    onClick={() => stat.navTo && onNavClick(stat.navTo)}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-[#2B5797]/30 transition-all text-left group active:scale-[0.98]"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: stat.bg }}>
                            <stat.icon size={18} style={{ color: stat.color }} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#212529]">{stat.value}</p>
                    <p className="text-xs font-medium text-[#6C757D] mt-1">{stat.label}</p>
                </button>
            ))}
        </div>

        {/* Per-Subject Reports — ALL CLICKABLE */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#212529] text-lg">Subject-wise Performance</h3>
                <button className="text-xs text-[#2B5797] font-semibold hover:underline">Export Report</button>
            </div>
            {subjects.length === 0 ? (
                <button
                    onClick={() => onNavClick('materials')}
                    className="w-full text-center py-12 hover:bg-gray-50 rounded-xl transition-colors"
                >
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <BarChart2 size={24} className="text-gray-400" />
                    </div>
                    <p className="font-bold text-[#212529] mb-1">No Reports Available</p>
                    <p className="text-sm text-[#6C757D]">Reports will appear once students start engaging with your subjects.</p>
                </button>
            ) : (
                <div className="space-y-3">
                    {subjects.map(sub => (
                        <button
                            key={sub.id}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#2B5797]/20 hover:bg-gray-50 transition-all text-left group active:scale-[0.99]"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                                {sub.subject_code?.slice(0, 3) || '—'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#212529] text-sm">{sub.subject_name}</p>
                                <p className="text-[10px] text-gray-400">{sub.subject_code} • Sem {sub.semester || '—'}</p>
                            </div>
                            <div className="hidden sm:block flex-1 max-w-[160px]">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#2B5797] to-[#6264A7] rounded-full" style={{ width: '0%' }} />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">0% completion</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold text-[#2B5797] opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                View <ArrowRight size={14} />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    </div>
);


// ═══════════════════════════════════════════════════════════════
//  FACULTY SETTINGS
// ═══════════════════════════════════════════════════════════════
const FacultySettingsPage: React.FC<{ userName: string }> = ({ userName }) => (
    <div className="max-w-[800px] mx-auto w-full px-4 lg:px-8 py-6">
        {/* Page Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                    <Settings size={22} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#212529]">Settings</h2>
                    <p className="text-xs text-[#6C757D] mt-0.5">Manage your profile and teaching preferences</p>
                </div>
            </div>
        </div>

        <div className="space-y-5">
            {/* Profile */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-[#212529] mb-5 flex items-center gap-2">
                    <GraduationCap size={18} className="text-[#2B5797]" /> Profile Information
                </h3>
                <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-[#E8F0FE] text-[#2B5797] font-bold text-lg flex items-center justify-center border-2 border-white shadow-md">
                        {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                        <p className="text-lg font-bold text-[#212529]">{userName}</p>
                        <p className="text-sm text-[#6C757D]">Faculty Member</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-[#212529] font-medium border border-gray-100">{userName}</div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Role</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-[#212529] font-medium capitalize border border-gray-100">Faculty</div>
                    </div>
                </div>
            </div>

            {/* Preferences — ALL CLICKABLE toggles */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-[#212529] mb-5">Teaching Preferences</h3>
                <div className="space-y-3">
                    {[
                        { label: 'Email Notifications', desc: 'Receive updates about student activity', enabled: true },
                        { label: 'Auto Summaries', desc: 'AI generates summaries after material upload', enabled: true },
                        { label: 'Quiz Auto-grading', desc: 'Automatically grade MCQ and T/F quizzes', enabled: false },
                    ].map((pref, i) => (
                        <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#2B5797]/20 transition-all text-left active:scale-[0.99]">
                            <div>
                                <p className="text-sm font-semibold text-[#212529]">{pref.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
                            </div>
                            <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${pref.enabled ? 'bg-[#2B5797]' : 'bg-gray-200'}`}>
                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${pref.enabled ? 'right-0.5' : 'left-0.5'}`} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

        </div>
    </div>
);

export default TeacherDashboard;
