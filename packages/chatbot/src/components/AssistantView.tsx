import React, { useState, useRef, useEffect } from 'react';
import { useWidgetStore } from '../store/useWidgetStore';

type Log = { sender: 'user' | 'system'; text: string };

export default function AssistantView() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<Log[]>([
    { sender: 'system', text: 'System Online. Where would you like to go?' }
  ]);
  
  const setTargetAction = useWidgetStore((state) => state.setTargetAction);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isProcessing]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setLogs(prev => [...prev, { sender: 'user', text: userText }]);
    setIsProcessing(true);

    // MOCK PIPELINE
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lowerInput = userText.toLowerCase();
    let action = 'UNKNOWN';
    let reply = "I didn't quite catch that. Try 'projects' or 'resume'.";

    if (lowerInput.includes('resume') || lowerInput.includes('cv')) {
      action = 'OPEN_RESUME';
      reply = "Opening the resume for you.";
    } else if (lowerInput.includes('project')) {
      action = 'NAVIGATE_PROJECTS';
      reply = "Flying to the projects room.";
    } else if (lowerInput.includes('skill')) {
      action = 'NAVIGATE_SKILLS';
      reply = "Heading to the skills section.";
    }

    if (action !== 'UNKNOWN') {
      setTargetAction(action);
    }
    
    setLogs(prev => [...prev, { sender: 'system', text: reply }]);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Chat Log */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar" ref={scrollRef}>
        {logs.map((log, i) => (
          <div key={i} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {log.sender === 'system' ? (
              <div className="flex items-end gap-2 max-w-[85%]">
                {/* Blue Circle Shape for Chatbot */}
                <div className="w-8 h-8 rounded-full bg-blue-500 shadow-md flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
                {/* System Message */}
                <div className="bg-white/60 backdrop-blur-sm border border-white/40 text-gray-800 text-sm py-2 px-3 rounded-2xl rounded-bl-sm shadow-sm">
                  {log.text}
                </div>
              </div>
            ) : (
              /* Normal Text for User */
              <div className="text-gray-800 text-[15px] font-medium max-w-[85%] text-right px-2">
                {log.text}
              </div>
            )}
          </div>
        ))}
        
        {/* Processing Indicator Slot */}
        {isProcessing && (
          <div className="flex items-center gap-2 mt-4">
             <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0" />
             {/* You can drop your ping pong dot loader component right here */}
             <div className="text-xs text-gray-500 font-medium">Processing...</div>
          </div>
        )}
      </div>

      {/* Glass Input Area */}
      <form onSubmit={handleCommand} className="mt-4 relative shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
          placeholder="Type a command..."
          className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl py-3 pl-4 pr-12 text-sm outline-none focus:bg-white/80 focus:border-[#ffe4c4] focus:ring-4 focus:ring-[#ffe4c4]/40 transition-all placeholder-gray-500 text-gray-800 shadow-inner"
        />
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800 disabled:opacity-40 transition-colors"
        >
          ➤
        </button>
      </form>
    </div>
  );
}