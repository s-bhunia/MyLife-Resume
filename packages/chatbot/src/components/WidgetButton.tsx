import { useWidgetStore } from "../store/useWidgetStore";

const HEX = "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)";

export default function WidgetButton() {
  const isOpen = useWidgetStore((s) => s.isOpen);
  const toggleOpen = useWidgetStore((s) => s.toggleOpen);

  return (
    <button
      type="button"
      onClick={toggleOpen}
      aria-label={isOpen ? "Close assistant" : "Ask my mind"}
      aria-expanded={isOpen}
      className="group flex items-center gap-2 transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span
        className={`order-2 grid h-14 w-16 place-items-center transition-all duration-500 ${
          isOpen ? "rotate-90 bg-[#5c3a21]" : "bg-gradient-to-br from-[#ffd27a] via-[#ffb347] to-[#e8642a]"
        }`}
        style={{ clipPath: HEX }}
      >
        <span className="grid h-[50px] w-[58px] place-items-center bg-[#fff8eb]" style={{ clipPath: HEX }}>
          {isOpen ? (
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="text-[#5c3a21]">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          ) : (
            <img src="/logo.webp" alt="" width={40} height={40} className="mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
          )}
        </span>
      </span>
      {!isOpen && (
        <span
          className="order-1 bg-[#fff8eb]/90 py-2 pl-3 pr-5 text-[13px] font-semibold text-[#3b2414] shadow-[0_10px_24px_-12px_rgba(110,60,20,0.6)] backdrop-blur"
          style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)" }}
        >
          Ask my mind
        </span>
      )}
    </button>
  );
}
