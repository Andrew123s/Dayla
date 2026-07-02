import { Compass, Map, Bookmark, Plus, LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { PikoTab } from '../types';

interface BottomNavProps {
  active: PikoTab;
  onChange: (tab: PikoTab) => void;
  savedCount: number;
  onCreate: () => void;
}

const TABS: { id: PikoTab; icon: LucideIcon; label: string }[] = [
  { id: 'discover', icon: Compass, label: 'Discover' },
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'saved', icon: Bookmark, label: 'Saved' },
];

export function BottomNav({ active, onChange, savedCount, onCreate }: BottomNavProps) {
  return (
    <>
      {/* Floating create button */}
      <motion.button
        type="button"
        onClick={onCreate}
        whileTap={{ scale: 0.9 }}
        aria-label="Create route"
        className="absolute right-4 bottom-[88px] z-40 grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 pb-safe"
      >
        <Plus size={26} strokeWidth={2.6} />
      </motion.button>

      <nav className="absolute bottom-0 inset-x-0 z-40 bg-white/85 backdrop-blur-xl border-t border-gray-100 pb-safe shadow-[0_-8px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-around px-2 pt-2 pb-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            const badge = tab.id === 'saved' ? savedCount : 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={`relative flex flex-col items-center gap-1 min-w-[72px] py-1 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="relative">
                  <Icon size={23} strokeWidth={isActive ? 2.6 : 2} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 grid place-items-center text-[10px] font-bold text-white bg-emerald-500 rounded-full ring-2 ring-white">
                      {badge}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-semibold ${isActive ? 'text-emerald-700' : ''}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="piko-nav-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-emerald-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
