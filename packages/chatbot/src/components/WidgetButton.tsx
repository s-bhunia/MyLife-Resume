import { useWidgetStore } from '../store/useWidgetStore';
import { cn } from '../lib/utils';

export default function WidgetButton() {
  const { isOpen, toggleOpen } = useWidgetStore();

  return (
    <button
      onClick={toggleOpen}
      className={cn(
        "w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50",
        isOpen ? "rotate-90 scale-90 bg-gray-800" : "hover:scale-105"
      )}
      aria-label="Toggle Assistant"
    >
      {/* You can replace these with actual SVG icons later */}
      <span className="text-2xl">{isOpen ? '✖' : '🤖'}</span>
    </button>
  );
}
