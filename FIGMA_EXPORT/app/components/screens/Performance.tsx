import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, ChevronRight, Download } from 'lucide-react';

const data = [
  { name: 'Sep', ML: 65, DS: 55, LA: 60, Stats: 40 },
  { name: 'Oct', ML: 70, DS: 62, LA: 65, Stats: 42 },
  { name: 'Nov', ML: 72, DS: 65, LA: 62, Stats: 45 },
  { name: 'Dec', ML: 78, DS: 68, LA: 64, Stats: 44 },
  { name: 'Jan', ML: 82, DS: 70, LA: 66, Stats: 46 },
  { name: 'Feb', ML: 85, DS: 75, LA: 68, Stats: 45 },
];

const conceptData = [
  { name: 'Neural Networks', Mastery: 45, Misconception: 20 },
  { name: 'Regression', Mastery: 52, Misconception: 15 },
  { name: 'Probability', Mastery: 38, Misconception: 25 },
  { name: 'Matrices', Mastery: 68, Misconception: 10 },
  { name: 'Hypothesis', Mastery: 72, Misconception: 5 },
];

export default function PerformanceScreen() {
  const { navigateTo } = useNavigation();

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#212529]">My Performance</h1>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 text-[#495057]">
          <Download size={16} /> Download Report
        </button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Current GPA</p>
            <h2 className="text-3xl font-bold text-[#2B5797]">3.4<span className="text-lg text-gray-400">/4.0</span></h2>
          </div>
          <div className="p-3 bg-blue-50 text-[#2B5797] rounded-full"><TrendingUp size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Overall Score</p>
            <h2 className="text-3xl font-bold text-[#6264A7]">85%</h2>
          </div>
          <div className="p-3 bg-purple-50 text-[#6264A7] rounded-full"><TrendingUp size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Class Rank</p>
            <h2 className="text-3xl font-bold text-[#4CAF50]">#12</h2>
          </div>
          <div className="p-3 bg-green-50 text-[#4CAF50] rounded-full"><TrendingUp size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Attendance</p>
            <h2 className="text-3xl font-bold text-[#D13438]">92%</h2>
          </div>
          <div className="p-3 bg-red-50 text-[#D13438] rounded-full"><TrendingUp size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Main Chart */}
        <div className="col-span-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#212529] mb-6">Subject Performance Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECEF" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6C757D', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6C757D', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="ML" stroke="#2B5797" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="DS" stroke="#6264A7" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="LA" stroke="#4CAF50" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="Stats" stroke="#D13438" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weak Areas */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#D13438]">
             <div className="flex items-center gap-2 mb-4 text-[#D13438]">
                <AlertTriangle size={20} />
                <h2 className="text-lg font-bold">Priority Focus Areas</h2>
              </div>
              <div className="space-y-4">
                {['Neural Networks', 'Regression Analysis', 'Probability'].map((area, idx) => (
                  <div key={idx} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-[#212529]">{area}</span>
                      <span className="text-xs font-bold text-[#D13438]">{[45, 52, 38][idx]}%</span>
                    </div>
                    <button 
                      onClick={() => navigateTo('AI_AGENT')}
                      className="mt-2 w-full py-1.5 text-xs font-medium text-[#2B5797] bg-[#E8F0FE] rounded hover:bg-[#D0E1FD] transition-colors flex items-center justify-center gap-1"
                    >
                      Generate Practice Quiz <ChevronRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Concept Mastery Chart */}
        <div className="col-span-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
           <h3 className="font-bold text-[#212529] mb-6">Concept Mastery vs Misconceptions</h3>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={conceptData} layout="vertical" barGap={2}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E9ECEF" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={100} tick={{fill: '#495057', fontSize: 11}} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Legend />
                 <Bar dataKey="Mastery" fill="#2B5797" radius={[0, 4, 4, 0]} barSize={12} />
                 <Bar dataKey="Misconception" fill="#D13438" radius={[0, 4, 4, 0]} barSize={12} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Grades Table */}
        <div className="col-span-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
           <h3 className="font-bold text-[#212529] mb-6">Recent Assignment Grades</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500 font-medium">
                 <tr>
                   <th className="px-4 py-3 rounded-l-lg">Assignment</th>
                   <th className="px-4 py-3">Subject</th>
                   <th className="px-4 py-3">Grade</th>
                   <th className="px-4 py-3 rounded-r-lg">Feedback</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
                   <td className="px-4 py-3 font-medium text-[#212529]">ML Assignment 1</td>
                   <td className="px-4 py-3 text-gray-500">ML</td>
                   <td className="px-4 py-3 font-bold text-[#4CAF50]">85%</td>
                   <td className="px-4 py-3 text-gray-500 italic">"Good work"</td>
                 </tr>
                 <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
                   <td className="px-4 py-3 font-medium text-[#212529]">DS Project</td>
                   <td className="px-4 py-3 text-gray-500">DS</td>
                   <td className="px-4 py-3 font-bold text-[#4CAF50]">90%</td>
                   <td className="px-4 py-3 text-gray-500 italic">"Excellent"</td>
                 </tr>
                 <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
                   <td className="px-4 py-3 font-medium text-[#212529]">Stats Quiz</td>
                   <td className="px-4 py-3 text-gray-500">Stats</td>
                   <td className="px-4 py-3 font-bold text-[#D13438]">65%</td>
                   <td className="px-4 py-3 text-gray-500 italic">"Review Ch 3"</td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>

      </div>

    </div>
  );
}
