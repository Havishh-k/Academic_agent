import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

interface HeatmapData {
    students: string[];
    concepts: string[];
    matrix: number[][];
    color_scale: { low: any; medium: any; high: any };
}

interface AtRiskStudent {
    student_id: string;
    name: string;
    email: string;
    average_mastery: number;
    sessions_count: number;
}

interface DocInfo {
    document: string;
    chunks: number;
    uploaded_at: string;
}

interface TeacherDashboardProps {
    subjects: { id: string; subject_name: string; subject_code: string }[];
    userName: string;
    onLogout: () => void;
    onSelectSubject?: (subject: any) => void;
}

// pdf.js lazy loader for upload
let pdfjsLib: any = null;
async function loadPdfJs() {
    if (!pdfjsLib) {
        // @ts-ignore
        pdfjsLib = await import('https://esm.sh/pdfjs-dist@4.9.155/build/pdf.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs';
    }
    return pdfjsLib;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ subjects, userName, onLogout, onSelectSubject }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'interventions' | 'content' | 'quiz'>('overview');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

    // Sync selectedSubjectId when subjects prop changes (async load)
    useEffect(() => {
        if (subjects.length > 0 && !selectedSubjectId) {
            setSelectedSubjectId(subjects[0].id);
        }
    }, [subjects]);
    const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
    const [interventions, setInterventions] = useState<AtRiskStudent[]>([]);
    const [documents, setDocuments] = useState<DocInfo[]>([]);
    const [threshold, setThreshold] = useState(40);
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [docCount, setDocCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Quiz Manager state
    const [quizTopic, setQuizTopic] = useState('');
    const [quizTitle, setQuizTitle] = useState('');
    const [quizLoading, setQuizLoading] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [quizMsg, setQuizMsg] = useState('');

    // PDF Preview state
    const [previewDoc, setPreviewDoc] = useState<string | null>(null);
    const [previewChunks, setPreviewChunks] = useState<any[]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Load data when tab/subject changes
    useEffect(() => {
        if (!selectedSubjectId) return;
        if (activeTab === 'heatmap') loadHeatmap();
        if (activeTab === 'interventions') loadInterventions();
        if (activeTab === 'content') loadDocuments();
        if (activeTab === 'quiz') loadQuizzes();
    }, [activeTab, selectedSubjectId, threshold]);

    // Load doc count and interventions for overview cards
    useEffect(() => {
        if (!selectedSubjectId) return; // Guard: don't query with empty ID
        loadDocumentCount();
        loadInterventions();
    }, [selectedSubjectId]);

    const loadHeatmap = async () => {
        if (!selectedSubjectId) return;
        setLoading(true);
        try {
            // Try to build heatmap from learning_sessions data in Supabase
            const { data, error } = await supabase
                .from('learning_sessions')
                .select('student_id, mastery_scores, students(full_name)')
                .eq('subject_id', selectedSubjectId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data && data.length > 0) {
                // Group by student, collect concepts
                const studentMap = new Map<string, { name: string; scores: Record<string, number> }>();
                const allConcepts = new Set<string>();

                for (const session of data) {
                    const studentName = (session as any).students?.full_name || session.student_id;
                    if (!studentMap.has(session.student_id)) {
                        studentMap.set(session.student_id, { name: studentName, scores: {} });
                    }
                    if (session.mastery_scores && typeof session.mastery_scores === 'object') {
                        for (const [concept, score] of Object.entries(session.mastery_scores as Record<string, number>)) {
                            allConcepts.add(concept);
                            const existing = studentMap.get(session.student_id)!;
                            existing.scores[concept] = Math.max(existing.scores[concept] || 0, score);
                        }
                    }
                }

                const conceptsList = Array.from(allConcepts);
                const studentNames: string[] = [];
                const matrix: number[][] = [];

                studentMap.forEach((val) => {
                    studentNames.push(val.name);
                    matrix.push(conceptsList.map(c => Math.round(val.scores[c] || 0)));
                });

                setHeatmapData({
                    students: studentNames,
                    concepts: conceptsList,
                    matrix,
                    color_scale: { low: '#EF4444', medium: '#F59E0B', high: '#10B981' }
                });
            } else {
                setHeatmapData(null);
            }
        } catch (e) { console.error('Heatmap load failed', e); }
        setLoading(false);
    };

    const loadInterventions = async () => {
        if (!selectedSubjectId) return;
        setLoading(true);
        try {
            // Get students with low mastery from learning_sessions
            const { data, error } = await supabase
                .from('learning_sessions')
                .select('student_id, mastery_scores, students(full_name, student_id_number, user_id)')
                .eq('subject_id', selectedSubjectId);

            if (!error && data) {
                const studentStats = new Map<string, { name: string; sid: string; email: string; totalMastery: number; count: number; sessions: number }>();

                for (const session of data) {
                    const s = (session as any).students;
                    const name = s?.full_name || 'Unknown';
                    const sid = s?.student_id_number || session.student_id;

                    if (!studentStats.has(session.student_id)) {
                        studentStats.set(session.student_id, { name, sid, email: '', totalMastery: 0, count: 0, sessions: 0 });
                    }

                    const stats = studentStats.get(session.student_id)!;
                    stats.sessions++;

                    if (session.mastery_scores && typeof session.mastery_scores === 'object') {
                        const scores = Object.values(session.mastery_scores as Record<string, number>);
                        if (scores.length > 0) {
                            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                            stats.totalMastery += avg;
                            stats.count++;
                        }
                    }
                }

                const atRisk: AtRiskStudent[] = [];
                studentStats.forEach((stats) => {
                    const avgMastery = stats.count > 0 ? Math.round(stats.totalMastery / stats.count) : 0;
                    if (avgMastery < threshold) {
                        atRisk.push({
                            student_id: stats.sid,
                            name: stats.name,
                            email: stats.email,
                            average_mastery: avgMastery,
                            sessions_count: stats.sessions,
                        });
                    }
                });

                setInterventions(atRisk.sort((a, b) => a.average_mastery - b.average_mastery));
            }
        } catch (e) { console.error('Interventions load failed', e); }
        setLoading(false);
    };

    const loadDocuments = async () => {
        if (!selectedSubjectId) return;
        setLoading(true);
        try {
            // Query knowledge_base grouped by source_document
            const { data, error } = await supabase
                .from('knowledge_base')
                .select('source_document, created_at')
                .eq('course_id', selectedSubjectId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Group by source_document
                const docMap = new Map<string, { chunks: number; uploaded_at: string }>();
                for (const row of data) {
                    const name = row.source_document || 'Unknown';
                    if (!docMap.has(name)) {
                        docMap.set(name, { chunks: 0, uploaded_at: row.created_at });
                    }
                    docMap.get(name)!.chunks++;
                }

                const docs: DocInfo[] = [];
                docMap.forEach((val, key) => {
                    docs.push({ document: key, chunks: val.chunks, uploaded_at: val.uploaded_at });
                });
                setDocuments(docs);
                setDocCount(docs.length);
            }
        } catch (e) { console.error('Documents load failed', e); }
        setLoading(false);
    };

    const loadDocumentCount = async () => {
        if (!selectedSubjectId) return;
        try {
            const { data, error } = await supabase
                .from('knowledge_base')
                .select('source_document')
                .eq('course_id', selectedSubjectId);

            if (!error && data) {
                const uniqueDocs = new Set(data.map(r => r.source_document));
                setDocCount(uniqueDocs.size);
            }
        } catch (e) { /* silent */ }
    };

    const chunkText = (text: string, chunkSize: number = 800): string[] => {
        const chunks: string[] = [];
        const paragraphs = text.split(/\n\s*\n/);
        let currentChunk = '';

        for (const para of paragraphs) {
            if ((currentChunk + '\n\n' + para).length > chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = para;
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + para;
            }
        }
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        return chunks;
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['pdf', 'txt', 'md', 'csv', 'json'].includes(ext || '')) {
            setUploadStatus('❌ Unsupported file type. Use PDF, TXT, MD, CSV, or JSON.');
            return;
        }

        setUploadStatus(`Uploading ${file.name}...`);

        try {
            let text = '';

            if (ext === 'pdf') {
                setUploadStatus('Loading PDF reader...');
                const pdfjs = await loadPdfJs();
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                const totalPages = pdf.numPages;
                const textParts: string[] = [];

                for (let i = 1; i <= totalPages; i++) {
                    setUploadStatus(`Reading PDF page ${i}/${totalPages}...`);
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = content.items.map((item: any) => item.str).join(' ').replace(/\s+/g, ' ').trim();
                    if (pageText) textParts.push(pageText);
                }
                text = textParts.join('\n\n');
            } else {
                text = await file.text();
            }

            if (!text.trim()) {
                setUploadStatus('❌ No text found in file');
                return;
            }

            const chunks = chunkText(text);
            setUploadStatus(`Inserting ${chunks.length} chunks...`);

            let inserted = 0;
            for (let i = 0; i < chunks.length; i++) {
                const { error } = await supabase
                    .from('knowledge_base')
                    .insert({
                        course_id: selectedSubjectId,
                        title: `${file.name} - Part ${i + 1}`,
                        content: chunks[i],
                        source_document: file.name,
                    });
                if (!error) inserted++;
                setUploadStatus(`Inserting chunk ${i + 1}/${chunks.length}...`);
            }

            setUploadStatus(`✅ ${file.name}: ${inserted}/${chunks.length} chunks uploaded`);
            loadDocuments();
        } catch (err) {
            setUploadStatus(`❌ Upload failed: ${err}`);
        }

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (docName: string) => {
        if (!confirm(`Delete "${docName}" and all its chunks?`)) return;
        try {
            const { error } = await supabase
                .from('knowledge_base')
                .delete()
                .eq('course_id', selectedSubjectId)
                .eq('source_document', docName);

            if (!error) {
                setUploadStatus(`✅ Deleted "${docName}"`);
                loadDocuments();
            } else {
                setUploadStatus(`❌ Delete failed: ${error.message}`);
            }
        } catch (e) { console.error('Delete failed', e); }
    };

    const getColor = (score: number) => {
        if (score >= 80) return '#10B981';
        if (score >= 40) return '#F59E0B';
        return '#EF4444';
    };

    const getColorBg = (score: number) => {
        if (score >= 80) return 'rgba(16, 185, 129, 0.15)';
        if (score >= 40) return 'rgba(245, 158, 11, 0.15)';
        return 'rgba(239, 68, 68, 0.15)';
    };

    const loadQuizzes = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/quiz/list/${selectedSubjectId}`);
            if (res.ok) {
                const data = await res.json();
                setQuizzes(data.quizzes || []);
            }
        } catch (e) { console.error('Failed to load quizzes', e); }
    };

    const handleGenerateQuiz = async () => {
        if (!quizTopic.trim()) return;
        setQuizLoading(true);
        setQuizMsg('');
        setGeneratedQuiz(null);
        try {
            // We need the faculty.id — find from subjects
            const { data: fsData } = await supabase
                .from('faculty_subjects')
                .select('faculty_id')
                .eq('subject_id', selectedSubjectId)
                .limit(1);
            const facultyId = fsData?.[0]?.faculty_id || '';

            const res = await fetch('http://localhost:8000/api/quiz/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: quizTopic,
                    subject_id: selectedSubjectId,
                    faculty_id: facultyId,
                    title: quizTitle || `Quiz: ${quizTopic}`,
                    question_count: 10,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setGeneratedQuiz(data);
                setQuizMsg('✅ Quiz generated! Review and publish below.');
                loadQuizzes();
            } else {
                const err = await res.text();
                setQuizMsg(`❌ Generation failed: ${err}`);
            }
        } catch (e: any) {
            setQuizMsg(`❌ Error: ${e.message}`);
        } finally {
            setQuizLoading(false);
        }
    };

    const handlePublishQuiz = async (quizId: string) => {
        try {
            const res = await fetch('http://localhost:8000/api/quiz/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quiz_id: quizId }),
            });
            if (res.ok) {
                setQuizMsg('✅ Quiz published to students!');
                loadQuizzes();
            }
        } catch (e) { console.error(e); }
    };

    const loadPreview = async (docName: string) => {
        setPreviewDoc(docName);
        setPreviewLoading(true);
        try {
            const { data, error } = await supabase
                .from('knowledge_base')
                .select('chunk_index, content, title')
                .eq('course_id', selectedSubjectId)
                .eq('source_document', docName)
                .order('chunk_index', { ascending: true });
            if (!error && data) setPreviewChunks(data);
        } catch (e) { console.error(e); } finally {
            setPreviewLoading(false);
        }
    };

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: '📊' },
        { id: 'heatmap' as const, label: 'Mastery Heatmap', icon: '🗺️' },
        { id: 'interventions' as const, label: 'Interventions', icon: '⚠️' },
        { id: 'content' as const, label: 'Content Manager', icon: '📁' },
        { id: 'quiz' as const, label: 'Quiz Manager', icon: '📝' },
    ];

    // Map overview cards to their corresponding tabs
    const overviewCards = [
        { label: 'Subjects', value: subjects.length, icon: '📚', color: '#8B5CF6', targetTab: null as null | typeof activeTab },
        { label: 'At-Risk Students', value: interventions.length, icon: '⚠️', color: '#EF4444', targetTab: 'interventions' as const },
        { label: 'Documents', value: docCount, icon: '📄', color: '#3B82F6', targetTab: 'content' as const },
        { label: 'Threshold', value: `${threshold}%`, icon: '🎯', color: '#10B981', targetTab: 'interventions' as const },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
            {/* Header */}
            <header style={{
                background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: '#2B5797',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(43,87,151,0.3)'
                        }}>VSIT</div>
                        <div>
                            <h1 style={{ fontWeight: 700, color: '#111827', fontSize: 16, margin: 0 }}>Teacher Portal</h1>
                            <p style={{
                                fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase',
                                letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: 6
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span>
                                {userName} • Faculty
                            </p>
                        </div>
                    </div>

                    {/* Subject selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <select
                            value={selectedSubjectId}
                            onChange={e => setSelectedSubjectId(e.target.value)}
                            style={{
                                padding: '6px 12px', borderRadius: 8, border: '1px solid #D1D5DB',
                                fontSize: 13, fontWeight: 500, background: '#fff'
                            }}
                        >
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_code} — {s.subject_name}</option>)}
                        </select>
                        <button onClick={onLogout} style={{
                            padding: '6px 12px', borderRadius: 8, border: '1px solid #D1D5DB',
                            background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6B7280'
                        }}>Sign Out</button>
                    </div>
                </div>
            </header>

            {/* Tab bar */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 32px 0' }}>
                <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E5E7EB', paddingBottom: 0 }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            style={{
                                padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
                                fontSize: 13, fontWeight: activeTab === t.id ? 600 : 400,
                                color: activeTab === t.id ? '#2B5797' : '#6B7280',
                                borderBottom: activeTab === t.id ? '2px solid #2B5797' : '2px solid transparent',
                                marginBottom: -1, transition: 'all 0.15s'
                            }}
                        >{t.icon} {t.label}</button>
                    ))}
                </div>
            </div>

            {/* Content — scrollable area below the sticky header */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>

                {/* === Overview Tab === */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                        {overviewCards.map(card => (
                            <div
                                key={card.label}
                                onClick={() => card.targetTab && setActiveTab(card.targetTab)}
                                style={{
                                    background: '#fff', borderRadius: 16, padding: 24,
                                    border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    cursor: card.targetTab ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { if (card.targetTab) { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor = card.color; } }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ fontSize: 28 }}>{card.icon}</span>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%', background: card.color
                                    }}></div>
                                </div>
                                <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>{card.value}</p>
                                <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>{card.label}</p>
                                {card.targetTab && (
                                    <p style={{ fontSize: 10, color: card.color, margin: '8px 0 0', fontWeight: 600 }}>
                                        Click to view →
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* === Heatmap Tab === */}
                {activeTab === 'heatmap' && (
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Performance Heatmap</h2>
                                <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Students × Concepts — Normalized 0-100</p>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {[
                                    { label: 'At Risk (<40%)', color: '#EF4444' },
                                    { label: 'Progressing (40-80%)', color: '#F59E0B' },
                                    { label: 'Mastered (>80%)', color: '#10B981' },
                                ].map(l => (
                                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6B7280' }}>
                                        <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color }}></span>
                                        {l.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>Loading heatmap data...</div>
                        ) : heatmapData && heatmapData.students.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '8px 12px', textAlign: 'left', color: '#374151', fontWeight: 600, borderBottom: '2px solid #E5E7EB', position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>Student</th>
                                            {heatmapData.concepts.map(c => (
                                                <th key={c} style={{
                                                    padding: '8px 6px', textAlign: 'center', color: '#374151', fontWeight: 600,
                                                    borderBottom: '2px solid #E5E7EB', maxWidth: 80, overflow: 'hidden',
                                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11
                                                }} title={c}>{c.length > 12 ? c.slice(0, 10) + '…' : c}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {heatmapData.students.map((student, si) => (
                                            <tr key={si}>
                                                <td style={{
                                                    padding: '8px 12px', fontWeight: 500, color: '#111827',
                                                    borderBottom: '1px solid #F3F4F6', position: 'sticky', left: 0,
                                                    background: '#fff', zIndex: 1, whiteSpace: 'nowrap'
                                                }}>{student}</td>
                                                {heatmapData.matrix[si]?.map((score, ci) => (
                                                    <td key={ci} style={{
                                                        padding: '4px', textAlign: 'center', borderBottom: '1px solid #F3F4F6'
                                                    }}>
                                                        <div style={{
                                                            background: getColorBg(score), color: getColor(score),
                                                            fontWeight: 700, borderRadius: 6, padding: '6px 4px',
                                                            fontSize: 12, minWidth: 36
                                                        }}>{score}</div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                                <p style={{ fontSize: 14, fontWeight: 500 }}>No mastery data available yet</p>
                                <p style={{ fontSize: 12 }}>Students will appear here once they start learning sessions</p>
                            </div>
                        )}
                    </div>
                )}

                {/* === Interventions Tab === */}
                {activeTab === 'interventions' && (
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>⚠️ At-Risk Students</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label style={{ fontSize: 12, color: '#6B7280' }}>Threshold:</label>
                                <input type="range" min={10} max={80} value={threshold}
                                    onChange={e => setThreshold(Number(e.target.value))}
                                    style={{ width: 100 }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', minWidth: 32 }}>{threshold}%</span>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading...</div>
                        ) : interventions.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {interventions.map((s, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 16px', borderRadius: 12, border: '1px solid #FEE2E2',
                                        background: 'rgba(239, 68, 68, 0.03)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 10, background: '#FEE2E2',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, fontSize: 14, color: '#EF4444'
                                            }}>{s.name.charAt(0)}</div>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 14, color: '#111827', margin: 0 }}>{s.name}</p>
                                                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{s.student_id} • {s.sessions_count} sessions</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                background: '#FEE2E2', color: '#EF4444', fontWeight: 700,
                                                padding: '4px 10px', borderRadius: 8, fontSize: 13
                                            }}>{s.average_mastery}%</div>
                                            <button onClick={() => alert(`Email alert sent to teacher for ${s.name}`)}
                                                style={{
                                                    padding: '6px 12px', borderRadius: 8, border: '1px solid #D1D5DB',
                                                    background: '#fff', cursor: 'pointer', fontSize: 12, color: '#EF4444', fontWeight: 500
                                                }}>📧 Alert</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#10B981' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                                <p style={{ fontSize: 14, fontWeight: 500 }}>All students above {threshold}% threshold</p>
                            </div>
                        )}
                    </div>
                )}

                {/* === Content Manager Tab === */}
                {activeTab === 'content' && (
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>📁 Course Materials</h2>
                            <label style={{
                                padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,0.3)'
                            }}>
                                📤 Upload File
                                <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.csv,.json" onChange={handleUpload} style={{ display: 'none' }} />
                            </label>
                        </div>

                        {/* Supported formats */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                            {[
                                { ext: 'PDF', color: '#EF4444' },
                                { ext: 'TXT', color: '#3B82F6' },
                                { ext: 'MD', color: '#8B5CF6' },
                                { ext: 'CSV', color: '#10B981' },
                                { ext: 'JSON', color: '#F59E0B' },
                            ].map(f => (
                                <span key={f.ext} style={{
                                    padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                                    background: f.color + '15', color: f.color, border: `1px solid ${f.color}30`
                                }}>.{f.ext}</span>
                            ))}
                        </div>

                        {uploadStatus && (
                            <div style={{
                                padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13,
                                background: uploadStatus.startsWith('✅') ? '#ECFDF5' : uploadStatus.startsWith('❌') ? '#FEF2F2' : '#F3F4F6',
                                color: uploadStatus.startsWith('✅') ? '#065F46' : uploadStatus.startsWith('❌') ? '#991B1B' : '#374151'
                            }}>{uploadStatus}</div>
                        )}

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading...</div>
                        ) : documents.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 320px)', overflowY: 'auto', paddingRight: 4 }}>
                                {documents.map((doc, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB',
                                        transition: 'all 0.15s', cursor: 'pointer',
                                    }}
                                        onClick={() => loadPreview(doc.document)}
                                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F5F3FF'; (e.currentTarget as HTMLDivElement).style.borderColor = '#A78BFA'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: 24 }}>
                                                {doc.document.toLowerCase().endsWith('.pdf') ? '📕' :
                                                    doc.document.toLowerCase().endsWith('.csv') ? '📊' :
                                                        doc.document.toLowerCase().endsWith('.json') ? '🔧' : '📄'}
                                            </span>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 14, color: '#111827', margin: 0 }}>{doc.document}</p>
                                                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{doc.chunks} chunks • {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 500 }}>👁 Preview</span>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.document); }} style={{
                                                padding: '6px 10px', borderRadius: 6, border: '1px solid #FCA5A5',
                                                background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', fontSize: 12
                                            }}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
                                <p style={{ fontSize: 14, fontWeight: 500 }}>No documents uploaded yet</p>
                                <p style={{ fontSize: 12 }}>Upload PDF materials for the AI knowledge base</p>
                            </div>
                        )}
                    </div>
                )}

                {/* === Quiz Manager Tab === */}
                {activeTab === 'quiz' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Generate Section */}
                        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E5E7EB' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>📝 Generate Quiz</h2>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                <input
                                    placeholder="Quiz title (optional)"
                                    value={quizTitle}
                                    onChange={e => setQuizTitle(e.target.value)}
                                    style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                                />
                                <input
                                    placeholder="Topic (e.g., Binary Trees, Insurance)"
                                    value={quizTopic}
                                    onChange={e => setQuizTopic(e.target.value)}
                                    style={{ flex: 2, padding: '10px 14px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                                />
                                <button
                                    onClick={handleGenerateQuiz}
                                    disabled={quizLoading || !quizTopic.trim()}
                                    style={{
                                        padding: '10px 20px', borderRadius: 10, border: 'none',
                                        background: quizLoading ? '#D1D5DB' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                        color: '#fff', fontWeight: 600, fontSize: 13, cursor: quizLoading ? 'not-allowed' : 'pointer',
                                        boxShadow: quizLoading ? 'none' : '0 2px 8px rgba(124,58,237,0.3)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >{quizLoading ? '⏳ Generating...' : '🎯 Generate 10 MCQs'}</button>
                            </div>
                            {quizMsg && (
                                <div style={{
                                    padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 12,
                                    background: quizMsg.startsWith('✅') ? '#ECFDF5' : '#FEF2F2',
                                    color: quizMsg.startsWith('✅') ? '#065F46' : '#991B1B',
                                }}>{quizMsg}</div>
                            )}

                            {/* Preview generated quiz */}
                            {generatedQuiz && generatedQuiz.questions && (
                                <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, maxHeight: 400, overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Preview ({generatedQuiz.questions.length} Questions)</h3>
                                        {generatedQuiz.quiz && !generatedQuiz.quiz.is_published && (
                                            <button onClick={() => handlePublishQuiz(generatedQuiz.quiz.id)} style={{
                                                padding: '8px 16px', borderRadius: 8, border: 'none',
                                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                                color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                                            }}>🚀 Publish to Students</button>
                                        )}
                                    </div>
                                    {generatedQuiz.questions.map((q: any, idx: number) => (
                                        <div key={idx} style={{ padding: '12px 0', borderBottom: idx < generatedQuiz.questions.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
                                                Q{idx + 1}. {q.question}
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, paddingLeft: 16 }}>
                                                {(q.options || []).map((opt: string, oi: number) => (
                                                    <span key={oi} style={{
                                                        fontSize: 12, padding: '4px 8px', borderRadius: 6,
                                                        background: opt === q.correct_answer ? '#ECFDF5' : '#F9FAFB',
                                                        color: opt === q.correct_answer ? '#059669' : '#374151',
                                                        fontWeight: opt === q.correct_answer ? 700 : 400,
                                                        border: opt === q.correct_answer ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                                                    }}>{String.fromCharCode(65 + oi)}) {opt}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Published Quizzes List */}
                        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E5E7EB' }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>📋 Your Quizzes</h2>
                            {quizzes.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
                                    <div style={{ fontSize: 40, marginBottom: 8 }}>📝</div>
                                    <p style={{ fontSize: 13 }}>No quizzes yet. Generate one above!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {quizzes.map((q: any) => (
                                        <div key={q.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB',
                                        }}>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 14, color: '#111827', margin: 0 }}>{q.title}</p>
                                                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>
                                                    Topic: {q.topic} • {(typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions || []).length} Qs • {new Date(q.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                                                    background: q.is_published ? '#ECFDF5' : '#FEF3C7',
                                                    color: q.is_published ? '#059669' : '#D97706',
                                                }}>{q.is_published ? '✅ Published' : '📄 Draft'}</span>
                                                {!q.is_published && (
                                                    <button onClick={() => handlePublishQuiz(q.id)} style={{
                                                        padding: '6px 12px', borderRadius: 8, border: 'none',
                                                        background: '#10B981', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                                                    }}>Publish</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* === PDF Preview Modal === */}
            {previewDoc && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                }} onClick={() => setPreviewDoc(null)}>
                    <div style={{
                        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 720,
                        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                    }} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #E5E7EB',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>📄 {previewDoc}</h2>
                                <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>{previewChunks.length} chunks indexed by Curator Agent</p>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} style={{
                                width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB',
                                background: '#F9FAFB', cursor: 'pointer', fontSize: 16, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                            }}>✕</button>
                        </div>
                        {/* Chunks */}
                        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
                            {previewLoading ? (
                                <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading chunks...</div>
                            ) : previewChunks.map((chunk, i) => (
                                <div key={i} style={{
                                    marginBottom: 16, padding: 16, borderRadius: 12,
                                    border: '1px solid #E5E7EB', background: '#FAFAFA',
                                }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
                                    }}>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700, color: '#7C3AED',
                                            background: '#EDE9FE', padding: '2px 8px', borderRadius: 6,
                                        }}>Chunk #{chunk.chunk_index}</span>
                                        <span style={{ fontSize: 10, color: '#9CA3AF' }}>{chunk.content?.length || 0} chars</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                        {chunk.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
