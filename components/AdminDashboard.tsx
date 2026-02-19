import React, { useState, useEffect } from 'react';
import { NavId } from './AppSidebar';
import { supabase } from '../services/supabaseClient';
import {
    Users, BookOpen, FileText, BarChart2, Settings,
    Shield, Database, Cpu, Activity, Search,
    TrendingUp, Clock, AlertCircle, CheckCircle2, Plus,
    Eye, Mail, MoreHorizontal, ArrowRight,
    GraduationCap, UserCheck, Volume2, Mic, FolderOpen,
    ClipboardList, Hash, Calendar, Filter, Trash2, ChevronDown,
    KeyRound, EyeOff
} from 'lucide-react';

interface AdminDashboardProps {
    onLogout: () => void;
    activeNavId?: NavId;
    onNavClick?: (navId: NavId) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, activeNavId = 'dashboard', onNavClick }) => {
    const nav = (id: NavId) => onNavClick?.(id);

    switch (activeNavId) {
        case 'users':
            return <AdminUsersPage />;
        case 'subjects':
            return <AdminSubjectsPage />;
        case 'audit-logs':
            return <AdminAuditLogsPage />;
        case 'analytics':
            return <AdminAnalyticsPage onNavClick={nav} />;
        case 'settings':
            return <AdminSettingsPage />;
        default:
            return <AdminOverviewPage onNavClick={nav} />;
    }
};


