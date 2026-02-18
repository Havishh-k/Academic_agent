import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, FileText, CheckSquare, BarChart2, AlertTriangle, Download, ChevronRight } from 'lucide-react';

const ProgressBar = ({ value, color = 'bg-[#2B5797]' }: { value: number, color?: string }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 1 }}
      className={`${color} h-full rounded-full relative`}
    />
  </div>
);

export default function SubjectDashboard() {
  const { navigateTo } = useNavigation();

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header & Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#6C757D] mb-4">
        <button onClick={() => navigateTo('STUDENT_DASH')} className="hover:text-[#2B5797] flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <span>|</span>
        <span className="font-semibold text-[#212529]">Artificial Intelligence</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#212529]">Artificial Intelligence</h1>
        <div className="flex gap-4">
           {/* Quick Stats */}
           <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
             <BarChart2 size={16} className="text-[#2B5797]" />
             <span className="text-sm font-bold text-[#212529]">Progress: 78%</span>
           </div>
           <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
             <BookOpen size={16} className="text-[#6264A7]" />
             <span className="text-sm font-bold text-[#212529]">Lectures: 12</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column: Chapters & Content */}
        <div className="col-span-8 space-y-8">
          
          {/* Chapters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#212529] mb-4">Course Chapters</h2>
            <div className="space-y-4">
              {[
                { name: 'Chapter 1: Introduction to AI', progress: 85, color: 'bg-[#2B5797]' },
                { name: 'Chapter 2: Search Algorithms', progress: 62, color: 'bg-[#6264A7]' },
                { name: 'Chapter 3: Knowledge Representation', progress: 45, color: 'bg-[#D13438]' },
                { name: 'Chapter 4: Neural Networks', progress: 38, color: 'bg-[#D13438]' },
                { name: 'Chapter 5: NLP', progress: 45, color: 'bg-[#D13438]' },
              ].map((chap, i) => (
                <div key={i} className="group p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => navigateTo('NOTES')}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-[#212529] group-hover:text-[#2B5797] transition-colors">{chap.name}</span>
                    <span className={`text-sm font-bold ${chap.progress < 50 ? 'text-[#D13438]' : 'text-[#2B5797]'}`}>{chap.progress}%</span>
                  </div>
                  <ProgressBar value={chap.progress} color={chap.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Assignments & Quizzes Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#212529]">Assignments</h3>
                <button className="text-xs text-[#2B5797]" onClick={() => navigateTo('ASSIGNMENTS')}>View All</button>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:border-[#2B5797] transition-colors" onClick={() => navigateTo('ASSIGNMENTS')}>
                  <p className="font-medium text-sm text-[#212529]">AI Assignment 1</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-[#D13438] font-medium">Due Feb 20</span>
                    <span className="text-xs bg-[#2B5797] text-white px-2 py-1 rounded-full">Submit</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:border-[#2B5797] transition-colors" onClick={() => navigateTo('ASSIGNMENTS')}>
                  <p className="font-medium text-sm text-[#212529]">Neural Networks Impl.</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-[#D13438] font-medium">Due Feb 25</span>
                    <span className="text-xs bg-[#2B5797] text-white px-2 py-1 rounded-full">Submit</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#212529]">Quizzes</h3>
                <button className="text-xs text-[#2B5797]" onClick={() => navigateTo('QUIZZES')}>View All</button>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:border-[#6264A7] transition-colors" onClick={() => navigateTo('QUIZZES')}>
                  <p className="font-medium text-sm text-[#212529]">AI Basics Quiz (10 Q)</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-[#4CAF50] font-medium">Avg 82%</span>
                    <span className="text-xs bg-[#6264A7] text-white px-2 py-1 rounded-full">Start</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:border-[#6264A7] transition-colors" onClick={() => navigateTo('QUIZZES')}>
                  <p className="font-medium text-sm text-[#212529]">Neural Networks Quiz</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-[#6C757D] font-medium">Avg 68%</span>
                    <span className="text-xs bg-[#6264A7] text-white px-2 py-1 rounded-full">Start</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Weak Areas & Notes */}
        <div className="col-span-4 space-y-6">
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#D13438]">
             <div className="flex items-center gap-2 mb-4 text-[#D13438]">
                <AlertTriangle size={20} />
                <h2 className="text-lg font-bold">Weak Areas</h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-sm text-[#D13438]">Neural Networks</span>
                    <span className="font-bold text-sm text-[#D13438]">38%</span>
                  </div>
                  <button onClick={() => navigateTo('AI_AGENT')} className="w-full mt-2 py-1.5 bg-white border border-[#D13438] text-[#D13438] text-xs font-medium rounded hover:bg-[#D13438] hover:text-white transition-colors">
                    Practice with AI
                  </button>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-sm text-[#D13438]">NLP</span>
                    <span className="font-bold text-sm text-[#D13438]">45%</span>
                  </div>
                  <button onClick={() => navigateTo('AI_AGENT')} className="w-full mt-2 py-1.5 bg-white border border-[#D13438] text-[#D13438] text-xs font-medium rounded hover:bg-[#D13438] hover:text-white transition-colors">
                    Practice with AI
                  </button>
                </div>
              </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold text-[#212529] mb-4">Course Notes</h2>
             <div className="space-y-3">
               <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => navigateTo('NOTES')}>
                 <div className="p-2 bg-red-100 text-red-600 rounded">
                   <FileText size={16} />
                 </div>
                 <div className="flex-1">
                   <p className="text-sm font-medium text-[#212529]">Unit 1 - Introduction</p>
                   <p className="text-xs text-gray-500">PDF • 45 views</p>
                 </div>
                 <button className="p-1 text-[#2B5797] hover:bg-blue-50 rounded"><Download size={16} /></button>
               </div>
               <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => navigateTo('NOTES')}>
                 <div className="p-2 bg-orange-100 text-orange-600 rounded">
                   <FileText size={16} />
                 </div>
                 <div className="flex-1">
                   <p className="text-sm font-medium text-[#212529]">Unit 2 - Search Algo</p>
                   <p className="text-xs text-gray-500">PPTX • 38 views</p>
                 </div>
                 <button className="p-1 text-[#2B5797] hover:bg-blue-50 rounded"><Download size={16} /></button>
               </div>
             </div>
             <button className="w-full mt-4 py-2 text-sm text-[#2B5797] font-medium border border-[#2B5797] rounded-full hover:bg-[#E8F0FE] transition-colors" onClick={() => navigateTo('NOTES')}>
               View All Materials
             </button>
          </div>

        </div>

      </div>

    </div>
  );
}
