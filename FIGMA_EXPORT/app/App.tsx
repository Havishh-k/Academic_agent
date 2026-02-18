import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  BarChart2, 
  Bot, 
  Settings, 
  Bell, 
  Search, 
  Users,
  Upload,
  FileCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NavigationProvider, useNavigation, Screen } from './context/NavigationContext';

// Screens
import LoginScreen from './components/screens/Login';
import StudentDashboard from './components/screens/StudentDashboard';
import SubjectDashboard from './components/screens/SubjectDashboard';
import AiAgentScreen from './components/screens/AiAgent';
import NotesScreen from './components/screens/Notes';
import AssignmentsScreen from './components/screens/Assignments';
import QuizzesScreen from './components/screens/Quizzes';
import PerformanceScreen from './components/screens/Performance';
import TeacherPortal from './components/screens/TeacherPortal';
import HodPortal from './components/screens/HodPortal';
import SettingsScreen from './components/screens/Settings';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- LAYOUT COMPONENTS ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ElementType, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-6 py-3 text-left transition-colors duration-200 border-l-4",
      active 
        ? "border-[#2B5797] bg-[#E8F0FE] text-[#2B5797]" 
        : "border-transparent text-[#495057] hover:bg-gray-50 hover:text-[#212529]"
    )}
  >
    <Icon size={20} />
    <span className="font-medium text-[16px]">{label}</span>
  </button>
);

