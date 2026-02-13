import React, { useState, useEffect } from 'react';
import { CourseDocument, StudentProgressEntry } from '../types';
import { COURSE_DOCUMENTS, CURRICULUM_DATA } from '../constants';
import { supabase, AI_COURSE_ID } from '../services/supabaseClient';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

type Tab = 'docs' | 'progress';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, studentId }) => {
  const [activeTab, setActiveTab] = useState<Tab>('docs');
  const [activeDocId, setActiveDocId] = useState<string>(COURSE_DOCUMENTS[0].id);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [progressData, setProgressData] = useState<StudentProgressEntry[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Load progress from Supabase
  useEffect(() => {
    if (activeTab === 'progress' && studentId && AI_COURSE_ID) {
      loadProgressFromSupabase();
    }
  }, [activeTab, studentId]);

  // Also load from localStorage as fallback
  useEffect(() => {
    const saved = localStorage.getItem('cs101_progress');
    if (saved) {
      try {
        setCompletedTopics(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse progress", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cs101_progress', JSON.stringify(completedTopics));
  }, [completedTopics]);

  const loadProgressFromSupabase = async () => {
    setLoadingProgress(true);
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('course_id', AI_COURSE_ID);

      if (error) throw error;
      if (data) {
        setProgressData(data as StudentProgressEntry[]);
        // Auto-mark topics with mastery >= 3 as completed
        const masteredTopics = data
          .filter((p: any) => p.mastery_level >= 3)
          .map((p: any) => p.topic_id);

        setCompletedTopics(prev => {
          const merged = new Set([...prev, ...masteredTopics]);
          return Array.from(merged);
        });
      }
    } catch (e) {
      console.error("Failed to load progress from Supabase:", e);
    } finally {
      setLoadingProgress(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setCompletedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
  };

  const totalTopics = CURRICULUM_DATA.reduce((acc, unit) => acc + unit.topics.length, 0);
  const progressPercentage = Math.round((completedTopics.length / totalTopics) * 100) || 0;

  const activeDoc = COURSE_DOCUMENTS.find((doc) => doc.id === activeDocId);

  const getTopicMastery = (topicId: string): StudentProgressEntry | undefined => {
    return progressData.find(p => p.topic_id === topicId);
  };

  const getMasteryColor = (level: number): string => {
    if (level >= 4) return 'bg-green-500';
    if (level >= 3) return 'bg-blue-500';
    if (level >= 2) return 'bg-yellow-500';
    if (level >= 1) return 'bg-orange-500';
    return 'bg-academic-300';
  };

  const getMasteryLabel = (level: number): string => {
    if (level >= 4) return 'Mastered';
    if (level >= 3) return 'Proficient';
    if (level >= 2) return 'Developing';
    if (level >= 1) return 'Beginner';
    return 'Not started';
  };

  return (
    <>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-academic-900/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-academic-100 z-50 w-full md:w-96 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col shadow-2xl`}
      >
        <div className="p-5 border-b border-academic-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="font-serif font-bold text-academic-900 text-lg">AI101 Companion</h2>
            <p className="text-xs text-academic-500 font-medium">Syllabus & Adaptive Progress</p>
          </div>
          <button onClick={onClose} className="text-academic-400 hover:text-academic-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-2 gap-2 border-b border-academic-100 bg-white">
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'docs'
              ? 'bg-academic-50 text-academic-900 shadow-sm border border-academic-200'
              : 'text-academic-500 hover:bg-academic-50 hover:text-academic-700'
              }`}
          >
            Materials
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'progress'
              ? 'bg-academic-50 text-academic-900 shadow-sm border border-academic-200'
              : 'text-academic-500 hover:bg-academic-50 hover:text-academic-700'
              }`}
          >
            My Progress
          </button>
        </div>

        {activeTab === 'docs' ? (
          <>
            {/* Navigation List */}
            <div className="flex-none p-3 border-b border-academic-100 bg-academic-50/50">
              <div className="space-y-1">
                {COURSE_DOCUMENTS.map((doc) => {
                  const isActive = activeDocId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setActiveDocId(doc.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${isActive
                        ? 'bg-white text-primary-700 shadow-sm ring-1 ring-academic-100'
                        : 'text-academic-600 hover:bg-academic-100/50 hover:text-academic-900'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary-500' : 'bg-academic-300'}`}></span>
                      <span className="truncate">{doc.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
              {activeDoc && (
                <div className="p-6">
                  <div className="mb-4 pb-4 border-b border-dashed border-academic-200">
                    <h3 className="text-xl font-serif font-bold text-academic-900 leading-tight">{activeDoc.title}</h3>
                  </div>
                  <div className="prose prose-sm max-w-none prose-p:text-academic-600 prose-headings:text-academic-800 prose-strong:text-academic-800 prose-li:text-academic-600">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-academic-700">
                      {activeDoc.content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar flex flex-col">
            {/* Progress Header */}
            <div className="p-6 bg-gradient-to-br from-academic-800 to-academic-900 text-white shrink-0">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-academic-200 text-xs font-semibold uppercase tracking-wider mb-1">Total Completion</p>
                  <h3 className="text-3xl font-serif font-bold">{progressPercentage}%</h3>
                </div>
                <div className="text-right">
                  <p className="text-academic-300 text-xs">{completedTopics.length} / {totalTopics} Topics</p>
                  {progressData.length > 0 && (
                    <p className="text-academic-400 text-[10px] mt-0.5">📊 Synced from Supabase</p>
                  )}
                </div>
              </div>
              <div className="w-full bg-academic-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Loading state */}
            {loadingProgress && (
              <div className="p-4 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-academic-500">
                  <div className="w-4 h-4 border-2 border-academic-300 border-t-academic-600 rounded-full animate-spin"></div>
                  Loading progress from Supabase...
                </div>
              </div>
            )}

            {/* Curriculum List */}
            <div className="flex-1 p-4 space-y-6">
              {CURRICULUM_DATA.map((unit) => {
                const unitCompletedCount = unit.topics.filter(t => completedTopics.includes(t.id)).length;
                const isUnitComplete = unitCompletedCount === unit.topics.length;

                return (
                  <div key={unit.id} className="animate-fade-in">
                    <div className="flex items-center justify-between mb-3 sticky top-0 bg-white z-10 py-2 border-b border-academic-100">
                      <h4 className={`font-serif font-bold ${isUnitComplete ? 'text-green-600' : 'text-academic-800'}`}>
                        {unit.title.split(':')[0]}
                      </h4>
                      <span className="text-xs font-medium text-academic-400 bg-academic-50 px-2 py-1 rounded-full">
                        {unitCompletedCount}/{unit.topics.length}
                      </span>
                    </div>
                    <div className="space-y-2 pl-2 border-l-2 border-academic-100 ml-1">
                      {unit.topics.map(topic => {
                        const isChecked = completedTopics.includes(topic.id);
                        const mastery = getTopicMastery(topic.id);
                        return (
                          <label
                            key={topic.id}
                            className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all group ${isChecked ? 'bg-green-50/50' : 'hover:bg-academic-50'
                              }`}
                          >
                            <div className="relative flex items-center justify-center mt-0.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleTopic(topic.id)}
                                className="peer appearance-none w-5 h-5 border-2 border-academic-300 rounded bg-white checked:bg-green-500 checked:border-green-500 transition-colors cursor-pointer"
                              />
                              <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm leading-snug transition-colors block ${isChecked ? 'text-academic-400 line-through decoration-academic-300' : 'text-academic-700'}`}>
                                {topic.title}
                              </span>
                              {mastery && (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(level => (
                                      <div
                                        key={level}
                                        className={`w-2 h-2 rounded-full ${level <= mastery.mastery_level ? getMasteryColor(mastery.mastery_level) : 'bg-academic-200'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-academic-400">
                                    {getMasteryLabel(mastery.mastery_level)} • {mastery.interaction_count} interactions
                                  </span>
                                </div>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-3 border-t border-academic-100 bg-academic-50 text-[10px] text-center text-academic-400 font-medium uppercase tracking-wider">
          Restricted to AI101 Syllabus • Supabase Powered
        </div>
      </div>
    </>
  );
};

export default Sidebar;