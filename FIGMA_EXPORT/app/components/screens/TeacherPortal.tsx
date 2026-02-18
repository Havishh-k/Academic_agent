import React, { useState } from 'react';
import { Upload, FileText, Users, BarChart2, Plus, Search, Filter, Download } from 'lucide-react';

export default function TeacherPortal() {
  const [activeTab, setActiveTab] = useState('Upload Materials');

  const students = [
    { name: 'Pranali Nikam', overall: '85%', weak: 'Neural Networks', lastActive: 'Today' },
    { name: 'Raj Sharma', overall: '72%', weak: 'Regression', lastActive: 'Yesterday' },
    { name: 'Priya Patel', overall: '68%', weak: 'Probability', lastActive: '2 days ago' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">Teacher Dashboard</h1>
          <p className="text-gray-500">Welcome, Dr. Pranali Nikam</p>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <div className="px-4 py-2 bg-blue-50 text-[#2B5797] rounded-lg border border-blue-100">
            Total Materials: 24
          </div>
          <div className="px-4 py-2 bg-purple-50 text-[#6264A7] rounded-lg border border-purple-100">
            Students: 58
          </div>
          <div className="px-4 py-2 bg-green-50 text-[#4CAF50] rounded-lg border border-green-100">
            Avg: 76%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 rounded-t-lg shadow-sm">
        {['Upload Materials', 'Quiz Generator', 'Student Reports', 'Analytics'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-[#2B5797] text-[#2B5797]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white p-8 rounded-b-lg shadow-sm border border-gray-100 min-h-[500px]">
        
        {activeTab === 'Upload Materials' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-2 border-dashed border-[#2B5797] bg-[#E8F0FE] rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-[#D0E1FD] transition-colors group">
              <div className="p-4 bg-white rounded-full mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Upload size={32} className="text-[#2B5797]" />
              </div>
              <h3 className="font-bold text-[#2B5797] text-lg">Click to Select File or Drag & Drop</h3>
              <p className="text-sm text-gray-500 mt-2">PDF, PPT, DOC, Excel, Images (Max 50MB)</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input type="text" placeholder="e.g., Chapter 1 - Introduction" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] outline-none bg-white">
                  <option>Machine Learning</option>
                  <option>Data Science</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea rows={4} placeholder="Brief description..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] outline-none"></textarea>
            </div>

            <button className="w-full py-3 bg-[#2B5797] text-white font-bold rounded-lg hover:bg-[#1a3a6e] transition-colors shadow-md">
              Upload Material
            </button>
          </div>
        )}

        {activeTab === 'Quiz Generator' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4 space-y-6 border-r border-gray-100 pr-8">
              <h3 className="font-bold text-[#212529] mb-4">Quiz Settings</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] outline-none bg-white">
                  <option>Machine Learning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] outline-none bg-white">
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Easy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                <input type="number" defaultValue={10} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] outline-none" />
              </div>
              <button className="w-full py-3 bg-[#6264A7] text-white font-bold rounded-lg hover:bg-[#4d4f8c] transition-colors shadow-md flex items-center justify-center gap-2">
                <Plus size={18} /> Generate Quiz with AI
              </button>
            </div>

            <div className="col-span-8 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#212529]">Preview</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Regenerate</button>
                  <button className="px-4 py-2 bg-[#2B5797] text-white rounded-lg text-sm hover:bg-[#1a3a6e]">Publish</button>
                </div>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                <p className="font-medium text-[#212529] mb-4">Q1: What is supervised learning?</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                    <input type="radio" name="q1" defaultChecked /> Labeled data
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                    <input type="radio" name="q1" /> Unlabeled data
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                    <input type="radio" name="q1" /> Reinforcement
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Student Reports' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-[300px]">
                <input type="text" placeholder="Search student..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5797]" />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} /> Download All Reports
              </button>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Overall</th>
                  <th className="py-3 px-4 font-medium">Weak Areas</th>
                  <th className="py-3 px-4 font-medium">Last Active</th>
                  <th className="py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#212529]">{student.name}</td>
                    <td className="py-3 px-4 font-bold text-[#2B5797]">{student.overall}</td>
                    <td className="py-3 px-4 text-[#D13438]">{student.weak}</td>
                    <td className="py-3 px-4 text-gray-500">{student.lastActive}</td>
                    <td className="py-3 px-4">
                      <button className="text-[#2B5797] hover:underline text-sm font-medium">View Report</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