// ═══════════════════════════════════════════════════════════════
//  ADMIN OVERVIEW
// ═══════════════════════════════════════════════════════════════
const AdminOverviewPage: React.FC<{ onNavClick: (id: NavId) => void }> = ({ onNavClick }) => {
    const [stats, setStats] = useState({ students: 0, faculty: 0, subjects: 0, documents: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [studentsRes, facultyRes, subjectsRes, docsRes] = await Promise.all([
                    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
                    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'faculty'),
                    supabase.from('subjects').select('id', { count: 'exact', head: true }),
                    supabase.from('knowledge_base').select('id', { count: 'exact', head: true }),
                ]);
                setStats({
                    students: studentsRes.count || 0,
                    faculty: facultyRes.count || 0,
                    subjects: subjectsRes.count || 0,
                    documents: docsRes.count || 0,
                });
            } catch (e) {
                console.error('Failed to fetch stats:', e);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Students', value: String(stats.students), icon: GraduationCap, color: '#2B5797', bg: '#E8F0FE', dot: '#2B5797', navTo: 'users' as NavId },
        { label: 'Faculty', value: String(stats.faculty), icon: Users, color: '#4CAF50', bg: '#E8F5E9', dot: '#4CAF50', navTo: 'users' as NavId },
        { label: 'Subjects', value: String(stats.subjects), icon: BookOpen, color: '#FF9800', bg: '#FFF3E0', dot: '#FF9800', navTo: 'subjects' as NavId },
        { label: 'Documents', value: String(stats.documents), icon: FileText, color: '#6264A7', bg: '#F3E5F5', dot: '#6264A7', navTo: 'subjects' as NavId },
    ];

    return (
        <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-6">
            {/* Portal Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#2B5797] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                            VSIT
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#212529]">Admin Dashboard</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs text-[#6C757D] font-medium">Live System</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid — ALL CLICKABLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {statCards.map((stat, i) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Proctor Logs */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-[#212529] text-lg">Recent Proctor Logs</h3>
                        <button
                            onClick={() => onNavClick('audit-logs')}
                            className="text-xs text-[#2B5797] font-semibold hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {[
                            { text: "Create a lesson plan outline for 'Week 4: Programming Basics'...", role: 'User', time: '18:47:26', color: '#2B5797' },
                            { text: "**Lesson Plan Outline: Week 4 – Programming Basics** Based on the lecture notes...", role: 'Model', time: '18:47:26', color: '#4CAF50' },
                            { text: "I couldn't find relevant materials in the knowledge base regarding the types of ...", role: 'Model', time: '18:17:01', color: '#4CAF50' },
                            { text: "explain me the types of ml...", role: 'User', time: '18:17:01', color: '#2B5797' },
                            { text: "According to the 'Chap-1_Introduction_to_ML.pdf' document, Machine Learning (ML)...", role: 'Model', time: '18:06:16', color: '#4CAF50' },
                        ].map((log, i) => (
                            <button key={i} onClick={() => onNavClick('audit-logs')} className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group">
                                <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: log.color }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[#212529] truncate">{log.text}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {log.role} • 12/02/2026, {log.time}
                                    </p>
                                </div>
                                <ArrowRight size={14} className="text-gray-200 group-hover:text-[#2B5797] mt-1 shrink-0 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* System Status + Admin Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-bold text-[#212529] mb-4">System Status</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Database', status: 'Operational', color: '#4CAF50' },
                                { label: 'Auth Service', status: 'Operational', color: '#4CAF50' },
                                { label: 'AI Engine', status: 'Standby', color: '#FF9800' },
                                { label: 'Vector Store', status: 'Indexed', color: '#2B5797' },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => onNavClick('settings')}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#2B5797]/20 transition-all text-left"
                                >
                                    <span className="text-sm font-medium text-[#212529]">{item.label}</span>
                                    <span
                                        className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                                        style={{ color: item.color, backgroundColor: `${item.color}15` }}
                                    >
                                        {item.status}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Admin Quick Actions */}
                    <div className="rounded-xl p-5 bg-gradient-to-br from-[#1a3a6e] to-[#2B5797] text-white shadow-lg">
                        <h4 className="font-bold text-sm mb-1">Admin Actions</h4>
                        <p className="text-[10px] text-white/60 mb-4">Manage platform configuration</p>
                        <button
                            onClick={() => onNavClick('users')}
                            className="w-full flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors border border-white/10 backdrop-blur-sm active:scale-[0.98]"
                        >
                            <Users size={16} /> Manage Users
                        </button>
                    </div>
                </div>
            </div>

            {/* Knowledge Base */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#212529] text-lg">Knowledge Base Updates</h3>
                    <span className="text-xs text-gray-400 font-medium">Last 5 Uploads</span>
                </div>
                <div className="space-y-3">
                    {[
                        { name: 'LA_Module_II.pdf - Part 4', code: 'LA301', date: '13/02/2026' },
                        { name: 'LA_Module_II.pdf - Part 3', code: 'LA301', date: '13/02/2026' },
                        { name: 'Chap-1_Introduction_to_ML.pdf', code: 'ML201', date: '12/02/2026' },
                    ].map((doc, i) => (
                        <button
                            key={i}
                            onClick={() => onNavClick('analytics')}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#2B5797]/20 transition-all text-left group active:scale-[0.99]"
                        >
                            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                <FileText size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#212529] truncate">{doc.name}</p>
                                <p className="text-[10px] text-gray-400">{doc.code}</p>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">{doc.date}</span>
                            <ArrowRight size={14} className="text-gray-200 group-hover:text-[#2B5797] shrink-0 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
//  USER MANAGEMENT — SYNCED WITH SUPABASE
// ═══════════════════════════════════════════════════════════════

interface UserRecord {
    id: string;
    email: string;
    full_name: string;
    role: string; // 'student' | 'faculty' | 'admin'
    prefers_voice: boolean;
    created_at: string;
}

const AdminUsersPage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewUser, setViewUser] = useState<UserRecord | null>(null);
    const [moreUser, setMoreUser] = useState<string | null>(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [addForm, setAddForm] = useState({ name: '', email: '', role: 'student', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    // Fetch all users from Supabase profiles table
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, role, prefers_voice, created_at')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setUsers(data || []);
        } catch (e) {
            console.error('Failed to fetch users:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Display helpers
    const roleLabel = (r: string) => r === 'admin' ? 'Admin' : r === 'faculty' ? 'Faculty' : 'Student';
    const filterMap: Record<string, string> = { 'All': '', 'Students': 'student', 'Faculty': 'faculty', 'Admins': 'admin' };

    const filteredUsers = users.filter(u => {
        const matchesRole = activeFilter === 'All' || u.role === filterMap[activeFilter];
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        return matchesRole && matchesSearch;
    });

    const handleToggleVoiceMode = async (user: UserRecord) => {
        const newVal = !user.prefers_voice;
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, prefers_voice: newVal } : u));
        setMoreUser(null);
        try {
            const { error } = await supabase.from('profiles').update({ prefers_voice: newVal }).eq('id', user.id);
            if (error) throw error;
        } catch (e) {
            console.error('Failed to toggle voice mode:', e);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, prefers_voice: !newVal } : u));
        }
    };

    const handleAddUser = async () => {
        if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) return;
        if (addForm.password.length < 6) {
            setAddError('Password must be at least 6 characters.');
            return;
        }
        setAddLoading(true);
        setAddError('');
        try {
            // Call backend API to create auth user with password
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const res = await fetch(`${backendUrl}/api/admin/create-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: addForm.email.trim(),
                    password: addForm.password,
                    full_name: addForm.name.trim(),
                    role: addForm.role,
                }),
            });
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.detail || 'Failed to create user');
            }

            setAddForm({ name: '', email: '', role: 'student', password: '' });
            setShowAddUser(false);
            await fetchUsers();
        } catch (e: any) {
            console.error('Failed to add user:', e);
            setAddError(e?.message || 'Failed to create user. Please try again.');
        } finally {
            setAddLoading(false);
        }
    };

    const handleResetPassword = async (user: UserRecord) => {
        setMoreUser(null);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const res = await fetch(`${backendUrl}/api/admin/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, redirect_to: `${window.location.origin}/login` }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.detail || 'Failed to send reset email');
            alert(`Password reset email sent to ${user.email}`);
        } catch (e: any) {
            console.error('Failed to send reset password:', e);
            alert(e?.message || 'Failed to send password reset email.');
        }
    };

    const handleDeleteUser = async (user: UserRecord) => {
        if (!confirm(`Are you sure you want to remove ${user.full_name}?`)) return;
        setMoreUser(null);
        try {
            // Remove from role-specific table first
            if (user.role === 'student') {
                await supabase.from('students').delete().eq('user_id', user.id);
            } else if (user.role === 'faculty') {
                await supabase.from('faculty').delete().eq('user_id', user.id);
            }
            // Remove from profiles
            const { error } = await supabase.from('profiles').delete().eq('id', user.id);
            if (error) throw error;
            setUsers(prev => prev.filter(u => u.id !== user.id));
        } catch (e) {
            console.error('Failed to delete user:', e);
            alert('Failed to delete user. They may have related data that needs to be removed first.');
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return '—'; }
    };

    return (
        <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center">
                            <Users size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#212529]">User Management</h2>
                            <p className="text-xs text-[#6C757D] mt-0.5">Manage students, faculty, and administrators</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setShowAddUser(true); setAddError(''); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#2B5797] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3f6e] transition-colors shadow-sm active:scale-[0.98]"
                    >
                        <Plus size={16} /> Add User
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                        <Search size={16} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users by name, email, or ID..."
                            className="bg-transparent text-sm text-[#212529] placeholder:text-gray-400 outline-none w-full"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 text-xs font-bold">✕</button>
                        )}
                    </div>
                    <div className="flex gap-1.5">
                        {['All', 'Students', 'Faculty', 'Admins'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter
                                    ? 'bg-[#E8F0FE] text-[#2B5797] shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-[#212529]'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-200">
                                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="text-center px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="w-6 h-6 border-2 border-[#2B5797] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-sm text-gray-400">Loading users...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Search size={24} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-[#212529]">No users found</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {searchQuery ? `No results for "${searchQuery}"` : `No ${activeFilter.toLowerCase()} to display`}
                                        </p>
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-50 text-purple-600'
                                                : user.role === 'faculty' ? 'bg-green-50 text-green-600'
                                                    : 'bg-[#E8F0FE] text-[#2B5797]'
                                                }`}>
                                                {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-[#212529]">{user.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#6C757D] hidden sm:table-cell">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${user.role === 'admin' ? 'bg-purple-50 text-purple-600'
                                            : user.role === 'faculty' ? 'bg-green-50 text-green-600'
                                                : 'bg-blue-50 text-[#2B5797]'
                                            }`}>
                                            {roleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-gray-500">{formatDate(user.created_at)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 relative">
                                            <button
                                                onClick={() => setViewUser(user)}
                                                className="p-1.5 text-gray-400 hover:text-[#2B5797] hover:bg-[#E8F0FE] rounded-lg transition-all" title="View Details"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                                                className="p-1.5 text-gray-400 hover:text-[#2B5797] hover:bg-[#E8F0FE] rounded-lg transition-all" title="Send Email"
                                            >
                                                <Mail size={14} />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setMoreUser(moreUser === user.id ? null : user.id)}
                                                    className="p-1.5 text-gray-400 hover:text-[#D13438] hover:bg-red-50 rounded-lg transition-all" title="More Actions"
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>
                                                {moreUser === user.id && (
                                                    <div className="absolute right-0 top-8 z-50 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 animate-in fade-in">
                                                        <button
                                                            onClick={() => { setViewUser(user); setMoreUser(null); }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#212529] hover:bg-gray-50 transition-colors text-left"
                                                        >
                                                            <Eye size={14} className="text-gray-400" /> View Profile
                                                        </button>
                                                        {user.role === 'student' && (
                                                            <button
                                                                onClick={() => handleToggleVoiceMode(user)}
                                                                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${user.prefers_voice
                                                                    ? 'text-[#2B5797] hover:bg-[#E8F0FE] font-medium'
                                                                    : 'text-[#212529] hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                <Volume2 size={14} className={user.prefers_voice ? 'text-[#2B5797]' : 'text-gray-400'} />
                                                                {user.prefers_voice ? '🔊 Voice Mode ON' : 'Enable Voice Mode'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleResetPassword(user)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#212529] hover:bg-gray-50 transition-colors text-left"
                                                        >
                                                            <KeyRound size={14} className="text-gray-400" /> Reset Password
                                                        </button>
                                                        <div className="border-t border-gray-100 my-1" />
                                                        <button
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#D13438] hover:bg-red-50 transition-colors text-left"
                                                        >
                                                            <AlertCircle size={14} /> Remove User
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Showing {filteredUsers.length} of {users.length} users</span>
                    <button onClick={fetchUsers} className="text-xs text-[#2B5797] font-semibold hover:underline">↻ Refresh</button>
                </div>
            </div>

            {/* ── View User Modal ── */}
            {viewUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewUser(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[#1a3a6e] to-[#2B5797] p-6 text-white">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full font-bold text-lg flex items-center justify-center border-2 border-white/30 ${viewUser.role === 'admin' ? 'bg-purple-500'
                                    : viewUser.role === 'faculty' ? 'bg-green-500'
                                        : 'bg-white/20'
                                    }`}>
                                    {viewUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{viewUser.full_name}</h3>
                                    <p className="text-white/70 text-sm">{viewUser.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { label: 'Role', value: roleLabel(viewUser.role) },
                                { label: 'Email', value: viewUser.email },
                                { label: 'Joined', value: formatDate(viewUser.created_at) },
                                { label: 'Voice Mode', value: viewUser.prefers_voice ? '🔊 Enabled' : 'Disabled' },
                            ].map((field, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{field.label}</span>
                                    <span className="text-sm font-medium text-[#212529]">{field.value}</span>
                                </div>
                            ))}
                            <button
                                onClick={() => { window.open(`mailto:${viewUser.email}`, '_blank'); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E8F0FE] text-[#2B5797] rounded-xl text-sm font-semibold hover:bg-[#d5e3f7] transition-colors"
                            >
                                <Mail size={16} /> Send Email
                            </button>
                        </div>
                        <div className="px-6 pb-6">
                            <button
                                onClick={() => setViewUser(null)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-[#6C757D] hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add User Modal ── */}
            {showAddUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddUser(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-[#212529]">Add New User</h3>
                            <p className="text-xs text-[#6C757D] mt-1">Create a new profile for a student, faculty, or admin</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {addError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                    <AlertCircle size={14} /> {addError}
                                </div>
                            )}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    value={addForm.name}
                                    onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Enter full name..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#212529] outline-none focus:border-[#2B5797] focus:ring-2 focus:ring-[#2B5797]/10 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                                <input
                                    type="email"
                                    value={addForm.email}
                                    onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="Enter email address..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#212529] outline-none focus:border-[#2B5797] focus:ring-2 focus:ring-[#2B5797]/10 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={addForm.password}
                                        onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="Set initial password (min 6 chars)..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#212529] outline-none focus:border-[#2B5797] focus:ring-2 focus:ring-[#2B5797]/10 transition-all pr-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2B5797] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">User can reset their password later from the login page</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Role</label>
                                <div className="flex gap-2">
                                    {[{ value: 'student', label: 'Student' }, { value: 'faculty', label: 'Faculty' }, { value: 'admin', label: 'Admin' }].map(r => (
                                        <button
                                            key={r.value}
                                            onClick={() => setAddForm(f => ({ ...f, role: r.value }))}
                                            className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${addForm.role === r.value
                                                ? 'bg-[#E8F0FE] text-[#2B5797] border-[#2B5797]/30'
                                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => setShowAddUser(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-[#6C757D] hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim() || addForm.password.length < 6 || addLoading}
                                className="flex-1 px-4 py-2.5 bg-[#2B5797] text-white rounded-xl text-sm font-semibold hover:bg-[#1e3f6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addLoading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Close dropdown on outside click */}
            {moreUser !== null && (
                <div className="fixed inset-0 z-40" onClick={() => setMoreUser(null)} />
            )}
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
//  ANALYTICS — REAL DATA
// ═══════════════════════════════════════════════════════════════
const AdminAnalyticsPage: React.FC<{ onNavClick: (id: NavId) => void }> = ({ onNavClick }) => {
    const [loading, setLoading] = useState(true);
    const [userCounts, setUserCounts] = useState({ student: 0, faculty: 0, admin: 0, total: 0 });
    const [subjectStats, setSubjectStats] = useState<{ id: string; name: string; code: string; docs: number; chunks: number }[]>([]);
    const [totalChunks, setTotalChunks] = useState(0);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalSubjects, setTotalSubjects] = useState(0);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                // 1. User counts by role
                const { data: profiles } = await supabase.from('profiles').select('role');
                if (profiles) {
                    const counts = { student: 0, faculty: 0, admin: 0, total: profiles.length };
                    profiles.forEach((p: any) => {
                        if (p.role === 'student') counts.student++;
                        else if (p.role === 'faculty') counts.faculty++;
                        else if (p.role === 'admin') counts.admin++;
                    });
                    setUserCounts(counts);
                }

                // 2. All subjects
                const { data: subjects } = await supabase.from('subjects').select('id, subject_name, subject_code').order('subject_name');

                // 3. Knowledge base data
                const { data: kbData } = await supabase.from('knowledge_base').select('course_id, source_document');

                if (subjects && kbData) {
                    setTotalSubjects(subjects.length);

                    // Count docs and chunks per subject
                    const docsPerSubject: Record<string, Set<string>> = {};
                    const chunksPerSubject: Record<string, number> = {};
                    let allDocs = new Set<string>();

                    kbData.forEach((row: any) => {
                        if (!row.course_id || !row.source_document) return;
                        if (!docsPerSubject[row.course_id]) docsPerSubject[row.course_id] = new Set();
                        docsPerSubject[row.course_id].add(row.source_document);
                        chunksPerSubject[row.course_id] = (chunksPerSubject[row.course_id] || 0) + 1;
                        allDocs.add(`${row.course_id}::${row.source_document}`);
                    });

                    setTotalChunks(kbData.length);
                    setTotalDocs(allDocs.size);

                    const stats = subjects.map((s: any) => ({
                        id: s.id,
                        name: s.subject_name,
                        code: s.subject_code,
                        docs: docsPerSubject[s.id]?.size || 0,
                        chunks: chunksPerSubject[s.id] || 0,
                    }));

                    // Sort by chunks descending (most content first)
                    stats.sort((a: any, b: any) => b.chunks - a.chunks);
                    setSubjectStats(stats);
                }
            } catch (e) {
                console.error('Analytics fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // Donut chart proportions
    const circumference = 2 * Math.PI * 14; // ~87.96
    const studentArc = userCounts.total > 0 ? (userCounts.student / userCounts.total) * circumference : 0;
    const facultyArc = userCounts.total > 0 ? (userCounts.faculty / userCounts.total) * circumference : 0;
    const adminArc = userCounts.total > 0 ? (userCounts.admin / userCounts.total) * circumference : 0;

    const maxChunks = subjectStats.length > 0 ? Math.max(...subjectStats.map(s => s.chunks), 1) : 1;

    // Compute knowledge coverage: subjects with at least 1 doc / total subjects
    const subjectsWithDocs = subjectStats.filter(s => s.docs > 0).length;
    const knowledgePct = totalSubjects > 0 ? Math.round((subjectsWithDocs / totalSubjects) * 100) : 0;

    return (
        <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#FFF3E0] text-[#FF9800] flex items-center justify-center">
                        <BarChart2 size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#212529]">Analytics</h2>
                        <p className="text-xs text-[#6C757D] mt-0.5">
                            {loading ? 'Loading analytics...' : 'System-wide usage statistics and insights'}
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 shadow-sm text-center">
                    <div className="w-8 h-8 border-3 border-[#2B5797] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Loading analytics data...</p>
                </div>
            ) : (
                <>
                    {/* Metrics — real data */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                        {[
                            { label: 'Total Chunks', value: totalChunks.toLocaleString(), icon: Database, color: '#2B5797', bg: '#E8F0FE' },
                            { label: 'Total Users', value: userCounts.total.toString(), icon: UserCheck, color: '#4CAF50', bg: '#E8F5E9', navTo: 'users' as NavId },
                            { label: 'Uploaded Docs', value: totalDocs.toString(), icon: FileText, color: '#FF9800', bg: '#FFF3E0', navTo: 'subjects' as NavId },
                            { label: 'Knowledge', value: `${knowledgePct}%`, icon: CheckCircle2, color: '#6264A7', bg: '#F3E5F5', navTo: 'subjects' as NavId },
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

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Content Distribution Bar Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-bold text-[#212529] mb-4">Content Distribution (Chunks per Subject)</h3>
                            {subjectStats.length === 0 ? (
                                <div className="h-52 flex items-center justify-center">
                                    <p className="text-sm text-gray-400">No data available</p>
                                </div>
                            ) : (
                                <div className="h-52 flex items-end gap-2 px-2">
                                    {subjectStats.slice(0, 7).map((sub, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${sub.name}: ${sub.chunks} chunks`}>
                                            <div
                                                className="w-full bg-gradient-to-t from-[#2B5797] to-[#6264A7] rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group"
                                                style={{ height: `${Math.max((sub.chunks / maxChunks) * 100, 4)}%` }}
                                            >
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#212529] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {sub.chunks}
                                                </div>
                                            </div>
                                            <span className="text-[8px] text-gray-400 font-medium truncate w-full text-center" title={sub.code}>
                                                {sub.code.length > 5 ? sub.code.slice(0, 5) : sub.code}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* User Distribution Donut — real data */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-bold text-[#212529] mb-4">User Distribution</h3>
                            <div className="flex items-center justify-center h-52">
                                <div className="relative w-40 h-40">
                                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#E8F0FE" strokeWidth="4" />
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#2B5797" strokeWidth="4"
                                            strokeDasharray={`${studentArc} ${circumference - studentArc}`} strokeLinecap="round" />
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#4CAF50" strokeWidth="4"
                                            strokeDasharray={`${facultyArc} ${circumference - facultyArc}`}
                                            strokeDashoffset={`${-studentArc}`} strokeLinecap="round" />
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#6264A7" strokeWidth="4"
                                            strokeDasharray={`${adminArc} ${circumference - adminArc}`}
                                            strokeDashoffset={`${-(studentArc + facultyArc)}`} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <p className="text-xl font-bold text-[#212529]">{userCounts.total}</p>
                                        <p className="text-[9px] text-gray-400">Total</p>
                                    </div>
                                </div>
                                <div className="ml-6 space-y-3">
                                    {[
                                        { label: 'Students', value: userCounts.student, color: '#2B5797' },
                                        { label: 'Faculty', value: userCounts.faculty, color: '#4CAF50' },
                                        { label: 'Admins', value: userCounts.admin, color: '#6264A7' },
                                    ].map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => onNavClick('users')}
                                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                        >
                                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs text-[#6C757D]">{item.label}: <b className="text-[#212529]">{item.value}</b></span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subject-wise Stats — real data */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-[#212529] text-lg">Subject-wise Usage</h3>
                            <span className="text-xs text-gray-400">{subjectStats.length} subjects</span>
                        </div>
                        {subjectStats.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen size={28} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-400">No subjects found in the system</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {subjectStats.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => onNavClick('subjects')}
                                        className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#2B5797]/20 transition-all text-left group active:scale-[0.99]"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center font-bold text-[10px] shrink-0">
                                            {sub.code?.slice(0, 3) || '—'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-[#212529] text-sm">{sub.name}</p>
                                            <p className="text-[10px] text-gray-400">{sub.code}</p>
                                        </div>
                                        <div className="hidden sm:block w-24">
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#2B5797] to-[#6264A7] rounded-full" style={{ width: `${Math.round((sub.chunks / maxChunks) * 100)}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-[#212529]">{sub.chunks}</p>
                                            <p className="text-[10px] text-gray-400">chunks</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-[#212529]">{sub.docs}</p>
                                            <p className="text-[10px] text-gray-400">docs</p>
                                        </div>
                                        <ArrowRight size={14} className="text-gray-200 group-hover:text-[#2B5797] shrink-0 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
//  ADMIN SETTINGS
// ═══════════════════════════════════════════════════════════════
const AdminSettingsPage: React.FC = () => (
    <div className="max-w-[800px] mx-auto w-full px-4 lg:px-8 py-6">
        {/* Page Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                    <Settings size={22} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#212529]">Settings</h2>
                    <p className="text-xs text-[#6C757D] mt-0.5">System configuration and integrations</p>
                </div>
            </div>
        </div>

        <div className="space-y-5">
            {/* System Config */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-[#212529] mb-5 flex items-center gap-2">
                    <Cpu size={18} className="text-[#2B5797]" /> System Configuration
                </h3>
                <div className="space-y-3">
                    {[
                        { label: 'AI Model', value: 'Gemini 1.5 Pro', desc: 'Primary LLM for query responses' },
                        { label: 'Embedding Model', value: 'text-embedding-004', desc: 'Vector similarity search' },
                        { label: 'Max Context', value: '128K tokens', desc: 'Maximum input context window' },
                        { label: 'Temperature', value: '0.7', desc: 'Response creativity level' },
                    ].map((config, i) => (
                        <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#2B5797]/20 transition-all text-left">
                            <div>
                                <p className="text-sm font-semibold text-[#212529]">{config.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{config.desc}</p>
                            </div>
                            <span className="text-sm font-mono text-[#2B5797] bg-[#E8F0FE] px-3 py-1.5 rounded-lg border border-[#E8F0FE]">{config.value}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Integrations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-[#212529] mb-5 flex items-center gap-2">
                    <Database size={18} className="text-[#2B5797]" /> Integrations
                </h3>
                <div className="space-y-3">
                    {[
                        { name: 'Supabase', status: 'Connected', icon: Database, color: '#4CAF50' },
                        { name: 'Google AI (Gemini)', status: 'Active', icon: Cpu, color: '#4CAF50' },
                        { name: 'Proctor Shield', status: 'Enabled', icon: Shield, color: '#4CAF50' },
                    ].map((integration, i) => (
                        <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#2B5797]/20 transition-all text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                                    <integration.icon size={16} className="text-gray-500" />
                                </div>
                                <span className="text-sm font-medium text-[#212529]">{integration.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} style={{ color: integration.color }} />
                                <span className="text-xs font-semibold" style={{ color: integration.color }}>{integration.status}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
                <h3 className="font-bold text-[#D13438] mb-2 flex items-center gap-2">
                    <AlertCircle size={18} /> Danger Zone
                </h3>
                <p className="text-sm text-[#6C757D] mb-4">These actions are irreversible. Proceed with caution.</p>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2.5 text-sm font-medium text-[#D13438] border border-red-200 rounded-xl hover:bg-red-50 transition-colors active:scale-[0.98]">
                        Reset Knowledge Base
                    </button>
                    <button className="px-4 py-2.5 text-sm font-medium text-[#D13438] border border-red-200 rounded-xl hover:bg-red-50 transition-colors active:scale-[0.98]">
                        Clear All Logs
                    </button>
                </div>
            </div>
        </div>
    </div>
);


// ═══════════════════════════════════════════════════════════════
//  SUBJECTS MANAGEMENT — REAL DATA FROM SUPABASE
// ═══════════════════════════════════════════════════════════════
interface SubjectDoc {
    source_document: string;
    chunk_count: number;
}

interface SubjectWithDocs {
    id: string;
    subject_name: string;
    subject_code: string;
    semester: number | null;
    department: string | null;
    description: string | null;
    docs: SubjectDoc[];
}

const SUBJECT_THEME: Record<string, { color: string; icon: string }> = {
    'AI101': { color: '#7c3aed', icon: '🤖' },
    'AI401': { color: '#00897B', icon: '🤖' },
    'DS201': { color: '#059669', icon: '🌳' },
    'DS301': { color: '#FF9800', icon: '🌳' },
    'OS301': { color: '#ea580c', icon: '⚙️' },
    'LA301': { color: '#0891b2', icon: '📊' },
    'ML201': { color: '#4CAF50', icon: '🧠' },
    'DAA301': { color: '#d97706', icon: '📐' },
    'CN401': { color: '#6264A7', icon: '🌐' },
    'DBMS201': { color: '#2563eb', icon: '🗄️' },
};
const DEFAULT_SUBJ_THEME = { color: '#2B5797', icon: '📚' };

interface FacultyMember {
    faculty_table_id: string;  // faculty.id (PK in faculty table)
    user_id: string;
    full_name: string;
    faculty_id: string;        // display ID like "FAC001"
    department: string | null;
    designation: string | null;
}

const AdminSubjectsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSem, setFilterSem] = useState('All');
    const [subjects, setSubjects] = useState<SubjectWithDocs[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
    const [previewDoc, setPreviewDoc] = useState<{ name: string; courseId: string } | null>(null);
    const [previewContent, setPreviewContent] = useState<string[]>([]);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Faculty assignment state
    const [allFaculty, setAllFaculty] = useState<FacultyMember[]>([]);
    const [assignmentMap, setAssignmentMap] = useState<Record<string, string[]>>({});  // subject_id -> faculty_table_id[]
    const [assignDropdown, setAssignDropdown] = useState<string | null>(null);  // which subject's dropdown is open
    const [assigningFaculty, setAssigningFaculty] = useState(false);

    // Fetch subjects + their documents from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all subjects
                const { data: subjectData, error: subErr } = await supabase
                    .from('subjects')
                    .select('*')
                    .order('subject_name');

                if (subErr || !subjectData) {
                    console.error('Error fetching subjects:', subErr);
                    setLoading(false);
                    return;
                }

                // Fetch knowledge_base docs grouped by course_id and source_document
                const { data: kbData, error: kbErr } = await supabase
                    .from('knowledge_base')
                    .select('course_id, source_document');

                // Group documents per course
                const docMap: Record<string, SubjectDoc[]> = {};
                if (!kbErr && kbData) {
                    const countMap: Record<string, Record<string, number>> = {};
                    kbData.forEach((row: any) => {
                        const cid = row.course_id;
                        const src = row.source_document;
                        if (!cid || !src) return;
                        if (!countMap[cid]) countMap[cid] = {};
                        countMap[cid][src] = (countMap[cid][src] || 0) + 1;
                    });
                    Object.entries(countMap).forEach(([cid, docs]) => {
                        docMap[cid] = Object.entries(docs).map(([name, count]) => ({
                            source_document: name,
                            chunk_count: count,
                        }));
                    });
                }

                const enriched: SubjectWithDocs[] = subjectData.map((s: any) => ({
                    ...s,
                    docs: docMap[s.id] || [],
                }));

                setSubjects(enriched);
            } catch (e) {
                console.error('Failed to load subjects:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch all faculty members and their subject assignments
    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                // Get all faculty with their profile names
                const { data: facultyRows } = await supabase
                    .from('faculty')
                    .select('id, user_id, faculty_id, department, designation');

                if (facultyRows && facultyRows.length > 0) {
                    // Get profile names for all faculty user_ids
                    const userIds = facultyRows.map((f: any) => f.user_id);
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', userIds);

                    const nameMap: Record<string, string> = {};
                    if (profiles) profiles.forEach((p: any) => { nameMap[p.id] = p.full_name; });

                    const members: FacultyMember[] = facultyRows.map((f: any) => ({
                        faculty_table_id: f.id,
                        user_id: f.user_id,
                        full_name: nameMap[f.user_id] || 'Unknown',
                        faculty_id: f.faculty_id || '',
                        department: f.department,
                        designation: f.designation,
                    }));
                    setAllFaculty(members);
                }

                // Get all faculty_subjects mappings
                const { data: fsData } = await supabase
                    .from('faculty_subjects')
                    .select('faculty_id, subject_id');

                if (fsData) {
                    const map: Record<string, string[]> = {};
                    fsData.forEach((row: any) => {
                        if (!map[row.subject_id]) map[row.subject_id] = [];
                        map[row.subject_id].push(row.faculty_id);
                    });
                    setAssignmentMap(map);
                }
            } catch (e) {
                console.error('Failed to load faculty data:', e);
            }
        };
        fetchFaculty();
    }, []);

    // Load preview content for a specific document
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

            if (!error && data) {
                setPreviewContent(data.map((d: any) => d.content));
            }
        } catch (e) {
            console.error('Failed to load preview:', e);
        } finally {
            setLoadingPreview(false);
        }
    };

    // Assign a faculty member to a subject
    const assignFaculty = async (subjectId: string, facultyTableId: string) => {
        setAssigningFaculty(true);
        try {
            const { error } = await supabase
                .from('faculty_subjects')
                .insert({ faculty_id: facultyTableId, subject_id: subjectId, academic_year: '2025-26' });

            if (!error) {
                setAssignmentMap(prev => ({
                    ...prev,
                    [subjectId]: [...(prev[subjectId] || []), facultyTableId],
                }));
            } else {
                console.error('Failed to assign faculty:', error);
            }
        } catch (e) {
            console.error('Assign error:', e);
        } finally {
            setAssigningFaculty(false);
            setAssignDropdown(null);
        }
    };

    // Remove a faculty member from a subject
    const unassignFaculty = async (subjectId: string, facultyTableId: string) => {
        try {
            const { error } = await supabase
                .from('faculty_subjects')
                .delete()
                .eq('faculty_id', facultyTableId)
                .eq('subject_id', subjectId);

            if (!error) {
                setAssignmentMap(prev => ({
                    ...prev,
                    [subjectId]: (prev[subjectId] || []).filter(id => id !== facultyTableId),
                }));
            } else {
                console.error('Failed to unassign faculty:', error);
            }
        } catch (e) {
            console.error('Unassign error:', e);
        }
    };

    const semesters = ['All', ...Array.from(new Set(subjects.filter(s => s.semester).map(s => `Sem ${s.semester}`)))];

    const filtered = subjects.filter(s => {
        const matchesSem = filterSem === 'All' || `Sem ${s.semester}` === filterSem;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || s.subject_name.toLowerCase().includes(q) || s.subject_code.toLowerCase().includes(q);
        return matchesSem && matchesSearch;
    });

    const totalDocs = subjects.reduce((a, b) => a + b.docs.length, 0);

    return (
        <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#FFF3E0] text-[#FF9800] flex items-center justify-center">
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#212529]">Subjects</h2>
                            <p className="text-xs text-[#6C757D] mt-0.5">
                                {loading ? 'Loading...' : `${subjects.length} subjects · ${totalDocs} uploaded documents`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                        <Search size={16} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search subjects by name or code..."
                            className="bg-transparent text-sm text-[#212529] placeholder:text-gray-400 outline-none w-full"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 text-xs font-bold">✕</button>
                        )}
                    </div>
                    {semesters.length > 1 && (
                        <div className="flex gap-1.5 flex-wrap">
                            {semesters.map((sem) => (
                                <button
                                    key={sem}
                                    onClick={() => setFilterSem(sem)}
                                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${filterSem === sem
                                        ? 'bg-[#E8F0FE] text-[#2B5797] shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-[#212529]'
                                        }`}
                                >
                                    {sem}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
                    <div className="w-8 h-8 border-3 border-[#2B5797] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Loading subjects from database...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
                    <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-[#212529] mb-1">No subjects found</p>
                    <p className="text-sm text-gray-400">{searchQuery ? `No results for "${searchQuery}"` : 'No subjects in this semester'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((sub) => {
                        const theme = SUBJECT_THEME[sub.subject_code] || DEFAULT_SUBJ_THEME;
                        const isExpanded = expandedSubject === sub.id;

                        return (
                            <div key={sub.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-[#2B5797]/20 transition-all">
                                {/* Subject Header — Click to expand */}
                                <button
                                    onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}
                                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg shrink-0" style={{ backgroundColor: theme.color }}>
                                        {theme.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-[#212529] text-sm">{sub.subject_name}</h4>
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full uppercase">{sub.subject_code}</span>
                                            {sub.semester && (
                                                <span className="text-[10px] font-bold text-[#2B5797] bg-[#E8F0FE] px-2 py-0.5 rounded-full">Sem {sub.semester}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-[#6C757D] flex items-center gap-1">
                                                <FileText size={12} />
                                                {sub.docs.length} {sub.docs.length === 1 ? 'document' : 'documents'}
                                            </span>
                                            {sub.department && (
                                                <span className="text-xs text-gray-400">{sub.department}</span>
                                            )}
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className={`text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </button>

                                {/* Expanded Section — Faculty + Documents */}
                                {isExpanded && (() => {
                                    const assignedIds = assignmentMap[sub.id] || [];
                                    const assignedFaculty = allFaculty.filter(f => assignedIds.includes(f.faculty_table_id));
                                    const unassignedFaculty = allFaculty.filter(f => !assignedIds.includes(f.faculty_table_id));
                                    const isDropdownOpen = assignDropdown === sub.id;

                                    return (
                                        <div className="border-t border-gray-100 bg-gray-50/30">
                                            {/* ── Faculty Assignment Section ── */}
                                            <div className="px-6 py-4 border-b border-gray-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap size={14} className="text-[#2B5797]" />
                                                        <span className="text-xs font-bold text-[#212529] uppercase tracking-wide">Assigned Faculty</span>
                                                        <span className="text-[10px] bg-[#E8F0FE] text-[#2B5797] px-1.5 py-0.5 rounded-full font-bold">{assignedFaculty.length}</span>
                                                    </div>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setAssignDropdown(isDropdownOpen ? null : sub.id)}
                                                            disabled={unassignedFaculty.length === 0}
                                                            className="flex items-center gap-1.5 text-[10px] font-bold text-[#2B5797] bg-[#E8F0FE] hover:bg-[#d0e2fd] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            <Plus size={12} /> Assign Faculty
                                                        </button>
                                                        {isDropdownOpen && unassignedFaculty.length > 0 && (
                                                            <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-30 max-h-48 overflow-y-auto">
                                                                {unassignedFaculty.map(f => (
                                                                    <button
                                                                        key={f.faculty_table_id}
                                                                        onClick={() => assignFaculty(sub.id, f.faculty_table_id)}
                                                                        disabled={assigningFaculty}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors disabled:opacity-50"
                                                                    >
                                                                        <div className="w-7 h-7 rounded-full bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center text-[10px] font-bold shrink-0">
                                                                            {f.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-semibold text-[#212529] truncate">{f.full_name}</p>
                                                                            <p className="text-[10px] text-gray-400">{f.designation || f.department || f.faculty_id}</p>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {assignedFaculty.length === 0 ? (
                                                    <p className="text-xs text-gray-400 italic">No faculty assigned — click "Assign Faculty" above</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {assignedFaculty.map(f => (
                                                            <div
                                                                key={f.faculty_table_id}
                                                                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 group hover:border-red-200 transition-colors"
                                                            >
                                                                <div className="w-6 h-6 rounded-full bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center text-[9px] font-bold shrink-0">
                                                                    {f.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                                </div>
                                                                <span className="text-xs font-medium text-[#212529]">{f.full_name}</span>
                                                                <button
                                                                    onClick={() => unassignFaculty(sub.id, f.faculty_table_id)}
                                                                    className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                                    title={`Remove ${f.full_name}`}
                                                                >
                                                                    <Trash2 size={11} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Documents Section ── */}
                                            {sub.docs.length === 0 ? (
                                                <div className="px-6 py-8 text-center">
                                                    <FileText size={24} className="text-gray-300 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-400">No documents uploaded for this subject yet</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {sub.docs.map((doc, j) => {
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
                                    );
                                })()}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary */}
            {!loading && (
                <div className="mt-6 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Showing {filtered.length} of {subjects.length} subjects</span>
                    <span className="text-xs text-gray-400">{totalDocs} total documents</span>
                </div>
            )}

            {/* ── Document Preview Modal ── */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${previewDoc.name.toLowerCase().endsWith('.pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                    }`}>
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#212529] text-sm">{previewDoc.name}</h3>
                                    <p className="text-[10px] text-gray-400">
                                        {loadingPreview ? 'Loading...' : `${previewContent.length} chunks`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewDoc(null)}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
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
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Chunk {i + 1}</span>
                                            </div>
                                            <p className="text-sm text-[#212529] leading-relaxed whitespace-pre-wrap">
                                                {chunk}
                                            </p>
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
//  AUDIT LOGS
// ═══════════════════════════════════════════════════════════════
const AdminAuditLogsPage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const logs = [
        { text: "Create a lesson plan outline for 'Week 4: Programming Basics'...", role: 'User', userName: 'Dr. Priya Sharma', time: '18:47:26', date: '12/02/2026', type: 'Query', color: '#2B5797' },
        { text: "**Lesson Plan Outline: Week 4 – Programming Basics** Based on the lecture notes...", role: 'Model', userName: 'AI Agent', time: '18:47:26', date: '12/02/2026', type: 'Response', color: '#4CAF50' },
        { text: "I couldn't find relevant materials in the knowledge base regarding the types of...", role: 'Model', userName: 'AI Agent', time: '18:17:01', date: '12/02/2026', type: 'Response', color: '#4CAF50' },
        { text: "explain me the types of ml...", role: 'User', userName: 'Arjun Patel', time: '18:17:01', date: '12/02/2026', type: 'Query', color: '#2B5797' },
        { text: "According to the 'Chap-1_Introduction_to_ML.pdf' document, Machine Learning (ML)...", role: 'Model', userName: 'AI Agent', time: '18:06:16', date: '12/02/2026', type: 'Response', color: '#4CAF50' },
        { text: "what is machine learning and its types?", role: 'User', userName: 'Havish K', time: '18:06:16', date: '12/02/2026', type: 'Query', color: '#2B5797' },
        { text: "Uploaded LA_Module_II.pdf - Part 4 to Linear Algebra", role: 'System', userName: 'Prof. Rahul Desai', time: '14:22:10', date: '13/02/2026', type: 'Upload', color: '#FF9800' },
        { text: "Uploaded LA_Module_II.pdf - Part 3 to Linear Algebra", role: 'System', userName: 'Prof. Rahul Desai', time: '14:20:45', date: '13/02/2026', type: 'Upload', color: '#FF9800' },
        { text: "Uploaded Chap-1_Introduction_to_ML.pdf to Machine Learning", role: 'System', userName: 'Dr. Priya Sharma', time: '10:15:30', date: '12/02/2026', type: 'Upload', color: '#FF9800' },
        { text: "User login: admin@vsit.edu.in", role: 'System', userName: 'System Admin', time: '09:00:00', date: '12/02/2026', type: 'Auth', color: '#6264A7' },
    ];

    const filterMap: Record<string, string> = { 'All': '', 'Queries': 'Query', 'Responses': 'Response', 'Uploads': 'Upload', 'Auth': 'Auth' };
    const filtered = logs.filter(l => {
        const matchesFilter = activeFilter === 'All' || l.type === filterMap[activeFilter];
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || l.text.toLowerCase().includes(q) || l.userName.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#F3E5F5] text-[#6264A7] flex items-center justify-center">
                            <ClipboardList size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#212529]">Audit Logs</h2>
                            <p className="text-xs text-[#6C757D] mt-0.5">Monitor all system activity, queries, and uploads</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-[#212529] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors active:scale-[0.98]">
                        <Filter size={16} /> Export Logs
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                        <Search size={16} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search logs by content or user..."
                            className="bg-transparent text-sm text-[#212529] placeholder:text-gray-400 outline-none w-full"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 text-xs font-bold">✕</button>
                        )}
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {['All', 'Queries', 'Responses', 'Uploads', 'Auth'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter
                                    ? 'bg-[#E8F0FE] text-[#2B5797] shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-[#212529]'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <ClipboardList size={24} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-[#212529]">No logs found</p>
                            <p className="text-xs text-gray-400 mt-1">{searchQuery ? `No results for "${searchQuery}"` : 'No logs match this filter'}</p>
                        </div>
                    ) : filtered.map((log, i) => (
                        <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/80 transition-colors">
                            <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: log.color }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#212529]">{log.text}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[10px] text-gray-400">{log.userName}</span>
                                    <span className="text-[10px] text-gray-300">•</span>
                                    <span className="text-[10px] text-gray-400">{log.date}, {log.time}</span>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 ${log.type === 'Query' ? 'bg-blue-50 text-[#2B5797]'
                                : log.type === 'Response' ? 'bg-green-50 text-green-600'
                                    : log.type === 'Upload' ? 'bg-amber-50 text-amber-600'
                                        : 'bg-purple-50 text-purple-600'
                                }`}>
                                {log.type}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Showing {filtered.length} of {logs.length} logs</span>
                    <span className="text-xs text-gray-400">Last 24 hours</span>
                </div>
            </div>
        </div>
    );
};


export default AdminDashboard;

