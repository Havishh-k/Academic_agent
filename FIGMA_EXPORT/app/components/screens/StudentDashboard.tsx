import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { motion } from 'framer-motion';
import { Play, AlertTriangle, Clock, TrendingUp, ChevronRight, FileText, CheckCircle } from 'lucide-react';

const ProgressBar = ({ value, color = 'bg-[#2B5797]', height = 'h-2' }: { value: number, color?: string, height?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`${color} h-full rounded-full relative`}
    >
      <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
    </motion.div>
  </div>
);

export default function StudentDashboard() {
  const { navigateTo } = useNavigation();

  const subjects = [
    { name: 'Data Science', progress: 75, color: 'bg-[#2B5797]' },
    { name: 'Machine Learning', progress: 60, color: 'bg-[#6264A7]' },
    { name: 'Python Programming', progress: 90, color: 'bg-[#4CAF50]' },
    { name: 'Statistics', progress: 45, color: 'bg-[#D13438]' },
    { name: 'Linear Algebra', progress: 68, color: 'bg-[#2B5797]' },
    { name: 'Testing of Hypothesis', progress: 72, color: 'bg-[#6264A7]' },
  ];

  const weakAreas = [
    { topic: 'Neural Networks', score: 45 },
    { topic: 'Regression Analysis', score: 52 },
    { topic: 'Probability', score: 38 },
    { topic: 'SQL Optimization', score: 58 },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">Welcome back, Pranali!</h1>
          <p className="text-[#495057] mt-1">Your AI Academic Agent is ready to help you learn better</p>
        </div>
        <button 
          onClick={() => navigateTo('AI_AGENT')}
          className="flex items-center gap-2 px-6 py-3 border-2 border-[#6264A7] text-[#6264A7] rounded-full font-medium hover:bg-[#6264A7] hover:text-white transition-all group"
        >
          <div className="p-1 bg-[#6264A7] text-white rounded-full group-hover:bg-white group-hover:text-[#6264A7] transition-colors">
            <Play size={12} fill="currentColor" />
          </div>
          Talk to AI Assistant
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo('PERFORMANCE')}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-[#2B5797] rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-2xl font-bold text-[#2B5797]">85%</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Overall Progress</p>
          <div className="mt-2 text-xs text-green-600 font-medium">↑ 12% vs last month</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-[#6264A7] rounded-lg"><CheckCircle size={20} /></div>
            <span className="text-2xl font-bold text-[#6264A7]">12</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Strong Chapters</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 text-[#D13438] rounded-lg"><AlertTriangle size={20} /></div>
            <span className="text-2xl font-bold text-[#D13438]">5</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Weak Chapters</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-[#4CAF50] rounded-lg"><Clock size={20} /></div>
            <span className="text-2xl font-bold text-[#4CAF50]">24h</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Study Time</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Subject Progress */}
        <div className="col-span-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#212529]">Subject Progress</h2>
            <button className="text-sm text-[#2B5797] font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-5">
            {subjects.map((sub, idx) => (
              <div 
                key={idx} 
                className="group cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2 transition-colors"
                onClick={() => navigateTo('SUBJECT_DASH')}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[#212529] group-hover:text-[#2B5797] transition-colors">{sub.name}</span>
                  <span className="font-bold text-gray-500">{sub.progress}%</span>
                </div>
                <ProgressBar value={sub.progress} color={sub.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#D13438]">
            <div className="flex items-center gap-2 mb-4 text-[#D13438]">
              <AlertTriangle size={20} />
              <h2 className="text-lg font-bold">Weak Areas</h2>
            </div>
            <div className="space-y-4">
              {weakAreas.map((area, idx) => (
                <div key={idx} className="pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-[#212529]">{area.topic}</span>
                    <span className="text-xs font-bold text-[#D13438]">{area.score}%</span>
                  </div>
                  <button 
                    onClick={() => navigateTo('AI_AGENT')}
                    className="mt-2 w-full py-1.5 text-xs font-medium text-[#2B5797] bg-[#E8F0FE] rounded hover:bg-[#D0E1FD] transition-colors flex items-center justify-center gap-1"
                  >
                    Practice with AI <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assignments & Activity */}
      <div className="grid grid-cols-12 gap-8">
        {/* Assignments Overview */}
        <div className="col-span-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#212529]">Assignments Due Soon</h2>
            <button className="text-sm text-[#2B5797] font-medium hover:underline" onClick={() => navigateTo('ASSIGNMENTS')}>View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="min-w-[280px] bg-white p-5 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:border-[#2B5797] transition-colors group"
                onClick={() => navigateTo('ASSIGNMENTS')}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-[#2B5797] group-hover:text-white transition-colors">
                    <FileText size={20} />
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full">PENDING</span>
                </div>
                <h3 className="font-bold text-[#212529] mb-1 line-clamp-1">Neural Networks Implementation</h3>
                <p className="text-xs text-gray-500 mb-4">Machine Learning</p>
                <div className="flex items-center text-xs text-[#D13438] font-medium">
                  <Clock size={12} className="mr-1" /> Due: Feb 20, 11:59 PM
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
           <h2 className="text-lg font-bold text-[#212529] mb-4">Recent Activity</h2>
           <div className="space-y-4">
             <div className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
               <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
               <div>
                 <p className="text-sm font-medium text-[#212529]">Completed ML Quiz</p>
                 <p className="text-xs text-gray-500">Score 85% • 2 hours ago</p>
               </div>
             </div>
             <div className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
               <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
               <div>
                 <p className="text-sm font-medium text-[#212529]">Assignment Submitted</p>
                 <p className="text-xs text-gray-500">Data Science • 5 hours ago</p>
               </div>
             </div>
             <div className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
               <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 shrink-0" />
               <div>
                 <p className="text-sm font-medium text-[#212529]">AI Tutoring Session</p>
                 <p className="text-xs text-gray-500">Probability • Yesterday</p>
               </div>
             </div>
           </div>
        </div>
      </div>

    </div>
  );
}
