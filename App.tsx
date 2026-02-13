import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import SubjectCard, { Subject } from './components/SubjectCard';
import SubjectView from './components/SubjectView';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './services/supabaseClient';
import AppSidebar from './components/AppSidebar';

// ─── Inner App with Auth ───
const AppContent: React.FC = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Determine user role
  let userRole = UserRole.STUDENT;
  if (user?.profile.role === 'faculty') userRole = UserRole.FACULTY;
  else if (user?.profile.role === 'admin') userRole = UserRole.ADMIN;

  const studentId = user?.student?.student_id || user?.profile.id || 'anonymous';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          // Get student's enrolled subjects
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
        } else if (userRole === UserRole.FACULTY && user.faculty) {
          // Get faculty's assigned subjects
          const { data, error } = await supabase
            .from('faculty_subjects')
            .select('subject_id, subjects(*)')
            .eq('faculty_id', user.faculty.id);

          if (!error && data) {
            const subs = data
              .map((d: any) => d.subjects)
              .filter(Boolean) as Subject[];
            setSubjects(subs);
          }
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [user, userRole]);

  const handleSignOut = async () => {
    await signOut();
    setSelectedSubject(null);
    setSubjects([]);
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-2xl font-serif font-bold text-white">AI</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
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

  // ─── Main App Layout ───
  // Determine active view for sidebar highlight
  let activeView: 'home' | 'admin' | 'subject' = 'home';
  if (userRole === UserRole.ADMIN) activeView = 'admin';
  if (selectedSubject) activeView = 'subject';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">

      {/* ─── Mobile Header (not for admin) ─── */}
      {userRole !== UserRole.ADMIN && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              AI
            </div>
            <span className="font-bold text-slate-900">Academic Agent</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
              {user.profile.full_name.charAt(0)}
            </div>
          </div>
        </div>
      )}

      {/* ─── Overlay for Mobile Sidebar (not for admin) ─── */}
      {userRole !== UserRole.ADMIN && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ─── Global Sidebar (hidden for admin) ─── */}
      {userRole !== UserRole.ADMIN && (
        <div className={`fixed inset-y-0 left-0 z-50 md:static md:z-auto transition-transform duration-300 md:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <AppSidebar
            userRole={userRole}
            subjects={subjects}
            activeView={activeView}
            onNavigate={(view, data) => {
              if (view === 'subject' && data) setSelectedSubject(data);
              else setSelectedSubject(null);
              setIsMobileMenuOpen(false);
            }}
            onSignOut={handleSignOut}
            userProfile={{ full_name: user.profile.full_name, email: user.profile.email }}
          />
        </div>
      )}

      {/* ─── Main Content Area ─── */}
      <main className={`flex-1 overflow-y-auto relative z-0 flex flex-col ${userRole !== UserRole.ADMIN ? 'pt-16 md:pt-0' : ''}`}>
        {userRole === UserRole.ADMIN ? (
          <AdminDashboard onLogout={handleSignOut} /> // Admin is always "home" for admin role usually, but here we render it directly
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
            onLogout={handleSignOut}
            onSelectSubject={(s: Subject) => setSelectedSubject(s)}
          />
        ) : (
          // Student Home (Subject Grid)
          <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
            <div className="mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {getGreeting()}, {user.profile.full_name.split(' ')[0]}! 👋
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                Select a subject to start chatting with your AI tutor.
              </p>
            </div>

            {loadingSubjects ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 h-48 animate-pulse shadow-sm"></div>
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No Subjects Found</h3>
                <p className="text-slate-500 text-sm">You aren't enrolled in any subjects yet.</p>
              </div>
            ) : (
              <div className="space-y-8 md:space-y-10">
                {Object.entries(
                  subjects.reduce<Record<number, Subject[]>>((acc, s) => {
                    const sem = s.semester || 0;
                    (acc[sem] = acc[sem] || []).push(s);
                    return acc;
                  }, {})
                ).sort(([a], [b]) => Number(b) - Number(a)).map(([sem, subs]) => (
                  <div key={sem}>
                    <div className="flex items-center gap-4 mb-4 md:mb-6">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold ring-1 ring-violet-200">
                        S{sem}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Semester {sem}</h3>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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