const Sidebar = () => {
  const { currentScreen, navigateTo, userRole } = useNavigation();

  // Student Menu
  const studentItems = [
    { id: 'STUDENT_DASH', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'NOTES', label: 'Notes & Materials', icon: BookOpen },
    { id: 'ASSIGNMENTS', label: 'Assignments', icon: FileText },
    { id: 'QUIZZES', label: 'Quizzes', icon: CheckSquare },
    { id: 'PERFORMANCE', label: 'Performance', icon: BarChart2 },
    { id: 'AI_AGENT', label: 'AI Tutor', icon: Bot },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  // Teacher Menu
  const teacherItems = [
    { id: 'TEACHER_PORTAL', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'TEACHER_PORTAL', label: 'Upload Materials', icon: Upload }, // Mock mapping to same screen tab
    { id: 'TEACHER_PORTAL', label: 'Quiz Generator', icon: CheckSquare }, // Mock mapping
    { id: 'TEACHER_PORTAL', label: 'Student Reports', icon: BarChart2 }, // Mock mapping
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  // HOD Menu
  const hodItems = [
    { id: 'HOD_PORTAL', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'HOD_PORTAL', label: 'Teachers', icon: Users }, // Mock mapping
    { id: 'HOD_PORTAL', label: 'Courses', icon: BookOpen }, // Mock mapping
    { id: 'HOD_PORTAL', label: 'Analytics', icon: BarChart2 },
    { id: 'HOD_PORTAL', label: 'Approvals', icon: FileCheck },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  const items = userRole === 'teacher' ? teacherItems : userRole === 'hod' ? hodItems : studentItems;

  return (
    <aside className="w-[260px] bg-white border-r border-[#DEE2E6] flex flex-col fixed left-0 top-[64px] bottom-0 z-10 overflow-y-auto">
      <div className="py-4 flex flex-col gap-1">
        {items.map((item, idx) => (
          <SidebarItem
            key={idx}
            icon={item.icon}
            label={item.label}
            active={currentScreen === item.id}
            onClick={() => navigateTo(item.id as Screen)}
          />
        ))}
      </div>
      
      <div className="mt-auto p-6 border-t border-[#DEE2E6]">
         <div className="text-xs text-[#6C757D] flex flex-wrap gap-2">
           <span>About</span>
           <span>Contact</span>
           <span>Privacy</span>
           <span>Terms</span>
         </div>
         <div className="text-xs text-[#6C757D] mt-2">© 2026 VSIT AI Agent</div>
      </div>
    </aside>
  );
};

const TopBar = () => {
  const { navigateTo, setShowLogoutModal, userRole } = useNavigation();

  return (
    <header className="h-[64px] bg-white border-b border-[#DEE2E6] fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-8">
      {/* Left: Logo */}
      <div 
        className="flex items-center gap-3 cursor-pointer" 
        onClick={() => navigateTo(userRole === 'student' ? 'STUDENT_DASH' : userRole === 'teacher' ? 'TEACHER_PORTAL' : 'HOD_PORTAL')}
      >
        <div className="w-8 h-8 bg-[#2B5797] rounded flex items-center justify-center text-white font-bold text-xs">VSIT</div>
        <span className="text-xl font-bold text-[#212529]">AI Academic Agent</span>
      </div>

      {/* Center: Search */}
      <div className="relative w-[300px]">
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full h-10 pl-10 pr-4 rounded-full bg-[#F8F9FA] border border-[#DEE2E6] focus:outline-none focus:ring-2 focus:ring-[#2B5797] focus:border-transparent transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" size={18} />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-[#495057] hover:bg-[#F8F9FA] rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#D13438] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">3</span>
        </button>
        
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-[#F8F9FA] p-1 rounded-full pr-3 transition-colors"
          onClick={() => navigateTo('SETTINGS')}
        >
          <div className="w-10 h-10 rounded-full bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center font-bold text-sm border border-[#DEE2E6]">
            {userRole === 'student' ? 'PN' : userRole === 'teacher' ? 'DR' : 'HS'}
          </div>
        </div>

        <button 
          onClick={() => setShowLogoutModal(true)}
          className="bg-[#D13438] hover:bg-[#B92B2F] text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
        >
          SIGN OUT
        </button>
      </div>
    </header>
  );
};

const LogoutModal = () => {
  const { showLogoutModal, setShowLogoutModal, navigateTo } = useNavigation();

  if (!showLogoutModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-[400px] p-8 scale-in-95 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D13438]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-[#212529]">Sign Out</h2>
          <p className="text-[#6C757D]">Are you sure you want to sign out? You will need to log in again to access your account.</p>
          
          <div className="flex gap-4 w-full mt-4">
            <button 
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-2.5 px-4 border border-[#DEE2E6] rounded-full text-[#495057] font-medium hover:bg-[#F8F9FA] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                setShowLogoutModal(false);
                navigateTo('LOGIN');
              }}
              className="flex-1 py-2.5 px-4 bg-[#D13438] rounded-full text-white font-medium hover:bg-[#B92B2F] transition-colors"
            >
              Yes, Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainContent = () => {
  const { currentScreen } = useNavigation();

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#212529]">
      {currentScreen !== 'LOGIN' && (
        <>
          <TopBar />
          <Sidebar />
        </>
      )}

      <main className={cn(
        "transition-all duration-300",
        currentScreen !== 'LOGIN' ? "pt-[64px] pl-[260px] min-h-screen p-8" : ""
      )}>
        {currentScreen === 'LOGIN' && <LoginScreen />}
        {currentScreen === 'STUDENT_DASH' && <StudentDashboard />}
        {currentScreen === 'SUBJECT_DASH' && <SubjectDashboard />}
        {currentScreen === 'AI_AGENT' && <AiAgentScreen />}
        {currentScreen === 'NOTES' && <NotesScreen />}
        {currentScreen === 'ASSIGNMENTS' && <AssignmentsScreen />}
        {currentScreen === 'QUIZZES' && <QuizzesScreen />}
        {currentScreen === 'PERFORMANCE' && <PerformanceScreen />}
        {currentScreen === 'TEACHER_PORTAL' && <TeacherPortal />}
        {currentScreen === 'HOD_PORTAL' && <HodPortal />}
        {currentScreen === 'SETTINGS' && <SettingsScreen />}
      </main>

      <LogoutModal />
    </div>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <MainContent />
    </NavigationProvider>
  );
}
