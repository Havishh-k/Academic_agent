import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, ArrowRight, XCircle, RotateCcw } from 'lucide-react';

type QuizView = 'LIST' | 'QUIZ' | 'RESULT';

export default function QuizzesScreen() {
  const [view, setView] = useState<QuizView>('LIST');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1530); // 25:30 in seconds
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // Mock Data
  const quizzes = [
    { id: 1, title: 'Neural Networks Quiz', course: 'Machine Learning', questions: 15, time: '30 min', attempts: '1/3', score: '82%', color: 'bg-blue-50' },
    { id: 2, title: 'Python Basics Quiz', course: 'Data Science', questions: 10, time: '20 min', attempts: '0/3', score: null, color: 'bg-purple-50' },
    { id: 3, title: 'Matrix Operations Quiz', course: 'Linear Algebra', questions: 12, time: '25 min', attempts: '1/3', score: '68%', color: 'bg-green-50' },
    { id: 4, title: 'Probability Quiz', course: 'Statistics', questions: 8, time: '15 min', attempts: '0/3', score: null, color: 'bg-orange-50' },
  ];

  const questions = [
    { 
      id: 1, 
      text: "What is the primary function of an activation function in a neural network?", 
      options: ["To introduce non-linearity", "To calculate the loss", "To update weights", "To normalize data"], 
      correct: 0 
    },
    { 
      id: 2, 
      text: "Which algorithm is commonly used for training neural networks?", 
      options: ["K-Means Clustering", "Backpropagation", "Apriori", "Decision Trees"], 
      correct: 1 
    },
    { 
      id: 3, 
      text: "What does CNN stand for in Deep Learning?", 
      options: ["Central Neural Network", "Convolutional Neural Network", "Computer Neural Network", "Combined Neural Network"], 
      correct: 1 
    }
  ];

  // Timer Effect
  useEffect(() => {
    if (view === 'QUIZ' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [view, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setView('QUIZ');
    setCurrentQuestion(0);
    setTimeLeft(1530);
    setScore(0);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === questions[currentQuestion].correct) {
      setScore(prev => prev + 1);
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setView('RESULT');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto min-h-[calc(100vh-100px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {view === 'LIST' && (
        <>
          <h1 className="text-2xl font-bold text-[#212529] mb-8">Available Quizzes</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                <div className={`p-3 rounded-lg w-fit mb-4 ${quiz.color}`}>
                  <CheckCircle size={24} className="text-[#2B5797]" />
                </div>
                
                <h3 className="text-lg font-bold text-[#212529] mb-1">{quiz.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{quiz.course}</p>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2"><Clock size={16} /> {quiz.time}</div>
                  <div className="flex items-center gap-2"><AlertTriangle size={16} /> {quiz.questions} Qs</div>
                  <div className="flex items-center gap-2">Attempts: {quiz.attempts}</div>
                  {quiz.score && <div className="font-bold text-[#2B5797]">Best: {quiz.score}</div>}
                </div>
                
                <button 
                  onClick={handleStartQuiz}
                  className="w-full py-2.5 bg-[#2B5797] text-white rounded-full font-bold hover:bg-[#1a3a6e] transition-colors"
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'QUIZ' && (
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-[80px] z-10">
             <div>
               <h2 className="font-bold text-[#212529]">Neural Networks Quiz</h2>
               <div className="text-xs text-gray-500">Question {currentQuestion + 1} of {questions.length}</div>
             </div>
             <div className="flex items-center gap-2 text-[#D13438] font-mono font-bold text-lg bg-red-50 px-3 py-1 rounded">
               <Clock size={20} /> {formatTime(timeLeft)}
             </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="text-xl font-medium text-[#212529] mb-6 leading-relaxed">
              {questions[currentQuestion].text}
            </h3>
            
            <div className="space-y-3">
              {questions[currentQuestion].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedOption === idx 
                      ? 'border-[#2B5797] bg-[#E8F0FE] text-[#2B5797]' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === idx ? 'border-[#2B5797]' : 'border-gray-400'
                  }`}>
                    {selectedOption === idx && <div className="w-2.5 h-2.5 rounded-full bg-[#2B5797]" />}
                  </div>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="w-1/2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#2B5797] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
              />
            </div>
            <button 
              disabled={selectedOption === null}
              onClick={handleSubmitAnswer}
              className="px-8 py-3 bg-[#2B5797] text-white rounded-full font-bold hover:bg-[#1a3a6e] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {view === 'RESULT' && (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center animate-in zoom-in-95 duration-300 mt-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-[#212529] mb-2">Quiz Completed!</h2>
          <p className="text-gray-500 mb-8">You have successfully completed the Neural Networks Quiz.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Score</div>
              <div className="text-2xl font-bold text-[#2B5797]">{Math.round((score / questions.length) * 100)}%</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Correct</div>
              <div className="text-2xl font-bold text-[#6264A7]">{score}/{questions.length}</div>
            </div>
          </div>

          <div className="space-y-3">
             <button onClick={() => setView('LIST')} className="w-full py-3 bg-[#2B5797] text-white rounded-full font-bold hover:bg-[#1a3a6e] transition-colors">
               Back to Quizzes
             </button>
             <button onClick={handleStartQuiz} className="w-full py-3 border border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
               <RotateCcw size={18} /> Try Again
             </button>
          </div>
        </div>
      )}

    </div>
  );
}
