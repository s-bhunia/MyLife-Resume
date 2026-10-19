import { useEffect, useRef, useState, type FormEvent } from "react";
import { useWidgetStore } from "../store/useWidgetStore";
import { ChatbotAPI } from "../lib/api";
import { FALLBACK, SUGGESTIONS, think, type Thought } from "../lib/localBrain";

type Log = { id: number; sender: "user" | "system"; text: string };

let nextId = 1;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function respond(text: string): Promise<Thought> {
  const local = think(text);
  if (local) {
    await wait(260);
    return local;
  }
  try {
    const remote = await ChatbotAPI.getIntent(text);
    if (remote.action === "UNKNOWN") return FALLBACK;
    return { action: remote.action === "CONVERSATION" ? null : remote.action, reply: remote.reply };
  } catch {
    return FALLBACK;
  }
}

export default function AssistantView() {
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [logs, setLogs] = useState<Log[]>([
    { id: 0, sender: "system", text: "Mind online. Ask me anything about Santanu, or tell me where to take you." },
  ]);
  const setTargetAction = useWidgetStore((state) => state.setTargetAction);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [logs, thinking]);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  const ask = async (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;
    setInput("");
    setLogs((prev) => [...prev, { id: nextId++, sender: "user", text: question }]);
    setThinking(true);
    const thought = await respond(question);
    setLogs((prev) => [...prev, { id: nextId++, sender: "system", text: thought.reply }]);
    setThinking(false);
    if (thought.action) setTargetAction(thought.action);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <div className="flex h-full max-h-[440px] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
        {logs.map((log) => (
          <div key={log.id} className={`flex ${log.sender === "user" ? "justify-end" : "justify-start"}`}>
            {log.sender === "system" ? (
              <div className="flex max-w-[88%] items-start gap-2">
                <img src="/logo.webp" alt="" width={26} height={26} className="mt-0.5 shrink-0 mix-blend-multiply" />
                <div className="whitespace-pre-line rounded-2xl rounded-tl-sm border border-[#c99a4a]/30 bg-white/80 px-3 py-2 text-[13px] leading-relaxed text-[#3b2414] shadow-sm">
                  {log.text}
                </div>
              </div>
            ) : (
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#ffb347] to-[#e8642a] px-3 py-2 text-[13px] font-medium text-white shadow-sm">{log.text}</div>
            )}
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-1.5 pl-8" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#e8642a]" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => ask(suggestion)}
            disabled={thinking}
            style={{ clipPath: "polygon(8px 0, 100% 0, 100% 100%, 8px 100%, 0 50%)" }}
            className="bg-[#ffe4c4] py-1 pl-3 pr-2.5 text-[11px] font-medium text-[#6b4426] transition-colors hover:bg-[#e8642a] hover:text-white disabled:opacity-40"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="relative mt-3 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={thinking}
          placeholder="Ask about work, skills, or say “take me to the desk”"
          className="w-full rounded-xl border border-[#c99a4a]/40 bg-white/70 py-3 pl-4 pr-12 text-[13px] text-[#3b2414] placeholder-[#b08a66] outline-none transition-colors focus:border-[#e8642a]/60 focus:bg-white"
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          aria-label="Send"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#e8642a] transition-colors hover:bg-[#ffe4c4] disabled:text-[#d6c2a8] disabled:hover:bg-transparent"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
}
