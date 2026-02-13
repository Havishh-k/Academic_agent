import React from 'react';
import { AgentStep } from '../types';

interface AgentActivityPanelProps {
    steps: AgentStep[];
    isLoading: boolean;
    retrievedSources?: { source: string; similarity: number }[];
}

const AGENT_META: Record<string, { label: string; icon: string; color: string; activeColor: string }> = {
    proctor: {
        label: 'Proctor Agent',
        icon: '🛡️',
        color: 'text-amber-600',
        activeColor: 'bg-amber-50 border-amber-200',
    },
    curator: {
        label: 'Curator Agent',
        icon: '🔍',
        color: 'text-blue-600',
        activeColor: 'bg-blue-50 border-blue-200',
    },
    tutor: {
        label: 'Adaptive Tutor',
        icon: '🎓',
        color: 'text-green-600',
        activeColor: 'bg-green-50 border-green-200',
    },
};

const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({ steps, isLoading, retrievedSources }) => {
    if (!isLoading && steps.length === 0) return null;

    return (
        <div className="mt-3 mb-4 mx-1 animate-fade-in">
            <div className="bg-white rounded-xl border border-academic-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-4 py-2.5 bg-gradient-to-r from-academic-50 to-white border-b border-academic-100 flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-academic-500">
                            Agent Pipeline
                        </span>
                    </div>
                </div>

                {/* Steps */}
                <div className="p-3 space-y-2">
                    {isLoading && steps.length === 0 ? (
                        // Loading state — show all three agents as pending
                        ['proctor', 'curator', 'tutor'].map((agent, i) => {
                            const meta = AGENT_META[agent];
                            return (
                                <div
                                    key={agent}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border border-academic-100 bg-academic-50/50 transition-all ${i === 0 ? 'opacity-100' : 'opacity-50'
                                        }`}
                                >
                                    <span className="text-lg">{meta.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-academic-700">{meta.label}</p>
                                        <p className="text-[10px] text-academic-400">
                                            {i === 0 ? 'Processing...' : 'Waiting...'}
                                        </p>
                                    </div>
                                    {i === 0 && (
                                        <div className="w-4 h-4 border-2 border-academic-300 border-t-academic-600 rounded-full animate-spin"></div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        steps.map((step, i) => {
                            const meta = AGENT_META[step.agent] || AGENT_META['tutor'];
                            const isFlagged = step.status === 'flagged';

                            return (
                                <div
                                    key={`${step.agent}-${i}`}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all animate-fade-in ${isFlagged
                                            ? 'bg-red-50 border-red-200'
                                            : meta.activeColor
                                        }`}
                                >
                                    <span className="text-lg">{meta.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-semibold ${isFlagged ? 'text-red-700' : meta.color}`}>
                                            {meta.label}
                                        </p>
                                        <p className={`text-[10px] truncate ${isFlagged ? 'text-red-500' : 'text-academic-500'}`}>
                                            {step.status === 'approved' && '✓ Approved — no integrity concerns'}
                                            {step.status === 'flagged' && '⚠ Flagged — providing guided hint instead'}
                                            {step.status === 'generating' && '✓ Generated response'}
                                            {step.status === 'error' && '✗ Error occurred'}
                                            {step.status.startsWith('retrieved') && `✓ ${step.status}`}
                                            {!['approved', 'flagged', 'generating', 'error'].includes(step.status) &&
                                                !step.status.startsWith('retrieved') && step.status}
                                        </p>
                                    </div>
                                    {isFlagged ? (
                                        <span className="shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs">!</span>
                                    ) : (
                                        <span className="shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Retrieved Sources */}
                {retrievedSources && retrievedSources.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-academic-100 bg-academic-50/30">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-academic-400 mb-1.5">
                            Sources Retrieved
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {retrievedSources.map((s, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                    📄 {s.source}
                                    <span className="text-blue-400">({(s.similarity * 100).toFixed(0)}%)</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentActivityPanel;
