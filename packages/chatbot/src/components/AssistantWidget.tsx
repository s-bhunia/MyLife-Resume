import React, { useRef } from "react";
import { useWidgetStore } from "../store/useWidgetStore";
import { useClickOutside } from "../hooks/useClickOutside";
import WidgetButton from "./WidgetButton";
import AssistantView from "./AssistantView";
import FeedbackView from "./FeedbackView";

export const AssistantWidget: React.FC = () => {
  const { isOpen, viewMode, closeWidget, setViewMode } = useWidgetStore();
  const widgetRef = useRef<HTMLDivElement>(null);

  useClickOutside(widgetRef, closeWidget);

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={widgetRef}>
      {isOpen && (
        <div className="mb-4 w-96 h-[32rem] rounded-3xl bg-white/30 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] overflow-hidden flex flex-col transition-all duration-300">
          {/* Glass Header & Toggle */}
          <div className="flex p-2 gap-2 bg-white/20 border-b border-white/30">
            <button
              onClick={() => setViewMode("assistant")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${viewMode === "assistant" ? "bg-[#ffe4c4] text-gray-800 shadow-sm" : "text-gray-600 hover:bg-white/30"}`}
            >
              Assistant
            </button>
            <button
              onClick={() => setViewMode("feedback")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${viewMode === "feedback" ? "bg-[#ffe4c4] text-gray-800 shadow-sm" : "text-gray-600 hover:bg-white/30"}`}
            >
              Feedback
            </button>
          </div>

          {/* Dynamic Content Body */}
          <div className="p-4 flex-1 overflow-hidden">
            {viewMode === "assistant" ? <AssistantView /> : <FeedbackView />}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <WidgetButton />
      </div>
    </div>
  );
};
