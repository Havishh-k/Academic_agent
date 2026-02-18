import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

// ─── Types ───
interface DashboardStats {
    totalStudents: number;
    totalFaculty: number;
    totalSubjects: number;
    totalDocuments: number;
    recentActivity: any[]; // Knowledge Base
    recentLogs: any[];     // Audit Logs
}

type AdminTab = 'overview' | 'users' | 'subjects' | 'logs';

interface UserRow {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
    prefers_voice?: boolean;
}

interface SubjectRow {
    id: string;
    subject_code: string;
    subject_name: string;
    department: string | null;
    semester: number | null;
    enrolledCount?: number;
    facultyCount?: number;
}

interface LogRow {
    id: string;
    student_id: string;
    message_role: string;
    content: string;
    created_at: string;
    was_flagged: boolean;
    course_id: string;
}

// ─── Main Component ───
const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [stats, setStats] = useState<DashboardStats>({
        totalStudents: 0, totalFaculty: 0, totalSubjects: 0, totalDocuments: 0, recentActivity: [], recentLogs: []
    });
    const [users, setUsers] = useState<UserRow[]>([]);
    const [subjects, setSubjects] = useState<SubjectRow[]>([]);
    const [logs, setLogs] = useState<LogRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [userSearch, setUserSearch] = useState('');
    const [userFilter, setUserFilter] = useState<'all' | 'student' | 'faculty' | 'admin'>('all');

    useEffect(() => {
        fetchStats();
        const subscription = supabase.channel('admin-dashboard')
            .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchStats())
            .subscribe();
        return () => { subscription.unsubscribe(); };
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'subjects') fetchSubjects();
        else if (activeTab === 'logs') fetchLogs();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const [
                { count: students },
                { count: faculty },
                { count: subjectsCount },
                { count: docs },
                { data: recentDocs },
                { data: recentLogs }
            ] = await Promise.all([
                supabase.from('students').select('*', { count: 'exact', head: true }),
                supabase.from('faculty').select('*', { count: 'exact', head: true }),
                supabase.from('subjects').select('*', { count: 'exact', head: true }),
                supabase.from('knowledge_base').select('*', { count: 'exact', head: true }),
                supabase.from('knowledge_base').select('title, created_at, subjects(subject_code)').order('created_at', { ascending: false }).limit(5),
                supabase.from('conversation_logs').select('*').order('created_at', { ascending: false }).limit(5)
            ]);
            setStats({
                totalStudents: students || 0,
                totalFaculty: faculty || 0,
                totalSubjects: subjectsCount || 0,
                totalDocuments: docs || 0,
                recentActivity: recentDocs || [],
                recentLogs: recentLogs || []
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        const { data } = await supabase.from('profiles').select('*').order('role').order('full_name');
        if (data) setUsers(data);
    };

    const fetchSubjects = async () => {
        const { data: subs } = await supabase.from('subjects').select('*').order('subject_code');
        if (!subs) return;

        // Get enrollment counts per subject
        const { data: enrollments } = await supabase.from('student_enrollments').select('subject_id');
        const { data: facSubs } = await supabase.from('faculty_subjects').select('subject_id');

        const enriched: SubjectRow[] = subs.map(s => ({
            ...s,
            enrolledCount: enrollments?.filter(e => e.subject_id === s.id).length || 0,
            facultyCount: facSubs?.filter(f => f.subject_id === s.id).length || 0,
        }));
        setSubjects(enriched);
    };

    const fetchLogs = async () => {
        const { data } = await supabase
            .from('conversation_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        if (data) setLogs(data);
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = !userSearch ||
            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.full_name.toLowerCase().includes(userSearch.toLowerCase());
        const matchFilter = userFilter === 'all' || u.role === userFilter;
        return matchSearch && matchFilter;
    });

    const tabs: { key: AdminTab; label: string; icon: string }[] = [
        { key: 'overview', label: 'Overview', icon: '📊' },
        { key: 'users', label: 'Users', icon: '👥' },
        { key: 'subjects', label: 'Subjects', icon: '📚' },
        { key: 'logs', label: 'Audit Logs', icon: '📋' },
    ];

    return (
        <div className="flex flex-col min-h-full">
            {/* Tab Nav */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-8 flex items-center justify-between">
                <div className="flex gap-1 overflow-x-auto">
                    {tabs.map(t => (
                        <button key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`px-4 py-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === t.key
                                ? 'border-[#2B5797] text-[#2B5797]'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}>
                            <span>{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Live System
                    </div>
                    <button onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 border border-red-200 transition-colors">
                        <span>↪</span> Sign Out
                    </button>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 min-h-0 p-8">
                {activeTab === 'overview' && <OverviewTab stats={stats} loading={loading} onRefresh={fetchStats} onNavigate={setActiveTab} />}
                {activeTab === 'users' && (
                    <UsersTab
                        users={filteredUsers}
                        search={userSearch}
                        onSearchChange={setUserSearch}
                        filter={userFilter}
                        onFilterChange={setUserFilter}
                        totalCounts={{ students: stats.totalStudents, faculty: stats.totalFaculty }}
                        onRefreshUsers={fetchUsers}
                    />
                )}
                {activeTab === 'subjects' && <SubjectsTab subjects={subjects} onRefresh={fetchSubjects} />}
                {activeTab === 'logs' && <LogsTab logs={logs} />}
            </main>
        </div>
    );
};

// ─── Bento Grid Overview ───
const OverviewTab: React.FC<{
    stats: DashboardStats;
    loading: boolean;
    onRefresh: () => void;
    onNavigate: (tab: AdminTab) => void;
}> = ({ stats, loading, onRefresh, onNavigate }) => {
    // Bento Grid Layout
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* HERO: Recent Activity (Col Span 8) */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Recent Proctor Logs</h3>
                            <p className="text-sm text-slate-500">Live system events and academic integrity checks</p>
                        </div>
                        <button onClick={() => onNavigate('logs')} className="text-[#2B5797] hover:text-[#1a3a6e] text-sm font-medium">View All</button>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {stats.recentLogs.length > 0 ? (
                            stats.recentLogs.map((log: any, i) => (
                                <div key={i} className="py-3 flex items-start gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.was_flagged ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-900 truncate font-medium">{log.content.substring(0, 80)}...</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-400 capitalize">{log.message_role}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {log.was_flagged && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">FLAGGED</span>}
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-slate-400">No logs recorded yet.</div>
                        )}
                    </div>
                </div>

                {/* Secondary Hero: Knowledge Uploads */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Knowledge Base Updates</h3>
                        <span className="text-xs text-slate-400">Last 5 Uploads</span>
                    </div>
                    <div className="space-y-3">
                        {stats.recentActivity.map((doc: any, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">📄</span>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                                        <p className="text-xs text-slate-500">{doc.subjects?.subject_code || 'General'}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SIDE: Metrics & Health (Col Span 4) */}
            <div className="lg:col-span-4 space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <BentoMetric title="Students" value={stats.totalStudents} icon="🎓" color="bg-blue-50 text-blue-600" onClick={() => onNavigate('users')} />
                    <BentoMetric title="Faculty" value={stats.totalFaculty} icon="👨‍🏫" color="bg-purple-50 text-[#2B5797]" onClick={() => onNavigate('users')} />
                    <BentoMetric title="Subjects" value={stats.totalSubjects} icon="📚" color="bg-amber-50 text-amber-600" onClick={() => onNavigate('subjects')} />
                    <BentoMetric title="Docs" value={stats.totalDocuments} icon="📄" color="bg-emerald-50 text-emerald-600" onClick={() => onNavigate('subjects')} />
                </div>

                {/* System Health */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 mb-4">System Status</h3>
                    <div className="space-y-4">
                        <StatusItem label="Database" status="Operational" color="green" />
                        <StatusItem label="Auth Service" status="Operational" color="green" />
                        <StatusItem label="AI Engine" status="Standby" color="blue" />
                        <StatusItem label="Vector Store" status="Indexed" color="purple" />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="font-bold mb-2">Admin Actions</h3>
                    <p className="text-slate-400 text-xs mb-4">Manage platform configuration</p>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => onNavigate('users')} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-left px-4 flex items-center gap-2">
                            <span>👥</span> Manage Users
                        </button>
                        <button onClick={() => onNavigate('subjects')} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-left px-4 flex items-center gap-2">
                            <span>📚</span> Manage Subjects
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BentoMetric: React.FC<{ title: string; value: number; icon: string; color: string; onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
    <div onClick={onClick} className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col items-center justify-center text-center transition-all ${onClick ? 'cursor-pointer hover:border-[#9DBFE3] hover:shadow-md' : ''}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 ${color}`}>
            {icon}
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</div>
    </div>
);

// ─── Users Tab ───
const UsersTab: React.FC<{
    users: UserRow[];
    search: string;
    onSearchChange: (s: string) => void;
    filter: 'all' | 'student' | 'faculty' | 'admin';
    onFilterChange: (f: 'all' | 'student' | 'faculty' | 'admin') => void;
    totalCounts: { students: number; faculty: number };
    onRefreshUsers: () => void;
}> = ({ users, search, onSearchChange, filter, onFilterChange, totalCounts, onRefreshUsers }) => {
    const [toastMsg, setToastMsg] = React.useState('');
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<UserRow | null>(null);
    const [actionLoading, setActionLoading] = React.useState(false);

    // ─── Add User Form State ───
    const [newName, setNewName] = React.useState('');
    const [newEmail, setNewEmail] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [newRole, setNewRole] = React.useState<'student' | 'faculty'>('student');
    const [newStudentId, setNewStudentId] = React.useState('');
    const [newFacultyId, setNewFacultyId] = React.useState('');
    const [newDepartment, setNewDepartment] = React.useState('');
    const [newDesignation, setNewDesignation] = React.useState('');
    const [formError, setFormError] = React.useState('');

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 4000);
    };

    const resetForm = () => {
        setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('student');
        setNewStudentId(''); setNewFacultyId(''); setNewDepartment(''); setNewDesignation('');
        setFormError('');
    };

    // ─── Add User ───
    const handleAddUser = async () => {
        if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
            setFormError('Name, email, and password are required.');
            return;
        }
        if (!newEmail.toLowerCase().endsWith('@vsit.edu.in')) {
            setFormError('Only @vsit.edu.in emails are allowed.');
            return;
        }
        if (newPassword.length < 6) {
            setFormError('Password must be at least 6 characters.');
            return;
        }
        setActionLoading(true);
        setFormError('');
        try {
            const metadata: Record<string, any> = { full_name: newName, role: newRole };
            if (newRole === 'student') {
                metadata.student_id = newStudentId;
                metadata.department = newDepartment;
                metadata.year = 1;
                metadata.semester = 1;
            } else {
                metadata.faculty_id = newFacultyId;
                metadata.department = newDepartment;
                metadata.designation = newDesignation;
            }
            const { error } = await supabase.auth.signUp({
                email: newEmail,
                password: newPassword,
                options: { data: metadata },
            });
            if (error) throw error;
            showToast(`✅ User "${newName}" created successfully!`);
            resetForm();
            setShowAddForm(false);
            setTimeout(() => onRefreshUsers(), 1000);
        } catch (err: any) {
            setFormError(err.message || 'Failed to create user.');
        } finally {
            setActionLoading(false);
        }
    };

    // ─── Delete User ───
    const handleDeleteUser = async (user: UserRow) => {
        setActionLoading(true);
        try {
            // Delete role-specific record first
            if (user.role === 'student') {
                await supabase.from('student_enrollments').delete().eq('student_id',
                    (await supabase.from('students').select('id').eq('user_id', user.id).single()).data?.id || ''
                );
                await supabase.from('students').delete().eq('user_id', user.id);
            } else if (user.role === 'faculty') {
                await supabase.from('faculty_subjects').delete().eq('faculty_id',
                    (await supabase.from('faculty').select('id').eq('user_id', user.id).single()).data?.id || ''
                );
                await supabase.from('faculty').delete().eq('user_id', user.id);
            }
            // Delete profile
            const { error } = await supabase.from('profiles').delete().eq('id', user.id);
            if (error) throw error;
            showToast(`🗑️ "${user.full_name}" has been removed.`);
            setDeleteTarget(null);
            onRefreshUsers();
        } catch (err: any) {
            showToast(`❌ Error: ${err.message || 'Failed to delete user.'}`);
        } finally {
            setActionLoading(false);
        }
    };

    // ─── Voice Toggle ───
    const toggleVoiceMode = async (user: UserRow) => {
        const newValue = !user.prefers_voice;
        const { error } = await supabase
            .from('profiles')
            .update({ prefers_voice: newValue })
            .eq('id', user.id);
        if (!error) {
            showToast(`♿ Accessibility updated for ${user.full_name}. ${newValue ? 'Voice-First mode enabled.' : 'Voice-First mode disabled.'}`);
            onRefreshUsers();
        }
    };

    const roleBadge = (role: string) => {
        const styles: Record<string, string> = {
            student: 'bg-blue-50 text-blue-700 border-blue-100',
            faculty: 'bg-purple-50 text-purple-700 border-purple-100',
            admin: 'bg-gray-900 text-white border-gray-900',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[role] || styles.student}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
        );
    };

    return (
        <div>
            {/* Toast */}
            {toastMsg && (
                <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-[#2B5797] text-white text-sm font-semibold shadow-2xl shadow-[#6B9AD1]/40 animate-fade-in">
                    {toastMsg}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🗑️</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center">Remove User</h3>
                        <p className="text-sm text-gray-500 text-center mt-2">
                            Are you sure you want to remove <strong>{deleteTarget.full_name}</strong> ({deleteTarget.email})? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setDeleteTarget(null)} disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDeleteUser(deleteTarget)} disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                                {actionLoading ? 'Removing...' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-500">{totalCounts.students} students • {totalCounts.faculty} faculty</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Filter */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        {(['all', 'student', 'faculty', 'admin'] as const).map(f => (
                            <button key={f}
                                onClick={() => onFilterChange(f)}
                                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${filter === f
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                                    }`}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    {/* Search */}
                    <input type="text" placeholder="Search users..."
                        value={search} onChange={e => onSearchChange(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 w-56"
                    />
                    {/* Add User Button */}
                    <button onClick={() => { setShowAddForm(!showAddForm); resetForm(); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showAddForm
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-[#2B5797] text-white hover:bg-[#1a3a6e] shadow-sm shadow-[#9DBFE3]'
                            }`}>
                        {showAddForm ? '✕ Cancel' : '+ Add User'}
                    </button>
                </div>
            </div>

            {/* Add User Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 animate-fade-in">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Create New User</h3>
                    {formError && (
                        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                            {formError}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name *</label>
                            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5797]/20 focus:border-[#6B9AD1]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
                            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                                placeholder="user@vsit.edu.in"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5797]/20 focus:border-[#6B9AD1]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Password *</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5797]/20 focus:border-[#6B9AD1]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Role *</label>
                            <select value={newRole} onChange={e => setNewRole(e.target.value as 'student' | 'faculty')}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5797]/20 focus:border-[#6B9AD1] bg-white">
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                            </select>
                        </div>
                    </div>

                    {/* Role-specific fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {newRole === 'student' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Student ID</label>
                                    <input type="text" value={newStudentId} onChange={e => setNewStudentId(e.target.value)}
                                        placeholder="e.g. 22IT001"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5797]/20 focus:border-[#6B9AD1]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                                    <input type="text" value={newDepartment} onChange={e => setNewDepartment(e.target.value)}
                                        placeholder="e.g. IT"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5797]/20 focus:border-[#6B9AD1]" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Faculty ID</label>
                                    <input type="text" value={newFacultyId} onChange={e => setNewFacultyId(e.target.value)}
                                        placeholder="e.g. FAC001"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5797]/20 focus:border-[#6B9AD1]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                                    <input type="text" value={newDepartment} onChange={e => setNewDepartment(e.target.value)}
                                        placeholder="e.g. IT"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5797]/20 focus:border-[#6B9AD1]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Designation</label>
                                    <input type="text" value={newDesignation} onChange={e => setNewDesignation(e.target.value)}
                                        placeholder="e.g. Assistant Professor"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5797]/20 focus:border-[#6B9AD1]" />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-5">
                        <button onClick={() => { setShowAddForm(false); resetForm(); }}
                            className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleAddUser} disabled={actionLoading}
                            className="px-6 py-2 rounded-xl text-sm font-semibold bg-[#2B5797] text-white hover:bg-[#1a3a6e] transition-colors shadow-sm disabled:opacity-50">
                            {actionLoading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
                            <th className="text-center px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">♿ Voice</th>
                            <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A7BC5] to-[#2B5797] flex items-center justify-center text-white text-xs font-bold">
                                            {u.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{u.full_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                                <td className="px-6 py-4">{roleBadge(u.role)}</td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {u.role === 'student' ? (
                                        <button
                                            onClick={() => toggleVoiceMode(u)}
                                            title={u.prefers_voice ? 'Disable voice-first mode' : 'Enable voice-first mode'}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${u.prefers_voice
                                                ? 'bg-[#E8F0FE] text-[#1a3a6e] border border-[#9DBFE3] ring-2 ring-[#9DBFE3] shadow-sm'
                                                : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-[#E8F0FE] hover:text-[#2B5797]'
                                                }`}
                                        >
                                            ♿
                                        </button>
                                    ) : (
                                        <span className="text-gray-200">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    {u.role !== 'admin' ? (
                                        <button
                                            onClick={() => setDeleteTarget(u)}
                                            title={`Remove ${u.full_name}`}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-gray-50 text-gray-300 border border-gray-100 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all mx-auto"
                                        >
                                            🗑️
                                        </button>
                                    ) : (
                                        <span className="text-gray-200">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Subjects Tab ───
const SubjectsTab: React.FC<{ subjects: SubjectRow[]; onRefresh: () => Promise<void> }> = ({ subjects, onRefresh }) => {
    const [selected, setSelected] = React.useState<SubjectRow | null>(null);
    const [students, setStudents] = React.useState<any[]>([]);
    const [faculty, setFaculty] = React.useState<any[]>([]);
    const [documents, setDocuments] = React.useState<any[]>([]);
    const [quizzes, setQuizzes] = React.useState<any[]>([]);
    const [previewDoc, setPreviewDoc] = React.useState<string | null>(null);
    const [detailLoading, setDetailLoading] = React.useState(false);
    const [actionMsg, setActionMsg] = React.useState('');

    // Add Subject form state
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [newSubject, setNewSubject] = React.useState({ subject_code: '', subject_name: '', department: 'Computer Science', semester: 3, description: '' });

    // Enroll/Assign dropdowns
    const [allStudents, setAllStudents] = React.useState<any[]>([]);
    const [allFaculty, setAllFaculty] = React.useState<any[]>([]);
    const [enrollStudentId, setEnrollStudentId] = React.useState('');
    const [assignFacultyId, setAssignFacultyId] = React.useState('');

    const flash = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

    const loadSubjectDetail = async (subj: SubjectRow) => {
        setSelected(subj);
        setDetailLoading(true);
        setActionMsg('');
        try {
            const { data: enrollments } = await supabase
                .from('student_enrollments')
                .select('id, student_id, students(id, student_id, department, year, semester, user_id, profiles:user_id(full_name, email))')
                .eq('subject_id', subj.id);
            const mapped = (enrollments || []).map((e: any) => ({
                enrollment_id: e.id,
                ...e.students,
                profile: e.students?.profiles,
            }));
            mapped.sort((a: any, b: any) => (a.student_id || '').localeCompare(b.student_id || ''));
            setStudents(mapped);

            const { data: facs } = await supabase
                .from('faculty_subjects')
                .select('id, faculty_id, faculty(id, faculty_id, department, designation, user_id, profiles:user_id(full_name, email))')
                .eq('subject_id', subj.id);
            setFaculty((facs || []).map((f: any) => ({
                assignment_id: f.id,
                ...f.faculty,
                profile: f.faculty?.profiles,
            })));

            // Load all students & faculty for dropdowns (need .id UUID for FK inserts)
            const { data: allS } = await supabase.from('students').select('id, student_id, user_id, profiles:user_id(full_name, email)').order('student_id');
            setAllStudents((allS || []).map((s: any) => ({ ...s, profile: s.profiles })));
            const { data: allF } = await supabase.from('faculty').select('id, faculty_id, user_id, profiles:user_id(full_name, email)').order('faculty_id');
            setAllFaculty((allF || []).map((f: any) => ({ ...f, profile: f.profiles })));

            // Load documents (knowledge_base) for this subject
            const { data: kbData } = await supabase
                .from('knowledge_base')
                .select('id, source_document, created_at')
                .eq('course_id', subj.id);
            // Aggregate by source_document
            const docMap: Record<string, { name: string; chunks: number; uploaded: string }> = {};
            (kbData || []).forEach((row: any) => {
                const src = row.source_document || 'Unknown';
                if (!docMap[src]) docMap[src] = { name: src, chunks: 0, uploaded: row.created_at };
                docMap[src].chunks += 1;
            });
            setDocuments(Object.values(docMap));

            // Load quizzes for this subject
            const { data: quizData } = await supabase
                .from('quizzes')
                .select('id, title, total_questions, created_at')
                .eq('subject_id', subj.id)
                .order('created_at', { ascending: false });
            setQuizzes(quizData || []);
        } catch (e) {
            console.error('Failed to load subject detail:', e);
        } finally {
            setDetailLoading(false);
        }
    };

    // ── CRUD Actions ──
    const addSubject = async () => {
        if (!newSubject.subject_code || !newSubject.subject_name) return;
        const { error } = await supabase.from('subjects').insert([newSubject]);
        if (error) { flash(`❌ ${error.message}`); return; }
        flash('✅ Subject created!');
        setShowAddForm(false);
        setNewSubject({ subject_code: '', subject_name: '', department: 'Computer Science', semester: 3, description: '' });
        await onRefresh();
    };

    const deleteSubject = async (subj: SubjectRow) => {
        if (!confirm(`Delete ${subj.subject_code} — ${subj.subject_name}? This will also remove all enrollments and faculty assignments.`)) return;
        // Delete associations first
        await supabase.from('student_enrollments').delete().eq('subject_id', subj.id);
        await supabase.from('faculty_subjects').delete().eq('subject_id', subj.id);
        const { error } = await supabase.from('subjects').delete().eq('id', subj.id);
        if (error) { flash(`❌ ${error.message}`); return; }
        flash('✅ Subject deleted');
        setSelected(null);
        await onRefresh();
    };

    const enrollStudent = async () => {
        if (!enrollStudentId || !selected) return;
        // enrollStudentId is the UUID `id` from students table
        const { error } = await supabase.from('student_enrollments').insert([{ student_id: enrollStudentId, subject_id: selected.id }]);
        if (error) { flash(`❌ ${error.message}`); return; }
        flash('✅ Student enrolled!');
        setEnrollStudentId('');
        loadSubjectDetail(selected);
        onRefresh();
    };

    const unenrollStudent = async (enrollmentId: string, name: string) => {
        if (!confirm(`Remove ${name} from this subject?`)) return;
        const { error } = await supabase.from('student_enrollments').delete().eq('id', enrollmentId);
        if (error) { flash(`❌ ${error.message}`); return; }
        flash('✅ Student removed');
        loadSubjectDetail(selected!);
        onRefresh();
    };

    const assignFaculty = async () => {
        if (!assignFacultyId || !selected) return;
        // assignFacultyId is the UUID `id` from faculty table
        const { error } = await supabase.from('faculty_subjects').insert([{ faculty_id: assignFacultyId, subject_id: selected.id }]);
        if (error) { flash(`❌ ${error.message}`); return; }
        flash('✅ Faculty assigned!');
        setAssignFacultyId('');
        loadSubjectDetail(selected);
        onRefresh();
    };

    const removeFaculty = async (assignmentId: string, name: string) => {
        if (!confirm(`Remove ${name} from this subject?`)) return;
        const { error } = await supabase.from('faculty_subjects').delete().eq('id', assignmentId);
        if (error) { flash(`❌ ${error.message}`); return; }
        flash('✅ Faculty removed');
        loadSubjectDetail(selected!);
        onRefresh();
    };

    // ─── Subject Detail Landing Page ───
    if (selected) {
        const enrolledIds = students.map(s => s.id);
        const assignedIds = faculty.map(f => f.id);
        const availableStudents = allStudents.filter(s => !enrolledIds.includes(s.id));
        const availableFaculty = allFaculty.filter(f => !assignedIds.includes(f.id));

        return (
            <div>
                {/* Flash message */}
                {actionMsg && (
                    <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${actionMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {actionMsg}
                    </div>
                )}

                {/* Back + header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setSelected(null)}
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12,19 5,12 12,5" /></svg>
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">{selected.subject_code}</span>
                            <span className="text-xs text-gray-400">Semester {selected.semester || '—'}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{selected.subject_name}</h2>
                        <p className="text-sm text-gray-400">{selected.department || 'Computer Science'}</p>
                    </div>
                    <button onClick={() => deleteSubject(selected)}
                        className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 border border-red-200 transition-colors">
                        🗑 Delete Subject
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
                        <p className="text-3xl font-bold text-blue-600">{students.length}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase mt-1">Students Enrolled</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
                        <p className="text-3xl font-bold text-[#2B5797]">{faculty.length}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase mt-1">Faculty Assigned</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
                        <p className="text-3xl font-bold text-amber-600">{documents.length}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase mt-1">Documents</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
                        <p className="text-3xl font-bold text-emerald-600">{quizzes.length}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase mt-1">Quizzes</p>
                    </div>
                </div>

                {detailLoading ? (
                    <div className="text-center py-12 text-gray-400">Loading details...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Students List */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <span className="text-lg">👨‍🎓</span> Enrolled Students
                                </h3>
                            </div>
                            {/* Enroll new student */}
                            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                <select value={enrollStudentId} onChange={e => setEnrollStudentId(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                                    <option value="">Select student to enroll...</option>
                                    {availableStudents.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.student_id} — {s.profile?.full_name || 'Unknown'} ({s.profile?.email || '—'})
                                        </option>
                                    ))}
                                </select>
                                <button onClick={enrollStudent} disabled={!enrollStudentId}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    + Add
                                </button>
                            </div>
                            <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
                                {students.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-gray-400 text-sm">No students enrolled yet.</div>
                                ) : students.map((s, i) => (
                                    <div key={i} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {(s.profile?.full_name || s.student_id || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{s.student_id} — {s.profile?.full_name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-400 truncate">{s.profile?.email || '—'}</p>
                                        </div>
                                        <button onClick={() => unenrollStudent(s.enrollment_id, s.profile?.full_name || s.student_id)}
                                            className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-md bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-all"
                                            title="Remove student">
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Faculty List */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <span className="text-lg">👩‍🏫</span> Assigned Faculty
                                </h3>
                            </div>
                            {/* Assign new faculty */}
                            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                <select value={assignFacultyId} onChange={e => setAssignFacultyId(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200">
                                    <option value="">Select faculty to assign...</option>
                                    {availableFaculty.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.faculty_id} — {f.profile?.full_name || 'Unknown'} ({f.profile?.email || '—'})
                                        </option>
                                    ))}
                                </select>
                                <button onClick={assignFaculty} disabled={!assignFacultyId}
                                    className="px-4 py-2 rounded-lg bg-[#2B5797] text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    + Add
                                </button>
                            </div>
                            <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
                                {faculty.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-gray-400 text-sm">No faculty assigned yet.</div>
                                ) : faculty.map((f, i) => (
                                    <div key={i} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-[#2B5797] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {(f.profile?.full_name || f.faculty_id || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{f.profile?.full_name || f.faculty_id}</p>
                                            <p className="text-xs text-gray-400 truncate">{f.profile?.email || `ID: ${f.faculty_id}`}</p>
                                        </div>
                                        {f.designation && <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{f.designation}</span>}
                                        <button onClick={() => removeFaculty(f.assignment_id, f.profile?.full_name || f.faculty_id)}
                                            className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-md bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-all"
                                            title="Remove faculty">
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Content (Documents) */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <span className="text-lg">📄</span> Uploaded Documents
                                    <span className="ml-auto text-xs font-medium text-gray-400">{documents.length} files</span>
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
                                {documents.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-gray-400 text-sm">No documents uploaded yet.</div>
                                ) : documents.map((doc, i) => (
                                    <div key={i} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 text-sm shrink-0">📎</div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                                            <p className="text-xs text-gray-400">{doc.chunks} chunks • {new Date(doc.uploaded).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button
                                                onClick={() => setPreviewDoc(previewDoc === doc.name ? null : doc.name)}
                                                className="px-2 py-1 rounded-md bg-blue-50 text-blue-500 text-xs font-semibold hover:bg-blue-100 transition-colors"
                                                title="Preview chunks">
                                                👁
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`Delete "${doc.name}" and all its ${doc.chunks} chunks?`)) return;
                                                    try {
                                                        const res = await fetch(`/api/documents/${encodeURIComponent(doc.name)}?subject_id=${selected!.id}`, { method: 'DELETE' });
                                                        if (res.ok) {
                                                            flash(`✅ Deleted ${doc.name}`);
                                                            setDocuments(documents.filter(d => d.name !== doc.name));
                                                        } else {
                                                            flash(`❌ Failed to delete ${doc.name}`);
                                                        }
                                                    } catch { flash(`❌ Delete request failed`); }
                                                }}
                                                className="px-2 py-1 rounded-md bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors"
                                                title="Delete document">
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Preview panel */}
                            {previewDoc && (
                                <div className="px-6 py-4 bg-slate-50 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-gray-600 uppercase">Preview: {previewDoc}</p>
                                        <button onClick={() => setPreviewDoc(null)} className="text-xs text-gray-400 hover:text-gray-600">✕ Close</button>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-white rounded-lg border border-gray-100 p-3 max-h-40 overflow-y-auto">
                                        {documents.find(d => d.name === previewDoc)?.chunks || 0} chunks indexed from this document. Content is stored as vector embeddings in the knowledge base.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quizzes */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <span className="text-lg">📝</span> Quizzes
                                    <span className="ml-auto text-xs font-medium text-gray-400">{quizzes.length} total</span>
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
                                {quizzes.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-gray-400 text-sm">No quizzes created yet.</div>
                                ) : quizzes.map((q: any, i) => (
                                    <div key={i} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-sm shrink-0">✅</div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{q.title || 'Untitled Quiz'}</p>
                                            <p className="text-xs text-gray-400">{q.total_questions || 0} questions • {new Date(q.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!confirm(`Delete quiz "${q.title || 'Untitled'}"?`)) return;
                                                try {
                                                    const { error } = await supabase.from('quizzes').delete().eq('id', q.id);
                                                    if (!error) {
                                                        flash(`✅ Deleted quiz`);
                                                        setQuizzes(quizzes.filter(qz => qz.id !== q.id));
                                                    } else {
                                                        flash(`❌ Failed: ${error.message}`);
                                                    }
                                                } catch { flash(`❌ Delete request failed`); }
                                            }}
                                            className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-md bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-all"
                                            title="Delete quiz">
                                            🗑
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── Subject Grid (default) ───
    return (
        <div>
            {/* Flash message */}
            {actionMsg && (
                <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${actionMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {actionMsg}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Subject Management</h2>
                    <p className="text-sm text-gray-500">{subjects.length} active subjects</p>
                </div>
                <button onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2">
                    <span className="text-lg leading-none">+</span> Add Subject
                </button>
            </div>

            {/* Add Subject Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">New Subject</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Subject Code *</label>
                            <input type="text" placeholder="e.g. CS301" value={newSubject.subject_code}
                                onChange={e => setNewSubject({ ...newSubject, subject_code: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Subject Name *</label>
                            <input type="text" placeholder="e.g. Machine Learning" value={newSubject.subject_name}
                                onChange={e => setNewSubject({ ...newSubject, subject_name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Department</label>
                            <input type="text" placeholder="e.g. Computer Science" value={newSubject.department}
                                onChange={e => setNewSubject({ ...newSubject, department: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Semester</label>
                            <select value={newSubject.semester} onChange={e => setNewSubject({ ...newSubject, semester: Number(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Description</label>
                            <textarea placeholder="Brief description of the course..." value={newSubject.description} rows={2}
                                onChange={e => setNewSubject({ ...newSubject, description: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button onClick={addSubject} disabled={!newSubject.subject_code || !newSubject.subject_name}
                            className="px-6 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            Create Subject
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(s => (
                    <div key={s.id}
                        onClick={() => loadSubjectDetail(s)}
                        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-amber-200 hover:scale-[1.02] transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                                {s.subject_code}
                            </span>
                            <span className="text-xs text-gray-400">Sem {s.semester || '—'}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-amber-700 transition-colors">{s.subject_name}</h3>
                        <p className="text-xs text-gray-400 mb-4">{s.department || 'No department'}</p>
                        <div className="flex gap-4 pt-3 border-t border-gray-100">
                            <div className="text-center flex-1">
                                <p className="text-lg font-bold text-blue-600">{s.enrolledCount}</p>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Students</p>
                            </div>
                            <div className="text-center flex-1">
                                <p className="text-lg font-bold text-[#2B5797]">{s.facultyCount}</p>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Faculty</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-50 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-amber-600">Click to manage →</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Audit Logs Tab ───
const LogsTab: React.FC<{ logs: LogRow[] }> = ({ logs }) => (
    <div>
        <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Audit Logs</h2>
            <p className="text-sm text-gray-500">Recent conversation activity — {logs.length} entries</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Content</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {logs.map(l => (
                        <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 text-xs text-gray-400 whitespace-nowrap">
                                {new Date(l.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${l.message_role === 'user'
                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                    : l.message_role === 'model'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                    {l.message_role}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700 max-w-md truncate">
                                {l.content.slice(0, 120)}{l.content.length > 120 ? '…' : ''}
                            </td>
                            <td className="px-6 py-3">
                                {l.was_flagged ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">⚠ Flagged</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">Clean</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {logs.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">No conversation logs yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// ─── Shared Components ───
const StatCard: React.FC<{ title: string; value: number; icon: string; color: string; onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
    <div onClick={onClick}
        className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : 'hover:shadow-md'}`}>
        <div className="flex items-center justify-between mb-4">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>
                {icon}
            </span>
            <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
    </div>
);

const StatusItem: React.FC<{ label: string; status: string; color: 'green' | 'blue' | 'yellow' | 'red' | 'purple' }> = ({ label, status, color }) => {
    const colors = {
        green: 'text-green-600 bg-green-50 border-green-100',
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        yellow: 'text-amber-600 bg-amber-50 border-amber-100',
        red: 'text-red-600 bg-red-50 border-red-100',
        purple: 'text-[#2B5797] bg-purple-50 border-purple-100',
    };
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${colors[color]}`}>{status}</span>
        </div>
    );
};

export default AdminDashboard;
