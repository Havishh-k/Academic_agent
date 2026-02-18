import React, { useState } from 'react';
import { Search, Filter, Download, Eye, FileText, File } from 'lucide-react';

export default function NotesScreen() {
  const [activeFilter, setActiveFilter] = useState('All Subjects');

  const notes = [
    { title: 'Chapter 1 - Introduction to ML', subject: 'Machine Learning', type: 'PDF', author: 'Dr. Sharma', date: 'Jan 15, 2026', views: 45, downloads: 23, color: 'bg-red-50 text-red-600' },
    { title: 'Python for Data Analysis', subject: 'Data Science', type: 'PPTX', author: 'Prof. Patil', date: 'Jan 20, 2026', views: 38, downloads: 18, color: 'bg-orange-50 text-orange-600' },
    { title: 'Matrix Operations', subject: 'Linear Algebra', type: 'PDF', author: 'Dr. Nikam', date: 'Jan 25, 2026', views: 52, downloads: 31, color: 'bg-red-50 text-red-600' },
    { title: 'Neural Networks Basics', subject: 'Deep Learning', type: 'DOCX', author: 'Prof. Rao', date: 'Feb 01, 2026', views: 22, downloads: 10, color: 'bg-blue-50 text-blue-600' },
    { title: 'Probability Distributions', subject: 'Statistics', type: 'PDF', author: 'Dr. Lee', date: 'Feb 05, 2026', views: 60, downloads: 40, color: 'bg-red-50 text-red-600' },
    { title: 'Hypothesis Testing', subject: 'Statistics', type: 'PPTX', author: 'Dr. Lee', date: 'Feb 08, 2026', views: 35, downloads: 15, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#212529]">Course Materials</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
             <input 
               type="text" 
               placeholder="Search notes..." 
               className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2B5797]"
             />
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 pb-4 overflow-x-auto border-b border-gray-200">
        {['All Subjects', 'Machine Learning', 'Data Science', 'Linear Algebra', 'Statistics'].map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter 
                ? 'bg-[#2B5797] text-white' 
                : 'bg-white text-[#495057] hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note, idx) => (
          <div key={idx} className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#2B5797] transition-all cursor-pointer overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${note.color}`}>
                  <FileText size={24} />
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase">{note.type}</span>
              </div>
              
              <h3 className="font-bold text-[#212529] mb-1 line-clamp-1">{note.title}</h3>
              <p className="text-sm text-[#2B5797] mb-4">{note.subject}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                <span>By {note.author}</span>
                <span>{note.date}</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1"><Eye size={14} /> {note.views}</div>
                <div className="flex items-center gap-1"><Download size={14} /> {note.downloads}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 py-1.5 bg-white border border-[#2B5797] text-[#2B5797] text-xs font-bold rounded hover:bg-[#E8F0FE]">
                View
              </button>
              <button className="flex-1 py-1.5 bg-[#2B5797] text-white text-xs font-bold rounded hover:bg-[#1a3a6e]">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
