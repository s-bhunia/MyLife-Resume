import { useCallback, useRef } from "react";
import { useWidgetStore } from "../store/useWidgetStore";
import { useClickOutside } from "../hooks/useClickOutside";
import WidgetButton from "./WidgetButton";
import AssistantView from "./AssistantView";
import FeedbackView from "./FeedbackView";

const TABS = [
  { id: "assistant", label: "Ask my mind" },
  { id: "feedback", label: "Leave a note" },
] as const;

const HEX = "polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)";

export function AssistantWidget() {
  const isOpen = useWidgetStore((s) => s.isOpen);
  const viewMode = useWidgetStore((s) => s.viewMode);
  const closeWidget = useWidgetStore((s) => s.closeWidget);
  const setViewMode = useWidgetStore((s) => s.setViewMode);
  const widgetRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => isOpen && closeWidget(), [isOpen, closeWidget]);

  useClickOutside(widgetRef, close);

  return (
    <div ref={widgetRef} className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3">
      <div
        className={`w-[380px] max-w-full origin-bottom-right overflow-hidden rounded-[22px] rounded-br-md border border-[#c99a4a]/50 bg-[#fff8eb]/90 shadow-[0_22px_60px_-18px_rgba(110,60,20,0.55)] backdrop-blur-2xl transition-all duration-300 ease-out ${
          isOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex gap-1 border-b border-[#c99a4a]/30 bg-[#ffe4c4]/40 p-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id)}
              style={{ clipPath: HEX }}
              className={`flex-1 py-2 text-[13px] font-semibold transition-colors ${
                viewMode === tab.id ? "bg-gradient-to-r from-[#ffb347] to-[#e8642a] text-white" : "text-[#6b4426] hover:bg-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="max-h-[min(560px,calc(100dvh-9rem))] overflow-y-auto p-4">
          {isOpen && (viewMode === "assistant" ? <AssistantView /> : <FeedbackView />)}
        </div>
      </div>
      <WidgetButton />
    </div>
  );
}
