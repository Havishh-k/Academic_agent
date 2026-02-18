import React, { useState } from 'react';
import { Users, BookOpen, BarChart2, CheckSquare, Settings, AlertTriangle, FileText, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HodPortal() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const teachers = [
    { name: 'Dr. Sharma', dept: 'AI & DS', classes: 4, perf: '85%', status: 'Active', color: 'bg-green-100 text-green-800' },
    { name: 'Prof. Patil', dept: 'ML', classes: 3, perf: '72%', status: 'Active', color: 'bg-green-100 text-green-800' },
    { name: 'Dr. Nikam', dept: 'Data Science', classes: 3, perf: '68%', status: 'Active', color: 'bg-green-100 text-green-800' },
    { name: 'Prof. Kulkarni', dept: 'Statistics', classes: 2, perf: '82%', status: 'On Leave', color: 'bg-yellow-100 text-yellow-800' },
  ];

  const gapData = [
    { name: 'Neural Networks', Mastery: 62, Gap: 38 },
    { name: 'NLP', Mastery: 68, Gap: 32 },
    { name: 'Deep Learning', Mastery: 55, Gap: 45 },
    { name: 'Probability', Mastery: 72, Gap: 28 },
    { name: 'Linear Algebra', Mastery: 78, Gap: 22 },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">Department Dashboard</h1>
          <p className="text-gray-500">Dr. Sharma (Head of Department)</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4 border-r border-gray-200 last:border-0">
            <div className="text-2xl font-bold text-[#2B5797]">12</div>
            <div className="text-xs text-gray-500">Teachers</div>
          </div>
          <div className="text-center px-4 border-r border-gray-200 last:border-0">
            <div className="text-2xl font-bold text-[#6264A7]">350</div>
            <div className="text-xs text-gray-500">Students</div>
          </div>
          <div className="text-center px-4 border-r border-gray-200 last:border-0">
            <div className="text-2xl font-bold text-[#4CAF50]">78%</div>
            <div className="text-xs text-gray-500">Avg Perf</div>
          </div>
          <div className="text-center px-4 border-r border-gray-200 last:border-0">
            <div className="text-2xl font-bold text-[#D13438]">8</div>
            <div className="text-xs text-gray-500">Courses</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Main Content */}
        <div className="col-span-8 space-y-8">
          
          {/* Teacher Activity Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#212529] mb-4">Teacher Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Dept</th>
                    <th className="py-3 px-4">Classes</th>
                    <th className="py-3 px-4">Avg Perf</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {teachers.map((teacher, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#212529]">{teacher.name}</td>
                      <td className="py-3 px-4 text-gray-500">{teacher.dept}</td>
                      <td className="py-3 px-4 text-gray-500">{teacher.classes}</td>
                      <td className="py-3 px-4 font-bold text-[#2B5797]">{teacher.perf}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${teacher.color}`}>
                          {teacher.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-[#2B5797] hover:underline font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Curriculum Gap Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#212529]">Curriculum Gap Analysis</h3>
              <div className="flex items-center gap-2 text-xs font-medium text-[#D13438] bg-red-50 px-2 py-1 rounded border border-red-100">
                <AlertTriangle size={12} />
                Critical Gaps Detected
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gapData} layout="vertical" barGap={2} margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E9ECEF" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fill: '#495057', fontSize: 11}} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="Mastery" fill="#4CAF50" name="Mastery Level" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="Gap" fill="#D13438" name="Knowledge Gap" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-6">
          
          {/* Approval Queue */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#212529]">Content Approvals</h3>
              <span className="bg-[#D13438] text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
            </div>
            <div className="space-y-4">
              {[
                { title: 'ML_Chapter5.pptx', author: 'Dr. Patil', date: 'Feb 15', type: 'PPTX' },
                { title: 'AI_Assignment3.pdf', author: 'Prof. Sharma', date: 'Feb 16', type: 'PDF' },
                { title: 'Quiz_NeuralNetworks', author: 'Dr. Nikam', date: 'Feb 17', type: 'QUIZ' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-[#2B5797] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#2B5797]" />
                      <span className="font-bold text-sm text-[#212529] line-clamp-1">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-200 px-1 rounded">{item.type}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Submitted by {item.author} • {item.date}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-white border border-gray-300 text-gray-600 text-xs font-bold rounded hover:bg-gray-100">Preview</button>
                    <button className="flex-1 py-1.5 bg-[#2B5797] text-white text-xs font-bold rounded hover:bg-[#1a3a6e]">Approve</button>
                    <button className="flex-1 py-1.5 bg-white border border-[#D13438] text-[#D13438] text-xs font-bold rounded hover:bg-red-50">Reject</button>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 text-sm text-[#2B5797] font-medium hover:underline text-center">
                View All Pending Approvals
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
