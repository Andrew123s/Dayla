import { motion } from 'motion/react';
import { RouteFilter } from '../types';

interface FilterChipsProps {
  active: RouteFilter;
  onChange: (filter: RouteFilter) => void;
}

const FILTERS: { id: RouteFilter; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'eco', label: 'High Eco', emoji: '🌿' },
  { id: 'group', label: 'Group', emoji: '👥' },
  { id: 'easy', label: 'Easygoing', emoji: '🚶' },
  { id: 'hard', label: 'Challenging', emoji: '🥾' },
];

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-3">
      {FILTERS.map((f) => {
        const isActive = active === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={`relative shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              isActive
                ? 'text-white'
                : 'text-slate-600 bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="piko-filter-pill"
                className="absolute inset-0 rounded-full bg-slate-900 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <span aria-hidden>{f.emoji}</span>
              {f.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
