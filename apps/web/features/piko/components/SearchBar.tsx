import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex-1">
        <Search
          size={19}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          inputMode="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search trails, cities, tags…"
          className="w-full bg-white text-slate-800 rounded-2xl py-3.5 pl-11 pr-4 outline-none border border-gray-200/80 shadow-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-400 font-medium"
        />
      </div>
      <button
        type="button"
        aria-label="Filters"
        className="shrink-0 w-[52px] h-[52px] grid place-items-center rounded-2xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
      >
        <SlidersHorizontal size={20} />
      </button>
    </div>
  );
}
