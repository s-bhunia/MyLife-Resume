import React, { useRef, useEffect } from "react";
import { useAtomValue } from "jotai";
import { isMobileAtom } from "@mylife/core-engine";
import { useWidgetStore } from "../store/useWidgetStore";
import { useClickOutside } from "../hooks/useClickOutside";
import WidgetButton from "./WidgetButton";
import AssistantView from "./AssistantView";
import FeedbackView from "./FeedbackView";

export const AssistantWidget: React.FC = () => {
  const { isOpen, viewMode, closeWidget, setViewMode } = useWidgetStore();
  const widgetRef = useRef<HTMLDivElement>(null);
  const isMobile = useAtomValue(isMobileAtom);

  useEffect(() => {
    const unsubscribe = useWidgetStore.subscribe((state) => {
      if (state.targetAction === "OPEN_RESUME") {
        window.open("/loader/resume.pdf", "_blank");
        useWidgetStore.getState().setTargetAction(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useClickOutside(widgetRef, closeWidget);

  return (
    <div
      className="fixed bottom-0 right-6 z-50 glitch-container w-auto max-w-[90vw] p-2"
      ref={widgetRef}
      style={{
        transform: `scale(${isMobile ? 1 : 1})`,
        transformOrigin: "center center",
      }}
    >
      {isOpen && (
        <div className="mb-4 w-96 max-w-full sm:w-96 max-h-[calc(100vh-6rem)] rounded-3xl bg-white/30 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] overflow-y-auto flex flex-col transition-all duration-300">
          {/* Glass Header & Toggle */}
          <div className="flex flex-col sm:flex-row p-2 gap-2 bg-white/20 border-b border-white/30">
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
          <div className="p-4 flex-1 overflow-auto">
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
