import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Screen = 
  | 'LOGIN'
  | 'STUDENT_DASH'
  | 'SUBJECT_DASH'
  | 'AI_AGENT'
  | 'NOTES'
  | 'ASSIGNMENTS'
  | 'QUIZZES'
  | 'PERFORMANCE'
  | 'TEACHER_PORTAL'
  | 'HOD_PORTAL'
  | 'SETTINGS';

export interface NavigationContextType {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  userRole: 'student' | 'teacher' | 'hod';
  setUserRole: (role: 'student' | 'teacher' | 'hod') => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LOGIN');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'hod'>('student');

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  return (
    <NavigationContext.Provider value={{ 
      currentScreen, 
      navigateTo, 
      showLogoutModal, 
      setShowLogoutModal,
      userRole,
      setUserRole
    }}>
      {children}
    </NavigationContext.Provider>
  );
};
