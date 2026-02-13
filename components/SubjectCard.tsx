import React from 'react';

interface Subject {
    id: string;
    subject_code: string;
    subject_name: string;
    department: string | null;
    semester: number | null;
    description: string | null;
}

const SUBJECT_COLORS: Record<string, { bg: string; accent: string; icon: string; gradient: string }> = {
    'AI101': { bg: 'from-violet-500 to-purple-700', accent: '#7c3aed', icon: '🤖', gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
    'DS201': { bg: 'from-emerald-500 to-teal-700', accent: '#059669', icon: '🌳', gradient: 'linear-gradient(135deg, #059669, #0d9488)' },
    'OS301': { bg: 'from-orange-500 to-red-600', accent: '#ea580c', icon: '⚙️', gradient: 'linear-gradient(135deg, #ea580c, #dc2626)' },
    'DBMS201': { bg: 'from-blue-500 to-cyan-600', accent: '#2563eb', icon: '🗄️', gradient: 'linear-gradient(135deg, #2563eb, #0891b2)' },
    'DM301': { bg: 'from-rose-500 to-pink-700', accent: '#e11d48', icon: '⛏️', gradient: 'linear-gradient(135deg, #e11d48, #be185d)' },
    'DW301': { bg: 'from-sky-500 to-indigo-600', accent: '#0284c7', icon: '🏗️', gradient: 'linear-gradient(135deg, #0284c7, #4f46e5)' },
    'DAA301': { bg: 'from-amber-500 to-orange-700', accent: '#d97706', icon: '📐', gradient: 'linear-gradient(135deg, #d97706, #c2410c)' },
    'FL301': { bg: 'from-green-500 to-emerald-700', accent: '#16a34a', icon: '💰', gradient: 'linear-gradient(135deg, #16a34a, #047857)' },
    'LA301': { bg: 'from-cyan-500 to-blue-700', accent: '#0891b2', icon: '📊', gradient: 'linear-gradient(135deg, #0891b2, #1d4ed8)' },
};

const DEFAULT_THEME = { bg: 'from-gray-500 to-gray-700', accent: '#6b7280', icon: '📚', gradient: 'linear-gradient(135deg, #6b7280, #4b5563)' };

interface SubjectCardProps {
    subject: Subject;
    onClick: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
    const theme = SUBJECT_COLORS[subject.subject_code] || DEFAULT_THEME;

    return (
        <button
            onClick={onClick}
            className="subject-card group"
            style={{ '--accent': theme.accent } as React.CSSProperties}
        >
            {/* Accent top bar */}
            <div
                className="subject-card-accent"
                style={{ background: theme.gradient }}
            />

            {/* Card body */}
            <div className="subject-card-body">
                {/* Icon + Code */}
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="subject-card-icon"
                        style={{ background: theme.gradient }}
                    >
                        <span className="text-2xl">{theme.icon}</span>
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase opacity-40 group-hover:opacity-60 transition-opacity">
                        {subject.subject_code}
                    </span>
                </div>

                {/* Subject Name */}
                <h3 className="font-bold text-[15px] text-gray-900 mb-1 leading-snug group-hover:text-gray-800 transition-colors">
                    {subject.subject_name}
                </h3>

                {/* Description */}
                {subject.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {subject.description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Sem {subject.semester || '—'}
                    </span>
                    <span className="text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0"
                        style={{ color: theme.accent }}>
                        Open
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </div>
        </button>
    );
};

export { SUBJECT_COLORS, DEFAULT_THEME };
export type { Subject };
export default SubjectCard;
