import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShieldCheck, BookOpen, Mic, Smartphone, Clock } from 'lucide-react';

export default function LoginScreen() {
  const { navigateTo, setUserRole } = useNavigation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Simple logic for prototype:
    if (email.includes('teacher')) {
      setUserRole('teacher');
      navigateTo('TEACHER_PORTAL');
    } else if (email.includes('hod')) {
      setUserRole('hod');
      navigateTo('HOD_PORTAL');
    } else {
      setUserRole('student');
      navigateTo('STUDENT_DASH');
    }
  };

  const FeatureItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 bg-blue-100 rounded-lg text-[#2B5797]">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="font-semibold text-[#2B5797] text-sm">{title}</h4>
        <p className="text-xs text-gray-600">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Left Column (40%) */}
      <div className="w-[40%] bg-white p-12 flex flex-col border-r border-gray-200">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#2B5797] rounded flex items-center justify-center text-white font-bold text-lg">VSIT</div>
          <h1 className="text-2xl font-bold text-[#2B5797]">VSIT AI Academic Agent</h1>
        </div>

        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-xs font-bold inline-block w-fit mb-8">
          RE-ACCREDITED: GRADE 'A' BY NAAC
        </div>

        <div className="space-y-2">
          <FeatureItem icon={BookOpen} title="AI Academic Agent" desc="Personalized learning companion" />
          <FeatureItem icon={CheckCircle} title="Real-time Performance Tracking" desc="Know your strengths" />
          <FeatureItem icon={Mic} title="Voice-First Interaction" desc="Accessible for all users" />
          <FeatureItem icon={ShieldCheck} title="Faculty-Approved Content" desc="All notes in one place" />
          <FeatureItem icon={Clock} title="Secure OTP Verification" desc="Enhanced security" />
          <FeatureItem icon={Smartphone} title="Multi-Device Support" desc="Learn anywhere" />
        </div>

        <div className="mt-auto text-xs text-gray-400">
          © 2026 Vidyalankar School of Information Technology
        </div>
      </div>

      {/* Right Column (60%) */}
      <div className="w-[60%] flex items-center justify-center bg-[#F8F9FA] relative">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[480px]">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button 
              className={`flex-1 pb-4 font-semibold text-center ${activeTab === 'login' ? 'text-[#2B5797] border-b-2 border-[#2B5797]' : 'text-gray-400'}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button 
              className={`flex-1 pb-4 font-semibold text-center ${activeTab === 'register' ? 'text-[#2B5797] border-b-2 border-[#2B5797]' : 'text-gray-400'}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.div 
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VSIT Email ID</label>
                  <input 
                    type="email" 
                    placeholder="student@vsit.edu.in" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] focus:border-transparent outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] focus:border-transparent outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="text-right">
                  <button className="text-sm text-[#2B5797] hover:underline">Forgot password?</button>
                </div>
                
                <button 
                  onClick={handleLogin}
                  className="w-full bg-[#2B5797] text-white py-3 rounded-full font-semibold hover:bg-[#1a3a6e] transition-colors"
                >
                  Login to Portal
                </button>

                {/* Helper for prototype */}
                <div className="mt-4 text-xs text-gray-400 text-center flex gap-2 justify-center">
                  <span className="cursor-pointer hover:text-blue-500" onClick={() => { setEmail('student@vsit.edu.in'); setPassword('123'); }}>Demo Student</span>
                  |
                  <span className="cursor-pointer hover:text-blue-500" onClick={() => { setEmail('teacher@vsit.edu.in'); setPassword('123'); }}>Demo Teacher</span>
                  |
                  <span className="cursor-pointer hover:text-blue-500" onClick={() => { setEmail('hod@vsit.edu.in'); setPassword('123'); }}>Demo HOD</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2B5797]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2B5797]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email (@vsit.edu.in)</label>
                  <input type="email" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2B5797]" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2B5797]">
                      <option>CS</option>
                      <option>IT</option>
                      <option>DS</option>
                      <option>AIDS</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2B5797]">
                      <option>1st</option>
                      <option>2nd</option>
                      <option>3rd</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2B5797]" />
                </div>
                
                <button 
                  onClick={() => setShowOtpModal(true)}
                  className="w-full bg-[#2B5797] text-white py-3 rounded-full font-semibold hover:bg-[#1a3a6e] transition-colors mt-2"
                >
                  Create Account
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-[400px] p-8 text-center animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-[#212529] mb-2">Email Verification</h3>
              <p className="text-gray-500 mb-6">Enter 6-digit code sent to your email</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5,6].map(i => (
                  <input key={i} type="text" maxLength={1} className="w-10 h-10 border border-gray-300 rounded text-center text-lg focus:ring-2 focus:ring-[#2B5797] outline-none" />
                ))}
              </div>
              
              <div className="text-sm text-gray-500 mb-6">Time remaining: <span className="font-bold text-[#D13438]">04:59</span></div>
              
              <div className="flex gap-4">
                <button onClick={() => setShowOtpModal(false)} className="flex-1 py-2 border border-gray-300 rounded-full text-gray-600">Cancel</button>
                <button onClick={() => { setShowOtpModal(false); setActiveTab('login'); }} className="flex-1 py-2 bg-[#2B5797] text-white rounded-full">Verify</button>
              </div>
              
              <button className="block w-full mt-4 text-xs text-[#2B5797] hover:underline">Resend OTP</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
