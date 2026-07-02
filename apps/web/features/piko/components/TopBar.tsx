import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface TopBarProps {
  /** Fires when the back arrow is pressed — the host app wires this to its router. */
  onBack: () => void;
  /** Fades in the frosted background + divider once the feed is scrolled. */
  scrolled: boolean;
}

/**
 * Lightweight page header for the Piko feature: just a back arrow and the
 * page title. No app-level chrome (no logo badge, no notifications) — the
 * host Dayla app owns that.
 */
export function TopBar({ onBack, scrolled }: TopBarProps) {
  return (
    <header
      className={`sticky top-0 z-30 px-2 pt-safe-top transition-colors duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="flex items-center h-14">
        <motion.button
          type="button"
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          aria-label="Go back"
          className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={22} strokeWidth={2.4} />
        </motion.button>
        <span className="ml-1 text-lg font-bold tracking-tight text-slate-800">Piko</span>
      </div>
    </header>
  );
}
