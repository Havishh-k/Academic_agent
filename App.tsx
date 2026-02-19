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
import AppSidebar, { NavId } from './components/AppSidebar';
import { Menu, Bell, Search, X, FileText, CheckSquare, BarChart2, Bot, Settings, BookOpen, ArrowRight, Eye } from 'lucide-react';
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
  const [activeNavId, setActiveNavId] = useState<NavId>('dashboard');

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
          // First get the faculty record for this user
          const { data: facultyRecord } = await supabase
            .from('faculty')
            .select('id')
            .eq('user_id', user.profile.id)
            .single();

          if (facultyRecord) {
            // Then get assigned subjects through the junction table
            const { data, error } = await supabase
              .from('faculty_subjects')
              .select('subject_id, subjects(*)')
              .eq('faculty_id', facultyRecord.id);

            if (!error && data) {
              const subs = data
                .map((d: any) => d.subjects)
                .filter(Boolean) as Subject[];
              setSubjects(subs);
            }
          }
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
    setActiveNavId('dashboard');
  };

  const handleNavClick = (navId: NavId) => {
    setActiveNavId(navId);
    setSelectedSubject(null); // Clear subject when switching nav
    setIsMobileMenuOpen(false);
  };

  const handleSubjectClick = (sub: Subject) => {
    setSelectedSubject(sub);
    setActiveNavId('subjects'); // Highlight "My Subjects" when viewing a subject
    setIsMobileMenuOpen(false);
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

  // ─── Render page content based on activeNavId ───
  const renderPageContent = () => {
    // If a subject is selected, always show SubjectView
    if (selectedSubject) {
      return (
        <SubjectView
          subject={selectedSubject}
          userRole={userRole}
          studentId={studentId}
          userName={user.profile.full_name}
          onBack={() => {
            setSelectedSubject(null);
            setActiveNavId('dashboard');
          }}
        />
      );
    }

    // Admin portal
    if (userRole === UserRole.ADMIN) {
      return <AdminDashboard onLogout={() => setShowLogoutModal(true)} activeNavId={activeNavId} onNavClick={handleNavClick} />;
    }

    // Faculty portal
    if (userRole === UserRole.FACULTY) {
      return (
        <TeacherDashboard
          subjects={subjects}
          userName={user.profile.full_name}
          onLogout={() => setShowLogoutModal(true)}
          onSelectSubject={(s: Subject) => handleSubjectClick(s)}
          activeNavId={activeNavId}
          onNavClick={handleNavClick}
        />
      );
    }

    // ─── Student Pages ───
    switch (activeNavId) {
      case 'dashboard':
        return <StudentDashboardPage subjects={subjects} loadingSubjects={loadingSubjects} user={user} onSelectSubject={handleSubjectClick} />;

      case 'subjects':
        return <StudentSubjectsPage subjects={subjects} loadingSubjects={loadingSubjects} onSelectSubject={handleSubjectClick} />;

      case 'notes':
        return <StudentNotesPage subjects={subjects} onSelectSubject={handleSubjectClick} />;

      case 'assignments':
        return <StudentAssignmentsPage subjects={subjects} onSelectSubject={handleSubjectClick} />;

      case 'performance':
        return <StudentPerformancePage subjects={subjects} userName={user.profile.full_name} />;

      case 'ai':
        return <StudentAITutorPage subjects={subjects} onSelectSubject={handleSubjectClick} />;

      case 'settings':
        return <StudentSettingsPage user={user} />;

      default:
        return <StudentDashboardPage subjects={subjects} loadingSubjects={loadingSubjects} user={user} onSelectSubject={handleSubjectClick} />;
    }
  };

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
          activeNavId={selectedSubject ? 'subjects' : activeNavId}
          onNavClick={handleNavClick}
          onSubjectClick={handleSubjectClick}
          onSignOut={() => setShowLogoutModal(true)}
          userProfile={{ full_name: user.profile.full_name, email: user.profile.email }}
        />
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ─── TopBar ─── */}
        <header className="h-[64px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2B5797] rounded-lg flex items-center justify-center text-white font-bold text-[10px]">
                VSIT
              </div>
            </div>
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
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D13438] rounded-full" />
            </button>
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
          {renderPageContent()}
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


