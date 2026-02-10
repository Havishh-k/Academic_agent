import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6 animate-fade-in group`}>
      
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isUser 
            ? 'bg-gradient-to-br from-academic-700 to-academic-900 text-white' 
            : 'bg-white border border-academic-200 text-primary-600'
      }`}>
        {isUser ? (
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
             <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
           </svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
             <path d="M11.25 4.533A9.707 9.707 0 006 3.75a9.753 9.753 0 00-3.182 17.039c-.97-1.659-1.429-3.497-1.318-5.344.055-.929.67-1.761 1.604-1.761.641 0 1.25.166 1.782.47a1.867 1.867 0 002.046-.07c1.1-.703.111-2.28-.96-2.583a2.66 2.66 0 00-3.07 1.692 2.635 2.635 0 00.17 1.637c.75.39 1.13.914 1.146 1.488.004 1.345-1.295 1.543-1.65 1.472-.656-.131-1.22-.524-1.57-1.07A11.25 11.25 0 0112 2.25c6.213 0 11.25 5.037 11.25 11.25S18.213 24.75 12 24.75c-3.792 0-7.153-1.879-9.268-4.789a.75.75 0 00-1.144.975A12.72 12.72 0 0012 26.25c7.042 0 12.75-5.708 12.75-12.75S19.042.75 12 .75z" />
             <path d="M14.25 9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
           </svg>
        )}
      </div>

      <div className={`flex flex-col max-w-[85%] lg:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`text-[10px] mb-1 font-semibold uppercase tracking-wider ${isUser ? 'text-academic-500' : 'text-primary-600'}`}>
          {isUser ? 'You' : 'Academic Agent'}
        </div>
        
        <div
          className={`rounded-2xl px-6 py-4 shadow-sm relative text-sm leading-relaxed ${
            isUser
              ? 'bg-academic-800 text-white rounded-tr-none'
              : 'bg-white text-academic-900 border border-academic-100 rounded-tl-none'
          }`}
        >
          <div className={`markdown-body ${isUser ? 'text-white' : 'text-academic-800'}`}>
            <ReactMarkdown
               components={{
                code: ({node, inline, className, children, ...props}: any) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline ? (
                        <div className="relative group/code my-4">
                            <div className="absolute top-0 right-0 px-2 py-1 text-[10px] text-academic-300 font-mono opacity-0 group-hover/code:opacity-100 transition-opacity">
                                {match?.[1] || 'code'}
                            </div>
                            <pre className={`${isUser ? 'bg-academic-900/50' : 'bg-academic-900'} text-gray-100 p-3 rounded-lg overflow-x-auto border border-white/10`}>
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            </pre>
                        </div>
                    ) : (
                        <code className={`font-mono text-[0.9em] px-1.5 py-0.5 rounded ${
                            isUser 
                                ? 'bg-white/10 text-white border border-white/10' 
                                : 'bg-academic-50 text-academic-700 border border-academic-200'
                        }`} {...props}>
                            {children}
                        </code>
                    )
                },
                a: ({node, ...props}) => <span className="text-primary-400 underline decoration-primary-400/30 underline-offset-2 cursor-not-allowed" {...props} title="External links disabled" />
            }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <div className={`text-[10px] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isUser ? 'text-academic-400' : 'text-academic-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;