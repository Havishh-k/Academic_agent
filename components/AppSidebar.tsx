import React from 'react';
import { UserRole } from '../types';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    CheckSquare,
    BarChart2,
    Bot,
    Settings,
    LogOut,
    Users,
    Upload,
    ClipboardList,
    ChevronRight,
} from 'lucide-react';

interface AppSidebarProps {
    userRole: UserRole;
    subjects: any[];
    onNavigate: (view: 'home' | 'admin' | 'subject', data?: any) => void;
    activeView: 'home' | 'admin' | 'subject';
    onSignOut: () => void;
    userProfile: { full_name: string; email: string };
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    view: 'home' | 'admin' | 'subject';
}

const AppSidebar: React.FC<AppSidebarProps> = ({
    userRole,
    subjects,
    onNavigate,
    activeView,
    onSignOut,
    userProfile,
}) => {
    // Role-aware sidebar items
    const getNavItems = (): NavItem[] => {
        if (userRole === UserRole.ADMIN) {
            return [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'admin' },
                { id: 'users', label: 'User Management', icon: Users, view: 'admin' },
                { id: 'analytics', label: 'Analytics', icon: BarChart2, view: 'admin' },
                { id: 'settings', label: 'Settings', icon: Settings, view: 'admin' },
            ];
        }
        if (userRole === UserRole.FACULTY) {
            return [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'home' },
                { id: 'materials', label: 'Materials', icon: Upload, view: 'home' },
                { id: 'quizgen', label: 'Quiz Generator', icon: ClipboardList, view: 'home' },
                { id: 'reports', label: 'Student Reports', icon: BarChart2, view: 'home' },
                { id: 'settings', label: 'Settings', icon: Settings, view: 'home' },
            ];
        }
        // Student
        return [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'home' },
            { id: 'subjects', label: 'My Subjects', icon: BookOpen, view: 'home' },
            { id: 'notes', label: 'Course Notes', icon: FileText, view: 'home' },
            { id: 'assignments', label: 'Assignments', icon: CheckSquare, view: 'home' },
            { id: 'performance', label: 'Performance', icon: BarChart2, view: 'home' },
            { id: 'ai', label: 'AI Tutor', icon: Bot, view: 'home' },
            { id: 'settings', label: 'Settings', icon: Settings, view: 'home' },
        ];
    };

    const navItems = getNavItems();
    const initials = userProfile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
            {/* Logo / Brand */}
            <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2B5797] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                        VSIT
                    </div>
                    <div>
                        <h1 className="font-bold text-[#212529] text-sm leading-tight">VSIT AI Agent</h1>
                        <p className="text-[10px] text-gray-400 font-medium">Academic Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                    Navigation
                </div>
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            (item.id === 'dashboard' && activeView === 'home' && !subjects.some(() => false)) ||
                            (item.view === 'admin' && activeView === 'admin' && item.id === 'dashboard');
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.view)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive
                                        ? 'bg-[#E8F0FE] text-[#2B5797] border-l-4 border-[#2B5797] -ml-[4px] pl-[16px]'
                                        : 'text-[#495057] hover:bg-gray-50 hover:text-[#212529]'
                                    }`}
                            >
                                <item.icon
                                    size={18}
                                    className={isActive ? 'text-[#2B5797]' : 'text-gray-400 group-hover:text-[#2B5797]'}
                                />
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* Subjects Quick List (Students only) */}
                {userRole === UserRole.STUDENT && subjects.length > 0 && (
                    <div className="mt-6">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                            My Subjects
                        </div>
                        <div className="space-y-0.5">
                            {subjects.slice(0, 6).map((sub) => (
                                <button
                                    key={sub.id}
                                    onClick={() => onNavigate('subject', sub)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group ${activeView === 'subject'
                                            ? 'text-[#495057] hover:bg-gray-50'
                                            : 'text-[#495057] hover:bg-[#E8F0FE] hover:text-[#2B5797]'
                                        }`}
                                >
                                    <div className="w-2 h-2 rounded-full bg-[#6264A7] shrink-0" />
                                    <span className="truncate">{sub.subject_name || sub.subject_code}</span>
                                    <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-[#2B5797] shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* User Profile & Sign Out */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#E8F0FE] text-[#2B5797] font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#212529] truncate">{userProfile.full_name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{userProfile.email}</p>
                    </div>
                </div>
                <button
                    onClick={onSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#D13438] bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors font-medium"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>

            {/* Footer */}
            <div className="px-4 pb-3">
                <div className="flex gap-3 text-[10px] text-gray-400">
                    <span className="hover:text-[#2B5797] cursor-pointer">About</span>
                    <span className="hover:text-[#2B5797] cursor-pointer">Contact</span>
                    <span className="hover:text-[#2B5797] cursor-pointer">Privacy</span>
                </div>
                <p className="text-[9px] text-gray-300 mt-1">© 2026 VSIT AI Agent</p>
            </div>
        </div>
    );
};

export default AppSidebar;