// ═══════════════════════════════════════════════════════════════
//  STUDENT PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── Student Dashboard (Home) ───
const StudentDashboardPage: React.FC<{
  subjects: Subject[];
  loadingSubjects: boolean;
  user: any;
  onSelectSubject: (s: Subject) => void;
}> = ({ subjects, loadingSubjects, user, onSelectSubject }) => (
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
                  onClick={() => onSelectSubject(subject)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);


// ─── My Subjects Page ───
const StudentSubjectsPage: React.FC<{
  subjects: Subject[];
  loadingSubjects: boolean;
  onSelectSubject: (s: Subject) => void;
}> = ({ subjects, loadingSubjects, onSelectSubject }) => (
  <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-8">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#212529] mb-1 flex items-center gap-3">
        <BookOpen size={28} className="text-[#2B5797]" /> My Subjects
      </h2>
      <p className="text-[#6C757D] text-sm">All your enrolled courses in one place. Click any subject to open the AI tutor.</p>
    </div>

    {loadingSubjects ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 h-48 animate-pulse shadow-sm" />
        ))}
      </div>
    ) : subjects.length === 0 ? (
      <EmptyState icon="📚" title="No Subjects Enrolled" description="Contact your faculty to get enrolled in subjects." />
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map(subject => (
          <SubjectCard key={subject.id} subject={subject} onClick={() => onSelectSubject(subject)} />
        ))}
      </div>
    )}
  </div>
);


// ─── Course Notes Page ───
interface StudentDoc {
  source_document: string;
  chunk_count: number;
}

