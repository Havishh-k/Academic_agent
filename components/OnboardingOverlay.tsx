import React, { useState } from 'react';
import { UserRole } from '../types';

interface OnboardingOverlayProps {
  role: UserRole;
  onComplete: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ role, onComplete }) => {
  const [step, setStep] = useState(0);

  const studentSteps = [
    {
      title: "Welcome to CS101",
      description: "Your dedicated AI learning companion is here to help you master the course material.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-primary-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.221 69.14 69.14 0 00-2.923.295m-15.529 0c.795.077 1.59.19 2.373.322m15.529 0c-.795.077-1.59.19-2.373.322m0 0A50.53 50.53 0 0012 20.904a50.53 50.53 0 0010.742-3.75 60.461 60.461 0 00-.491-6.347m-15.483 0c.261 1.043.57 2.057.915 3.033m15.528 0c-.261 1.043-.57 2.057-.915 3.033" />
        </svg>
      )
    },
    {
      title: "Strictly Syllabus-Based",
      description: "I only know what's in the course documents. This ensures you stay focused on relevant material without getting distracted by outside information.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-primary-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3.033.515-1.096.375-1.966 1.136-2.165 2.23-.271 1.481.198 3.486 1.415 5.565.637 1.088 1.42 2.152 2.296 3.072.115.12.181.282.181.449v1.433c0 1.509 1.168 2.766 2.673 2.875 1.488.109 2.889.47 4.155 1.032.417.185.895-.084 1.026-.522.09-.302.046-.628-.109-.89l-1.002-1.785a2.25 2.25 0 01.378-2.673c.725-.668 1.428-1.353 2.096-2.055.918-.962 1.637-2.03 2.124-3.18.528-1.246.8-2.585.8-3.955a.75.75 0 00-.75-.75h-.75c-.414 0-.75.336-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V6.042z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      )
    },
    {
      title: "Guided Learning",
      description: "I won't just give you the answers. I'll help you think through problems step-by-step to build your understanding.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-primary-600">
           <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      )
    }
  ];

  const facultySteps = [
    {
      title: "Faculty Control Center",
      description: "Welcome to your command center for CS101. Monitor and guide the AI agent's interactions with your students.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-amber-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      )
    },
    {
      title: "Curriculum Insights",
      description: "Analyze where students are struggling. The agent identifies gaps between the syllabus and student questions.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-amber-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      )
    },
    {
      title: "Misconception Detection",
      description: "Get reports on common misunderstandings to adjust your lectures and materials for future classes.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-amber-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      )
    }
  ];

  const steps = role === UserRole.STUDENT ? studentSteps : facultySteps;
  const currentStepData = steps[step];
  const isLastStep = step === steps.length - 1;

  const buttonBg = role === UserRole.STUDENT ? 'bg-primary-600 hover:bg-primary-700' : 'bg-amber-600 hover:bg-amber-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-academic-900/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border border-white/20">
        <div className="p-6 md:p-8 text-center flex flex-col items-center">
            <div key={step} className="animate-fade-in flex flex-col items-center w-full">
                <div className={`w-24 h-24 rounded-full bg-academic-50 flex items-center justify-center mb-6`}>
                    {currentStepData.icon}
                </div>
                
                <h2 className="text-2xl font-serif font-bold text-academic-900 mb-4">{currentStepData.title}</h2>
                <p className="text-academic-600 mb-8 leading-relaxed h-20">{currentStepData.description}</p>
            </div>
            
            <div className="flex justify-center gap-2 mb-8">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-2 rounded-full transition-all duration-300 ${i === step ? `w-8 ${role === UserRole.STUDENT ? 'bg-primary-500' : 'bg-amber-500'}` : 'w-2 bg-academic-200'}`}
                    />
                ))}
            </div>

            <button
                onClick={() => {
                    if (isLastStep) {
                        onComplete();
                    } else {
                        setStep(step + 1);
                    }
                }}
                className={`w-full py-3.5 px-6 rounded-xl text-white font-semibold transition-all shadow-lg shadow-academic-900/10 active:scale-95 ${buttonBg}`}
            >
                {isLastStep ? "Get Started" : "Next"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;