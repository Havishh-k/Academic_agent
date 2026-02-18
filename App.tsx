import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import SubjectCard, { Subject } from './components/SubjectCard';
import SubjectView from './components/SubjectView';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AccessibleVoiceMode from './components/AccessibleVoiceMode';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './services/supabaseClient';
import AppSidebar from './components/AppSidebar';
import { Menu, Bell, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// ─── Inner App with Auth ───
const AppContent: React.FC = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Determine user role
  let userRole = UserRole.STUDENT;
  if (user?.profile.role === 'faculty') userRole = UserRole.FACULTY;
  else if (user?.profile.role === 'admin') userRole = UserRole.ADMIN;

  const studentId = user?.student?.student_id || user?.profile.id || 'anonymous';

  // Fetch enrolled subjects when user logs in
  useEffect(() => {
    if (!user || userRole === UserRole.ADMIN) {
      setSubjects([]);
      return;
    }

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        if (userRole === UserRole.STUDENT && user.student) {
          const { data, error } = await supabase
            .from('student_enrollments')
            .select('subject_id, subjects(*)')
            .eq('student_id', user.student.id);

          if (!error && data) {
            const subs = data
              .map((d: any) => d.subjects)
              .filter(Boolean) as Subject[];
            setSubjects(subs);
          }
        } else if (userRole === UserRole.FACULTY) {
          const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('faculty_id', user.profile.id);
          if (!error && data) setSubjects(data);
        }
      } catch (e) {
        console.error('Failed to load subjects:', e);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [user, userRole]);

  const handleSignOut = async () => {
    setShowLogoutModal(false);
    await signOut();
    setSelectedSubject(null);
    setSubjects([]);
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-[#2B5797] flex items-center justify-center mx-auto mb-4 shadow-md animate-pulse">
            <span className="text-xl font-bold text-white">VSIT</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">Loading Portal...</p>
        </div>
      </div>
    );
  }

  // ─── Auth Screens ───
  if (!user) {
    if (authView === 'signup') {
      return <SignupForm onSwitchToLogin={() => setAuthView('login')} onSignup={signUp} />;
    }
    return <LoginForm onSwitchToSignup={() => setAuthView('signup')} onLogin={signIn} />;
  }

  // ─── Accessible Voice-First Mode ───
  if (userRole === UserRole.STUDENT && user.profile.prefers_voice) {
    return (
      <AccessibleVoiceMode
        subjects={subjects}
        studentId={studentId}
        userName={user.profile.full_name}
        onSignOut={handleSignOut}
      />
    );
  }

  // ─── Sidebar active view ───
  let activeView: 'home' | 'admin' | 'subject' = 'home';
  if (userRole === UserRole.ADMIN) activeView = 'admin';
  if (selectedSubject) activeView = 'subject';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">

      {/* ─── Mobile Overlay ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── Sidebar ─── */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-300 lg:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <AppSidebar
          userRole={userRole}
          subjects={subjects}
          activeView={activeView}
          onNavigate={(view, data) => {
            if (view === 'subject' && data) setSelectedSubject(data);
            else setSelectedSubject(null);
            setIsMobileMenuOpen(false);
          }}
          onSignOut={() => setShowLogoutModal(true)}
          userProfile={{ full_name: user.profile.full_name, email: user.profile.email }}
        />
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ─── TopBar ─── */}
        <header className="h-[64px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2B5797] rounded-lg flex items-center justify-center text-white font-bold text-[10px]">
                VSIT
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-80">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects, topics..."
                className="bg-transparent text-sm text-[#212529] placeholder:text-gray-400 outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D13438] rounded-full" />
            </button>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E8F0FE] text-[#2B5797] font-bold text-xs flex items-center justify-center">
                {user.profile.full_name.charAt(0)}
              </div>
              <span className="hidden sm:block text-sm font-medium text-[#212529]">{user.profile.full_name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <main className="flex-1 overflow-y-auto">
          {userRole === UserRole.ADMIN ? (
            <AdminDashboard onLogout={() => setShowLogoutModal(true)} />
          ) : selectedSubject ? (
            <SubjectView
              subject={selectedSubject}
              userRole={userRole}
              studentId={studentId}
              userName={user.profile.full_name}
              onBack={() => setSelectedSubject(null)}
            />
          ) : userRole === UserRole.FACULTY ? (
            <TeacherDashboard
              subjects={subjects}
              userName={user.profile.full_name}
              onLogout={() => setShowLogoutModal(true)}
              onSelectSubject={(s: Subject) => setSelectedSubject(s)}
            />
          ) : (
            /* Student Home – Subject Grid */
            <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#212529] mb-1">
                  {getGreeting()}, {user.profile.full_name.split(' ')[0]}! 👋
                </h2>
                <p className="text-[#6C757D] text-sm">
                  Select a subject to start chatting with your AI tutor.
                </p>
              </div>

              {loadingSubjects ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 h-48 animate-pulse shadow-sm" />
                  ))}
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#212529] mb-2">No Subjects Found</h3>
                  <p className="text-[#6C757D] text-sm">You aren't enrolled in any subjects yet.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(
                    subjects.reduce<Record<number, Subject[]>>((acc, s) => {
                      const sem = s.semester || 0;
                      (acc[sem] = acc[sem] || []).push(s);
                      return acc;
                    }, {})
                  ).sort(([a], [b]) => Number(b) - Number(a)).map(([sem, subs]) => (
                    <div key={sem}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center text-xs font-bold">
                          S{sem}
                        </div>
                        <h3 className="text-lg font-bold text-[#212529]">Semester {sem}</h3>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {subs.map(subject => (
                          <SubjectCard
                            key={subject.id}
                            subject={subject}
                            onClick={() => setSelectedSubject(subject)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ─── Logout Confirmation Modal ─── */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#212529]">Sign Out</h3>
                <button onClick={() => setShowLogoutModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <X size={18} />
                </button>
              </div>
              <p className="text-[#6C757D] text-sm mb-6">
                Are you sure you want to sign out of VSIT AI Academic Agent?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-[#212529] text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 rounded-lg bg-[#D13438] text-white text-sm font-semibold hover:bg-[#b82c2f] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Root App with AuthProvider ───
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