const StudentNotesPage: React.FC<{
  subjects: Subject[];
  onSelectSubject: (s: Subject) => void;
}> = ({ subjects, onSelectSubject }) => {
  const [docsMap, setDocsMap] = useState<Record<string, StudentDoc[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; courseId: string } | null>(null);
  const [previewContent, setPreviewContent] = useState<string[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (subjects.length === 0) { setLoading(false); return; }
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const subjectIds = subjects.map(s => s.id);
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('course_id, source_document')
          .in('course_id', subjectIds);

        if (!error && data) {
          const map: Record<string, Record<string, number>> = {};
          data.forEach((row: any) => {
            if (!row.course_id || !row.source_document) return;
            if (!map[row.course_id]) map[row.course_id] = {};
            map[row.course_id][row.source_document] = (map[row.course_id][row.source_document] || 0) + 1;
          });
          const result: Record<string, StudentDoc[]> = {};
          Object.entries(map).forEach(([cid, docs]) => {
            result[cid] = Object.entries(docs).map(([name, count]) => ({
              source_document: name,
              chunk_count: count,
            }));
          });
          setDocsMap(result);
        }
      } catch (e) {
        console.error('Failed to load docs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [subjects]);

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
      if (!error && data) setPreviewContent(data.map((d: any) => d.content));
    } catch (e) {
      console.error('Failed to load preview:', e);
    } finally {
      setLoadingPreview(false);
    }
  };

  const totalDocs = Object.values(docsMap).reduce((a, b) => a + b.length, 0);

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#212529] mb-1 flex items-center gap-3">
          <FileText size={28} className="text-[#2B5797]" /> Course Notes
        </h2>
        <p className="text-[#6C757D] text-sm">
          {loading ? 'Loading...' : `${subjects.length} subjects · ${totalDocs} uploaded documents — click to preview content`}
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
          <div className="w-8 h-8 border-3 border-[#2B5797] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading course notes...</p>
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState icon="📝" title="No Notes Available" description="Enroll in a subject and the AI will generate notes from the course materials." />
      ) : (
        <div className="space-y-4">
          {subjects.map(sub => {
            const docs = docsMap[sub.id] || [];
            const isExpanded = expandedSubject === sub.id;

            return (
              <div key={sub.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-[#2B5797]/20 transition-all">
                {/* Subject Header */}
                <button
                  onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#212529] text-sm">{sub.subject_name}</h3>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full uppercase">{sub.subject_code}</span>
                    </div>
                    <span className="text-xs text-[#6C757D] flex items-center gap-1 mt-1">
                      <BookOpen size={12} />
                      {docs.length} {docs.length === 1 ? 'document' : 'documents'} available
                    </span>
                  </div>
                  <ArrowRight size={16} className={`text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded Documents */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/30">
                    {docs.length === 0 ? (
                      <div className="px-6 py-8 text-center">
                        <FileText size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No documents uploaded for this subject yet</p>
                        <button
                          onClick={() => onSelectSubject(sub)}
                          className="mt-3 px-4 py-2 bg-[#2B5797] text-white rounded-lg text-xs font-semibold hover:bg-[#1e3f6e] transition-colors"
                        >
                          Ask AI Tutor
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {docs.map((doc, j) => {
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {!loading && subjects.length > 0 && (
        <div className="mt-6 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">{subjects.length} subjects</span>
          <span className="text-xs text-gray-400">{totalDocs} total documents</span>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${previewDoc.name.toLowerCase().endsWith('.pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[#212529] text-sm">{previewDoc.name}</h3>
                  <p className="text-[10px] text-gray-400">{loadingPreview ? 'Loading...' : `${previewContent.length} chunks`}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
            </div>
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
                      <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Chunk {i + 1}</span>
                      <p className="text-sm text-[#212529] leading-relaxed whitespace-pre-wrap">{chunk}</p>
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


// ─── Assignments Page ───
const StudentAssignmentsPage: React.FC<{
  subjects: Subject[];
  onSelectSubject: (s: Subject) => void;
}> = ({ subjects, onSelectSubject }) => (
  <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-8">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#212529] mb-1 flex items-center gap-3">
        <CheckSquare size={28} className="text-[#2B5797]" /> Assignments & Quizzes
      </h2>
      <p className="text-[#6C757D] text-sm">View available quizzes and assignments for your subjects.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {subjects.map(sub => (
        <button
          key={sub.id}
          onClick={() => onSelectSubject(sub)}
          className="group bg-white rounded-xl border border-gray-200 hover:border-[#2B5797]/30 hover:shadow-lg p-5 text-left transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#212529] text-sm group-hover:text-[#2B5797] transition-colors">{sub.subject_name}</h3>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">{sub.subject_code}</p>
            </div>
          </div>
          <p className="text-xs text-[#6C757D] mb-3">Take quizzes and view assignments for this subject.</p>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#2B5797] opacity-0 group-hover:opacity-100 transition-all">
            View Quizzes <ArrowRight size={14} />
          </div>
        </button>
      ))}
    </div>

    {subjects.length === 0 && (
      <EmptyState icon="✅" title="No Assignments Yet" description="Quizzes and assignments will appear once your faculty publishes them." />
    )}
  </div>
);


// ─── Performance Page ───
const StudentPerformancePage: React.FC<{
  subjects: Subject[];
  userName: string;
}> = ({ subjects, userName }) => (
  <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-8">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#212529] mb-1 flex items-center gap-3">
        <BarChart2 size={28} className="text-[#2B5797]" /> Performance Overview
      </h2>
      <p className="text-[#6C757D] text-sm">Track your academic progress, quiz scores, and concept mastery.</p>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {[
        { label: 'Enrolled Subjects', value: subjects.length, icon: '📚', color: '#2B5797' },
        { label: 'Quizzes Taken', value: '—', icon: '⚡', color: '#4CAF50' },
        { label: 'Avg. Score', value: '—', icon: '🎯', color: '#FF9800' },
        { label: 'Study Hours', value: '—', icon: '⏱️', color: '#6264A7' },
      ].map((stat, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">{stat.icon}</span>
            <span className="text-[10px] font-bold uppercase text-gray-400">{stat.label}</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
        </div>
      ))}
    </div>

    {/* Subject-wise breakdown */}
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="font-bold text-[#212529] text-lg mb-4">Subject-wise Progress</h3>
      {subjects.length === 0 ? (
        <p className="text-[#6C757D] text-sm text-center py-8">No subjects to track yet.</p>
      ) : (
        <div className="space-y-4">
          {subjects.map(sub => (
            <div key={sub.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center font-bold text-xs">
                {sub.subject_code.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#212529] text-sm">{sub.subject_name}</p>
                <p className="text-[10px] text-gray-400">{sub.subject_code} • Sem {sub.semester || '—'}</p>
              </div>
              <div className="flex-1 max-w-[200px]">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2B5797] rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400">—%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);


// ─── AI Tutor Page ───
const StudentAITutorPage: React.FC<{
  subjects: Subject[];
  onSelectSubject: (s: Subject) => void;
}> = ({ subjects, onSelectSubject }) => (
  <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-8">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#212529] mb-1 flex items-center gap-3">
        <Bot size={28} className="text-[#2B5797]" /> AI Tutor
      </h2>
      <p className="text-[#6C757D] text-sm">Choose a subject to start a personalized tutoring session with your AI assistant.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {subjects.map(sub => (
        <button
          key={sub.id}
          onClick={() => onSelectSubject(sub)}
          className="group bg-white rounded-xl border border-gray-200 hover:border-[#2B5797]/30 hover:shadow-lg p-6 text-left transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#2B5797] flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#212529] group-hover:text-[#2B5797] transition-colors">{sub.subject_name}</h3>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">{sub.subject_code}</p>
            </div>
          </div>
          <p className="text-sm text-[#6C757D] mb-4">{sub.description || 'Chat with the AI tutor about this subject.'}</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#2B5797]">
            Start Chat <ArrowRight size={16} />
          </div>
        </button>
      ))}
    </div>

    {subjects.length === 0 && (
      <EmptyState icon="🤖" title="No Subjects Available" description="Enroll in a subject to start chatting with your AI tutor." />
    )}
  </div>
);


// ─── Settings Page ───
const StudentSettingsPage: React.FC<{ user: any }> = ({ user }) => (
  <div className="max-w-[800px] mx-auto w-full px-4 lg:px-8 py-8">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#212529] mb-1 flex items-center gap-3">
        <Settings size={28} className="text-[#2B5797]" /> Settings
      </h2>
      <p className="text-[#6C757D] text-sm">Manage your account preferences.</p>
    </div>

    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-[#212529] mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Full Name</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-[#212529] font-medium">{user.profile.full_name}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Email</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-[#212529] font-medium">{user.profile.email}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Role</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-[#212529] font-medium capitalize">{user.profile.role}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Voice Mode</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-[#212529] font-medium">{user.profile.prefers_voice ? 'Enabled' : 'Disabled'}</div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-[#212529] mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-[#212529]">Text-to-Speech</p>
              <p className="text-xs text-gray-400">AI tutor reads answers aloud</p>
            </div>
            <div className="w-10 h-6 rounded-full bg-gray-200 relative cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-[#212529]">Dark Mode</p>
              <p className="text-xs text-gray-400">Switch to dark theme</p>
            </div>
            <div className="w-10 h-6 rounded-full bg-gray-200 relative cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
);


// ─── Reusable Empty State ───
const EmptyState: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
      <span className="text-3xl">{icon}</span>
    </div>
    <h3 className="text-lg font-bold text-[#212529] mb-2">{title}</h3>
    <p className="text-[#6C757D] text-sm">{description}</p>
  </div>
);


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
