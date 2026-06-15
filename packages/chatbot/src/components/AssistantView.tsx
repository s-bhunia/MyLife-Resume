import React, { useState, useRef, useEffect } from "react";
import { useWidgetStore } from "../store/useWidgetStore";
import { ChatbotAPI } from "../lib/api";

type Log = { sender: "user" | "system"; text: string };

export default function AssistantView() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<Log[]>([
    { sender: "system", text: "System Online. Where would you like to go?" },
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
    setInput("");

    // 1. Append user message to chat logs
    setLogs((prev) => [...prev, { sender: "user", text: userText }]);
    setIsProcessing(true);

    try {
      // 2. Call the FastAPI backend endpoint
      const response = await ChatbotAPI.getIntent(userText);
      const { action, reply } = response;

      // 3. Append the AI's descriptive response to chat logs
      setLogs((prev) => [...prev, { sender: "system", text: reply }]);

      // 4. Handle structural/navigation state updates
      if (action && action !== "CONVERSATION" && action !== "UNKNOWN") {
        setTargetAction(action);
      }
    } catch (error) {
      console.error("Failed to fetch intent:", error);
      setLogs((prev) => [
        ...prev,
        {
          sender: "system",
          text: "Sorry, I'm having trouble connecting right now. Please try again or use the standard navigation controls!",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px] p-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl shadow-xl">
      {/* Scrollable Logs Window */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/40"
      >
        {logs.map((log, index) => (
          <div
            key={index}
            className={`flex ${log.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {log.sender === "system" ? (
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-blue-600/80 shrink-0 shadow-sm flex items-center justify-center text-[10px] text-white font-bold">
                  AI
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-white/40 text-gray-800 rounded-2xl rounded-tl-sm py-2 px-3 text-sm shadow-sm whitespace-pre-line">
                  {log.text}
                </div>
              </div>
            ) : (
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm py-2 px-3 text-sm shadow-md font-medium max-w-[85%]">
                {log.text}
              </div>
            )}
          </div>
        ))}

        {/* Processing Indicator / Ping Pong Dot Loader Slot */}
        {isProcessing && (
          <div className="flex items-center gap-2 mt-2 pl-1">
            <div className="w-6 h-6 rounded-full bg-blue-500/50 animate-pulse shrink-0" />
            <div className="text-xs text-gray-500 font-medium italic">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Glass Input Form */}
      <form onSubmit={handleCommand} className="mt-4 relative shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
          placeholder="Ask me to navigate or about the project..."
          className="w-full bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl py-3 pl-4 pr-12 text-sm outline-none focus:bg-white/90 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all placeholder-gray-500 text-gray-800 shadow-inner"
        />
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-blue-600 hover:bg-blue-50 disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
