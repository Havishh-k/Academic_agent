import React, { useState } from 'react';

const FASTAPI_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correct_answer: string;
    difficulty: string;
}

interface QuizZoneProps {
    questions: QuizQuestion[];
    topic: string;
    subjectId: string;
    studentId: string;
    onClose: () => void;
    onComplete?: (score: number) => void;
}

const QuizZone: React.FC<QuizZoneProps> = ({ questions, topic, subjectId, studentId, onClose, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const current = questions[currentIndex];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    const selectAnswer = (questionId: number, answer: string) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const answers = questions.map(q => ({
                question_id: q.id,
                question: q.question,
                correct_answer: q.correct_answer,
                student_answer: selectedAnswers[q.id] || '',
            }));

            const res = await fetch(`${FASTAPI_BASE}/api/quiz/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: studentId,
                    subject_id: subjectId,
                    topic,
                    answers,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                setSubmitted(true);
                onComplete?.(data.score);
            }
        } catch (e) {
            console.error('Quiz submission failed:', e);
        }
        setSubmitting(false);
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return '#10B981';
            case 'B': return '#3B82F6';
            case 'C': return '#F59E0B';
            case 'D': return '#F97316';
            case 'F': return '#EF4444';
            default: return '#6B7280';
        }
    };

    return (
        <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 16
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div>
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>📝 Quiz: {topic}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: '2px 0 0' }}>
                        {submitted ? `Score: ${result?.score}%` : `Question ${currentIndex + 1} of ${totalQuestions}`}
                    </p>
                </div>
                <button onClick={onClose} style={{
                    background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
                    color: '#fff', padding: '6px 10px', cursor: 'pointer', fontSize: 12
                }}>✕ Close</button>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: '#E5E7EB' }}>
                <div style={{
                    height: '100%', background: '#7C3AED', transition: 'width 0.3s',
                    width: submitted ? '100%' : `${((currentIndex + 1) / totalQuestions) * 100}%`
                }}></div>
            </div>

            {!submitted ? (
                /* Question View */
                <div style={{ padding: 20 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 16 }}>
                        {current.question}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {current.options.map((opt, i) => {
                            const isSelected = selectedAnswers[current.id] === opt;
                            return (
                                <button key={i} onClick={() => selectAnswer(current.id, opt)} style={{
                                    textAlign: 'left', padding: '12px 16px', borderRadius: 10,
                                    border: isSelected ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                                    background: isSelected ? 'rgba(124, 58, 237, 0.05)' : '#FAFAFA',
                                    cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: isSelected ? 600 : 400,
                                    transition: 'all 0.15s'
                                }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        width: 24, height: 24, borderRadius: '50%', marginRight: 10,
                                        background: isSelected ? '#7C3AED' : '#E5E7EB',
                                        color: isSelected ? '#fff' : '#6B7280', fontWeight: 700, fontSize: 11
                                    }}>{String.fromCharCode(65 + i)}</span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                        <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                            disabled={currentIndex === 0}
                            style={{
                                padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB',
                                background: '#fff', cursor: currentIndex === 0 ? 'default' : 'pointer',
                                fontSize: 13, opacity: currentIndex === 0 ? 0.4 : 1
                            }}>← Previous</button>
                        <div style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>
                            {answeredCount}/{totalQuestions} answered
                        </div>
                        {currentIndex < totalQuestions - 1 ? (
                            <button onClick={() => setCurrentIndex(p => p + 1)}
                                style={{
                                    padding: '8px 16px', borderRadius: 8, border: 'none',
                                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                    color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600
                                }}>Next →</button>
                        ) : (
                            <button onClick={handleSubmit}
                                disabled={answeredCount < totalQuestions || submitting}
                                style={{
                                    padding: '8px 16px', borderRadius: 8, border: 'none',
                                    background: answeredCount >= totalQuestions ? '#10B981' : '#D1D5DB',
                                    color: '#fff', cursor: answeredCount >= totalQuestions ? 'pointer' : 'default',
                                    fontSize: 13, fontWeight: 600
                                }}>{submitting ? 'Submitting...' : '✓ Submit Quiz'}</button>
                        )}
                    </div>
                </div>
            ) : (
                /* Results View */
                <div style={{ padding: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
                            background: getGradeColor(result.grade) + '15',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: 32, fontWeight: 800, color: getGradeColor(result.grade) }}>
                                {result.grade}
                            </span>
                        </div>
                        <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                            {result.score}%
                        </p>
                        <p style={{ fontSize: 13, color: '#6B7280' }}>{result.message}</p>
                    </div>

                    {/* Per-question results */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                        {result.results?.map((r: any, i: number) => (
                            <div key={i} style={{
                                padding: '10px 14px', borderRadius: 8,
                                border: `1px solid ${r.is_correct ? '#D1FAE5' : '#FEE2E2'}`,
                                background: r.is_correct ? '#ECFDF5' : '#FEF2F2'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span>{r.is_correct ? '✅' : '❌'}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                                        Q{i + 1}: {questions[i]?.question?.slice(0, 60)}...
                                    </span>
                                </div>
                                {r.feedback && <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 28px' }}>{r.feedback}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Weak areas */}
                    {result.weak_areas?.length > 0 && (
                        <div style={{
                            marginTop: 16, padding: '12px 16px', borderRadius: 10,
                            background: '#FFF7ED', border: '1px solid #FFEDD5'
                        }}>
                            <p style={{ fontWeight: 600, fontSize: 13, color: '#EA580C', margin: '0 0 4px' }}>
                                📚 Focus Areas for Improvement
                            </p>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#7C2D12' }}>
                                {result.weak_areas.map((w: string, i: number) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizZone;
