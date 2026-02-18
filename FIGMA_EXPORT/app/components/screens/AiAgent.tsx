import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Upload, FileText, Type, Eye, Volume2, Monitor, MessageSquare, ChevronRight, PlayCircle, Settings, X, Plus } from 'lucide-react';

export default function AiAgentScreen() {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello Pranali! I am your AI Academic Agent. How can I help you learn today?' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, { role: 'user', text: inputValue }]);
    setInputValue('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'I can certainly help you with that concept. Here is a breakdown...' }]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* Left: History */}
      <div className="w-[240px] flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#F8F9FA]">
          <span className="font-bold text-[#212529] text-sm">History</span>
          <button className="p-1 hover:bg-gray-200 rounded text-[#2B5797]"><Plus size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {['Neural Networks', 'Linear Algebra Quiz', 'Machine Learning Basics', 'Probability Doubts', 'Exam Prep'].map((item, i) => (
            <button key={i} className="w-full text-left px-3 py-2 text-sm text-[#495057] hover:bg-[#E8F0FE] hover:text-[#2B5797] rounded transition-colors truncate">
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Main Interface */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-[#2B5797] text-white rounded-tr-none' 
                  : 'bg-[#F8F9FA] text-[#212529] border border-gray-200 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.role === 'ai' && (
                  <div className="mt-3 flex gap-2">
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500" title="Read Aloud"><Volume2 size={14} /></button>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500" title="Simplify"><Type size={14} /></button>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500" title="Copy"><FileText size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Voice Interface (Centered when idle) */}
          {messages.length < 2 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsListening(!isListening)}
                className={`pointer-events-auto w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-[#2B5797]'
                }`}
              >
                <Mic size={48} className="text-white" />
              </motion.button>
              <p className="mt-4 text-[#6C757D] font-medium animate-pulse">
                {isListening ? "Listening..." : "Click to speak"}
              </p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          
          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
            {['Explain Concept', 'Generate Quiz', 'Summarize Notes', 'Check Weak Areas', 'Practice Problems'].map(action => (
              <button key={action} className="whitespace-nowrap px-3 py-1.5 rounded-full border border-[#DEE2E6] text-xs text-[#495057] hover:border-[#2B5797] hover:text-[#2B5797] hover:bg-[#E8F0FE] transition-colors">
                {action}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center bg-[#F8F9FA] p-2 rounded-full border border-[#DEE2E6] focus-within:ring-2 focus-within:ring-[#2B5797] focus-within:border-transparent transition-all shadow-sm">
            <button className="p-2 text-[#6C757D] hover:text-[#2B5797] rounded-full hover:bg-white transition-colors">
              <Upload size={20} />
            </button>
            <input 
              type="text" 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 text-[#212529] placeholder:text-[#ADB5BD]"
              placeholder="Type your question here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="p-2 bg-[#2B5797] text-white rounded-full hover:bg-[#1a3a6e] transition-colors shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>

      {/* Right: Accessibility Panel */}
      <div className="w-[260px] flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 shrink-0">
        <div className="p-4 border-b border-gray-100 bg-[#F8F9FA]">
          <span className="font-bold text-[#212529] text-sm flex items-center gap-2">
            <Settings size={16} /> Accessibility
          </span>
        </div>
        <div className="p-4 space-y-6">
          
          <div>
            <label className="text-xs font-semibold text-[#6C757D] block mb-2">FONT SIZE</label>
            <div className="flex bg-[#F8F9FA] rounded-lg p-1 border border-gray-200">
              {['S', 'M', 'L', 'XL'].map((size, i) => (
                <button key={size} className={`flex-1 text-xs py-1 rounded ${i === 1 ? 'bg-white shadow text-[#2B5797] font-bold' : 'text-[#6C757D]'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#495057]">High Contrast</span>
              <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#495057]">Screen Reader</span>
              <div className="w-10 h-5 bg-[#2B5797] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#495057]">Captions</span>
              <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#495057]">Reduce Motion</span>
              <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
