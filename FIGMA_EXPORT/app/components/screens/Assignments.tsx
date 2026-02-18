import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, FileText, ChevronDown, Download, Upload } from 'lucide-react';

type Assignment = {
  id: number;
  course: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Missing' | 'Not Started' | 'Completed';
  color: string;
};

export default function AssignmentsScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const assignments: Assignment[] = [
    { id: 1, course: 'Machine Learning', title: 'Neural Networks Implementation', dueDate: 'Feb 20, 2026', status: 'Pending', color: 'bg-yellow-50 text-yellow-600' },
    { id: 2, course: 'Data Science', title: 'Data Analysis Project', dueDate: 'Feb 25, 2026', status: 'In Progress', color: 'bg-blue-50 text-blue-600' },
    { id: 3, course: 'Linear Algebra', title: 'Matrix Operations', dueDate: 'Feb 15, 2026', status: 'Missing', color: 'bg-red-50 text-red-600' },
    { id: 4, course: 'Statistics', title: 'Probability Assignment', dueDate: 'Feb 28, 2026', status: 'Not Started', color: 'bg-gray-50 text-gray-600' },
    { id: 5, course: 'Python Programming', title: 'Web Scraping Basics', dueDate: 'Feb 10, 2026', status: 'Completed', color: 'bg-green-50 text-green-600' },
  ];

  const filteredAssignments = activeTab === 'All' 
    ? assignments 
    : activeTab === 'Due Soon' 
      ? assignments.filter(a => new Date(a.dueDate) > new Date())
      : activeTab === 'Completed'
        ? assignments.filter(a => a.status === 'Completed')
        : assignments.filter(a => a.status === 'Missing');

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#212529]">Assignments</h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-[#2B5797] text-white rounded-full text-sm font-bold shadow-md hover:bg-[#1a3a6e] transition-colors">
            + New Submission
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['All', 'Due Soon', 'Completed', 'Past Due'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === tab ? 'text-[#2B5797]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2B5797]" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAssignments.map((assignment) => (
            <motion.div
              key={assignment.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  assignment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  assignment.status === 'Missing' ? 'bg-red-100 text-red-800' :
                  assignment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {assignment.status}
                </span>
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <Clock size={12} /> Due: {assignment.dueDate}
                </span>
              </div>

              <h3 className="font-bold text-lg text-[#212529] mb-1">{assignment.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{assignment.course}</p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedAssignment(assignment)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#2B5797] transition-colors"
                >
                  View Details
                </button>
                <button className={`flex-1 py-2 rounded-lg text-sm font-bold text-white transition-colors ${
                  assignment.status === 'Missing' ? 'bg-[#D13438] hover:bg-[#B92B2F]' :
                  assignment.status === 'Completed' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-[#2B5797] hover:bg-[#1a3a6e]'
                }`}>
                  {assignment.status === 'Missing' ? 'Submit Late' : 'Submit'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Details Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-[#212529]">{selectedAssignment.title}</h2>
                <p className="text-sm text-gray-500">{selectedAssignment.course}</p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <ChevronDown size={20} className="rotate-180" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="prose prose-sm max-w-none text-gray-600">
                <h3 className="text-gray-900 font-bold mb-2">Instructions</h3>
                <p>Please implement a neural network from scratch using Python and NumPy. The network should be able to classify the MNIST dataset with at least 90% accuracy.</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Use modular code structure.</li>
                  <li>Include comments explaining your backpropagation logic.</li>
                  <li>Visualize the loss curve.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-sm text-[#212529] mb-3 flex items-center gap-2">
                  <FileText size={16} /> Attachments
                </h4>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded text-sm text-[#2B5797] hover:underline cursor-pointer">
                    <Download size={14} /> Dataset.zip
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded text-sm text-[#2B5797] hover:underline cursor-pointer">
                    <Download size={14} /> Template.ipynb
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                 <h4 className="font-bold text-sm text-[#212529] mb-4">Submission</h4>
                 <div className="border-2 border-dashed border-[#2B5797] bg-[#E8F0FE] rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#D0E1FD] transition-colors">
                   <Upload size={32} className="text-[#2B5797] mb-2" />
                   <p className="font-bold text-[#2B5797]">Click to upload or drag and drop</p>
                   <p className="text-xs text-gray-500 mt-1">PDF, DOCX, ZIP (Max 50MB)</p>
                 </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button 
                onClick={() => setSelectedAssignment(null)}
                className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 font-medium hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setSelectedAssignment(null)}
                className="px-6 py-2 bg-[#2B5797] text-white rounded-full font-bold hover:bg-[#1a3a6e] transition-colors"
              >
                Submit Assignment
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
