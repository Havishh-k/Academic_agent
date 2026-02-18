import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

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
            className="w-full text-left bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#2B5797]/30 transition-all duration-300 group"
        >
            {/* Accent top bar */}
            <div
                className="h-1.5 w-full"
                style={{ background: theme.gradient }}
            />

            <div className="p-5">
                {/* Icon + Code */}
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ background: theme.gradient }}
                    >
                        <span className="text-2xl">{theme.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 group-hover:text-[#2B5797] transition-colors bg-gray-50 px-2 py-1 rounded-md">
                        {subject.subject_code}
                    </span>
                </div>

                {/* Subject Name */}
                <h3 className="font-bold text-[15px] text-[#212529] mb-1 leading-snug group-hover:text-[#2B5797] transition-colors">
                    {subject.subject_name}
                </h3>

                {/* Description */}
                {subject.description && (
                    <p className="text-xs text-[#6C757D] line-clamp-2 leading-relaxed mb-4">
                        {subject.description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-semibold text-[#ADB5BD] uppercase tracking-wider flex items-center gap-1">
                        <BookOpen size={12} />
                        Sem {subject.semester || '—'}
                    </span>
                    <span className="text-xs font-semibold text-[#2B5797] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                        Open <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </button>
    );
};

export { SUBJECT_COLORS, DEFAULT_THEME };
export type { Subject };
export default SubjectCard;
