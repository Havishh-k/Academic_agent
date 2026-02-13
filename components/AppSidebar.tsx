import React, { useState } from 'react';
import { UserRole } from '../types';

interface AppSidebarProps {
    userRole: UserRole;
    subjects: any[];
    onNavigate: (view: 'home' | 'admin' | 'subject', data?: any) => void;
    activeView: 'home' | 'admin' | 'subject';
    onSignOut: () => void;
    userProfile: { full_name: string; email: string };
}

const AppSidebar: React.FC<AppSidebarProps> = ({ userRole, subjects, onNavigate, activeView, onSignOut, userProfile }) => {
    const [expandedSemester, setExpandedSemester] = useState<number | null>(null);

    // Group subjects by semester
    const subjectsBySem = subjects.reduce((acc, s) => {
        const sem = s.semester || 0;
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push(s);
        return acc;
    }, {} as Record<number, any[]>);

    const sortedSems = Object.keys(subjectsBySem).map(Number).sort((a, b) => b - a);

    return (
        <div className="flex h-screen bg-slate-900 text-white shrink-0 transition-all duration-300">
            {/* 1. Icon Rail (Fixed Width) */}
            <div className="w-[68px] flex flex-col items-center py-6 border-r border-slate-800 bg-slate-950 z-20">
                {/* Brand */}
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-lg mb-8 shadow-lg shadow-violet-900/20">
                    AI
                </div>

                {/* Nav Icons */}
                <div className="flex flex-col gap-4 w-full px-3">
                    <button onClick={() => onNavigate('home')}
                        className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${activeView === 'home' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                        title="Home">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </button>

                    {userRole === UserRole.ADMIN && (
                        <button onClick={() => onNavigate('admin')}
                            className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${activeView === 'admin' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                            title="Admin Portal">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                        </button>
                    )}
                </div>

                {/* User Profile (Bottom) */}
                <div className="mt-auto flex flex-col gap-4 w-full px-3">
                    <div className="w-full aspect-square rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold ring-2 ring-slate-900 cursor-help" title={userProfile.full_name}>
                        {userProfile.full_name.charAt(0)}
                    </div>
                </div>
            </div>

            {/* 2. Collapsible Panel (Subject List) */}
            <div className="w-64 bg-slate-900 flex flex-col border-r border-slate-800">
                <div className="p-5 border-b border-slate-800/50">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Workspace</h2>
                    <p className="text-lg font-bold text-white tracking-tight">Academic Agent</p>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                    {sortedSems.map(sem => (
                        <div key={sem} className="mb-2">
                            <button
                                onClick={() => setExpandedSemester(expandedSemester === sem ? null : sem)}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors group">
                                <span className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">S{sem}</span>
                                    Semester {sem}
                                </span>
                                <svg className={`w-4 h-4 text-slate-500 transition-transform ${expandedSemester === sem ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                            </button>

                            {/* Subjects List */}
                            {expandedSemester === sem && (
                                <div className="mt-1 ml-3 pl-3 border-l border-slate-700 space-y-0.5">
                                    {subjectsBySem[sem].map(subj => (
                                        <button key={subj.id}
                                            onClick={() => onNavigate('subject', subj)}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-md transition-all flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50"></span>
                                            <span className="truncate">{subj.subject_code}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {sortedSems.length === 0 && (
                        <div className="text-slate-500 text-sm px-4 py-8 text-center italic">
                            No subjects enrolled.
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={onSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors font-semibold">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppSidebar;
