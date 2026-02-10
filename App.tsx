import React, { useState, useRef, useEffect } from 'react';
import { Message, UserRole } from './types';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import OnboardingOverlay from './components/OnboardingOverlay';
import { sendMessageToAgent } from './services/geminiService';

const STUDENT_QUICK_ACTIONS = [
  {
    label: "Syllabus Overview",
    description: "Get a summary of the course structure and goals.",
    prompt: "Please provide an overview of the CS101 syllabus and the main topics covered.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3.033.515-1.096.375-1.966 1.136-2.165 2.23-.271 1.481.198 3.486 1.415 5.565.637 1.088 1.42 2.152 2.296 3.072.115.12.181.282.181.449v1.433c0 1.509 1.168 2.766 2.673 2.875 1.488.109 2.889.47 4.155 1.032.417.185.895-.084 1.026-.522.09-.302.046-.628-.109-.89l-1.002-1.785a2.25 2.25 0 01.378-2.673c.725-.668 1.428-1.353 2.096-2.055.918-.962 1.637-2.03 2.124-3.18.528-1.246.8-2.585.8-3.955a.75.75 0 00-.75-.75h-.75c-.414 0-.75.336-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V6.042z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    )
  },
  {
    label: "Explain Concepts",
    description: "Clarify complex topics like loops or arrays.",
    prompt: "I am having trouble understanding the concept of 'Nested Loops' from Unit IV. Can you explain it simply?",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 2.625a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM12 5.5v2.25" />
      </svg>
    )
  },
  {
    label: "Algorithm Design",
    description: "Help with flowcharts and pseudocode logic.",
    prompt: "I need to design an algorithm to find the largest number in a list. How should I approach this using pseudocode?",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    label: "Debugging Help",
    description: "Identify logical errors in your code structure.",
    prompt: "My 'if-else' statement isn't working as expected. What are common logical errors I should look for according to the lecture notes?",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    )
  }
];

const FACULTY_QUICK_ACTIONS = [
  {
    label: "Gap Analysis",
    description: "Identify potential curriculum gaps between units.",
    prompt: "Based on the provided syllabus and lecture notes, identify potential gaps where students might struggle with the transition from 'Unit III: Programming Fundamentals' to 'Unit IV: Control Structures'.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    )
  },
  {
    label: "Generate Quiz",
    description: "Create assessment materials for specific units.",
    prompt: "Generate a 3-question short conceptual quiz for 'Unit II: Problem Solving and Algorithms' to test student understanding of flowcharts and pseudocode.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    )
  },
  {
    label: "Misconception Report",
    description: "List common student pitfalls in recent topics.",
    prompt: "List 3 common misconceptions students often have when learning about 'Arrays and Strings' in Unit V, based on the complexity of the material.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
      </svg>
    )
  },
  {
    label: "Lesson Plan Helper",
    description: "Create an outline for Week 4 lectures.",
    prompt: "Create a lesson plan outline for 'Week 4: Programming Basics' based on the lecture notes, including 2 suggested interactive activities.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008z" />
      </svg>
    )
  }
];

const App: React.FC = () => {
  const [hasSelectedPortal, setHasSelectedPortal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.STUDENT);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const enterPortal = (role: UserRole) => {
    setUserRole(role);
    setHasSelectedPortal(true);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: userRole === UserRole.STUDENT 
            ? "Welcome to the **CS101 Student Portal**! 🎓\n\nI am your Academic Agent, here to guide you through the course material. I can help you with:\n\n*   **Concept Clarification:** Understanding difficult topics.\n*   **Algorithm Design:** Creating flowcharts and pseudocode.\n*   **Syllabus Navigation:** Finding relevant lecture notes and chapters.\n\n*Select a quick action below or type your question to get started.*"
            : "Welcome to the **CS101 Faculty Portal**. I am your Academic Agent.\n\nI am ready to assist with curriculum analysis, gap detection, and student misconception insights based on the course knowledge base.\n\n*Select a faculty tool below or type your query.*",
          timestamp: Date.now(),
        },
    ]);
  };

  const exitPortal = () => {
    setHasSelectedPortal(false);
    setShowOnboarding(false);
    setMessages([]);
    setInput('');
    setIsSidebarOpen(false);
  };

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
    }

    const updatedMessages = [...messages, userMessage];

    try {
      const responseText = await sendMessageToAgent(updatedMessages, userRole);
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  // Landing Screen
  if (!hasSelectedPortal) {
    return (
      <div className="min-h-screen bg-academic-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-primary-100 overflow-y-auto">
        <div className="max-w-4xl w-full animate-fade-in my-auto py-10">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-academic-800 to-academic-900 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-academic-900/20 mb-6 transform hover:scale-105 transition-transform duration-300">
              <span className="text-3xl font-serif font-bold text-white">CS</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-academic-900 mb-4 tracking-tight">CS101 Academic Agent</h1>
            <p className="text-lg text-academic-600 max-w-2xl mx-auto leading-relaxed">
              Your governed AI companion for Computer Science 101. Select a portal to access tailored resources and tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Student Portal Card */}
            <button 
              onClick={() => enterPortal(UserRole.STUDENT)}
              className="group bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-academic-100 hover:border-primary-400 hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500 ease-out opacity-50"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.221 69.14 69.14 0 00-2.923.295m-15.529 0c.795.077 1.59.19 2.373.322m15.529 0c-.795.077-1.59.19-2.373.322m0 0A50.53 50.53 0 0012 20.904a50.53 50.53 0 0010.742-3.75 60.461 60.461 0 00-.491-6.347m-15.483 0c.261 1.043.57 2.057.915 3.033m15.528 0c-.261 1.043-.57 2.057-.915 3.033" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-academic-900 mb-2 group-hover:text-primary-700 transition-colors">Student Portal</h3>
                <p className="text-academic-500 mb-6 leading-relaxed">
                  Access verified syllabus content, get help with assignments, and clarify concepts with your AI tutor.
                </p>
                <div className="flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Enter Portal <span className="ml-2">→</span>
                </div>
              </div>
            </button>

            {/* Faculty Portal Card */}
            <button 
              onClick={() => enterPortal(UserRole.FACULTY)}
              className="group bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-academic-100 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500 ease-out opacity-50"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-academic-900 mb-2 group-hover:text-amber-700 transition-colors">Faculty Portal</h3>
                <p className="text-academic-500 mb-6 leading-relaxed">
                  Review curriculum gaps, analyze student interaction patterns, and access instructor-only insights.
                </p>
                <div className="flex items-center text-amber-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Enter Portal <span className="ml-2">→</span>
                </div>
              </div>
            </button>
          </div>
          
          <div className="mt-12 text-center">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-academic-200 text-xs font-medium text-academic-400 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Operational • v1.4.0
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="flex h-[100dvh] w-full bg-academic-50 overflow-hidden font-sans">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <OnboardingOverlay role={userRole} onComplete={handleOnboardingComplete} />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full relative min-w-0">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-academic-100 z-10 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-academic-500 hover:bg-academic-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-serif font-bold shadow-lg shadow-academic-900/10 ${
                    userRole === UserRole.FACULTY ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 'bg-gradient-to-br from-academic-700 to-academic-900'
                }`}>
                    <span className="text-sm">CS</span>
                </div>
                <div>
                    <h1 className="font-serif font-bold text-academic-900 text-base md:text-lg leading-none mb-1">
                        {userRole === UserRole.FACULTY ? 'Faculty Portal' : 'Student Portal'}
                    </h1>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${userRole === UserRole.FACULTY ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                        <p className="text-[10px] text-academic-500 font-semibold uppercase tracking-wider">CS101 Agent Active</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={exitPortal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent text-sm font-medium text-academic-500 hover:text-academic-800 hover:bg-academic-50 transition-colors"
                title="Exit Portal"
             >
                <span className="hidden sm:inline">Exit Portal</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
             </button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 bg-academic-50/50 scroll-smooth">
          <div className="max-w-3xl mx-auto pb-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {/* Quick Access for Students */}
            {userRole === UserRole.STUDENT && messages.length === 1 && !isLoading && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-6 animate-slide-in px-2">
                  {STUDENT_QUICK_ACTIONS.map(action => (
                      <button 
                          key={action.label}
                          onClick={() => handleSend(action.prompt)}
                          className="text-left p-4 rounded-xl bg-white border border-academic-200 hover:border-primary-400 hover:shadow-md transition-all group"
                      >
                          <div className="flex items-center gap-3 mb-2">
                              <span className="p-2 rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                  {action.icon}
                              </span>
                              <h3 className="font-semibold text-academic-800">{action.label}</h3>
                          </div>
                          <p className="text-xs text-academic-500">{action.description}</p>
                      </button>
                  ))}
               </div>
            )}

            {/* Quick Access for Faculty */}
            {userRole === UserRole.FACULTY && messages.length === 1 && !isLoading && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-6 animate-slide-in px-2">
                  {FACULTY_QUICK_ACTIONS.map(action => (
                      <button 
                          key={action.label}
                          onClick={() => handleSend(action.prompt)}
                          className="text-left p-4 rounded-xl bg-white border border-academic-200 hover:border-amber-400 hover:shadow-md transition-all group"
                      >
                          <div className="flex items-center gap-3 mb-2">
                              <span className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                  {action.icon}
                              </span>
                              <h3 className="font-semibold text-academic-800">{action.label}</h3>
                          </div>
                          <p className="text-xs text-academic-500">{action.description}</p>
                      </button>
                  ))}
               </div>
            )}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex w-full gap-3 mb-6 animate-fade-in mt-4">
                 <div className="shrink-0 w-8 h-8 rounded-full bg-white border border-academic-200 flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-600 animate-pulse">
                        <path d="M11.25 4.533A9.707 9.707 0 006 3.75a9.753 9.753 0 00-3.182 17.039c-.97-1.659-1.429-3.497-1.318-5.344.055-.929.67-1.761 1.604-1.761.641 0 1.25.166 1.782.47a1.867 1.867 0 002.046-.07c1.1-.703.111-2.28-.96-2.583a2.66 2.66 0 00-3.07 1.692 2.635 2.635 0 00.17 1.637c.75.39 1.13.914 1.146 1.488.004 1.345-1.295 1.543-1.65 1.472-.656-.131-1.22-.524-1.57-1.07A11.25 11.25 0 0112 2.25c6.213 0 11.25 5.037 11.25 11.25S18.213 24.75 12 24.75c-3.792 0-7.153-1.879-9.268-4.789a.75.75 0 00-1.144.975A12.72 12.72 0 0012 26.25c7.042 0 12.75-5.708 12.75-12.75S19.042.75 12 .75z" />
                        <path d="M14.25 9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                 </div>
                 <div className="bg-white border border-academic-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5 h-10">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <div className="shrink-0 p-4 md:p-6">
            <div className="max-w-3xl mx-auto relative">
                <div className={`bg-white rounded-2xl border shadow-xl shadow-academic-900/5 transition-all p-3 flex items-end gap-2 overflow-hidden ${
                    userRole === UserRole.FACULTY 
                    ? 'border-amber-200 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500' 
                    : 'border-academic-200 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500'
                }`}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={adjustTextareaHeight}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask a question as a ${userRole === UserRole.STUDENT ? 'student' : 'faculty member'}...`}
                        className="w-full resize-none border-0 bg-transparent py-2 px-2 text-academic-900 placeholder:text-academic-300 focus:ring-0 sm:text-base sm:leading-6 max-h-[150px] min-h-[44px]"
                        rows={1}
                        style={{ overflowY: input.length > 200 ? 'auto' : 'hidden' }}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 ${
                            userRole === UserRole.FACULTY 
                            ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' 
                            : 'bg-academic-800 hover:bg-primary-600 focus:ring-primary-500'
                        }`}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 translate-x-0.5 -translate-y-0.5">
                                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="text-center mt-3">
                    <p className="text-[10px] text-academic-400 font-medium">
                        Strictly adheres to CS101 Syllabus • AI can make mistakes
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;