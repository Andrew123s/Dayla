import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Check, Globe } from 'lucide-react';
import { countryFlag } from '../utils';

export interface CountryOption {
  name: string;
  count: number;
}

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  /** Selected country, or 'all'. */
  selected: string;
  onSelect: (country: string) => void;
  countries: CountryOption[];
  totalCount: number;
}

export function LocationPicker({
  open,
  onClose,
  selected,
  onSelect,
  countries,
  totalCount,
}: LocationPickerProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, query]);

  const choose = (country: string) => {
    onSelect(country);
    setQuery('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="absolute bottom-0 inset-x-0 z-50 flex flex-col max-h-[78%] bg-white rounded-t-3xl pb-safe shadow-2xl"
          >
            <div className="flex justify-center pt-3 shrink-0">
              <span className="w-10 h-1.5 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-5 pt-3 shrink-0">
              <h2 className="text-xl font-black text-slate-900">Choose location</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid place-items-center w-8 h-8 rounded-full bg-gray-100 text-slate-500 hover:bg-gray-200 transition-colors"
              >
                <X size={17} />
              </button>
            </div>
            <p className="px-5 pt-1 pb-3 text-sm text-slate-500 shrink-0">
              See curated routes for your country.
            </p>

            {/* Country search */}
            <div className="px-5 pb-2 shrink-0">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a country…"
                  className="w-full bg-gray-100 text-slate-800 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white border border-transparent focus:border-emerald-400 transition-all placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4">
              {!query && (
                <Row
                  flag={<Globe size={20} className="text-emerald-600" />}
                  label="All locations"
                  count={totalCount}
                  active={selected === 'all'}
                  onClick={() => choose('all')}
                />
              )}
              {filtered.map((c) => (
                <Row
                  key={c.name}
                  flag={<span className="text-xl leading-none">{countryFlag(c.name)}</span>}
                  label={c.name}
                  count={c.count}
                  active={selected === c.name}
                  onClick={() => choose(c.name)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-8">
                  No countries match “{query.trim()}”.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({
  flag,
  label,
  count,
  active,
  onClick,
}: {
  flag: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-colors ${
        active ? 'bg-emerald-50' : 'hover:bg-gray-50'
      }`}
    >
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-gray-50 shrink-0">{flag}</span>
      <span className={`flex-1 font-semibold ${active ? 'text-emerald-700' : 'text-slate-800'}`}>
        {label}
      </span>
      <span className="text-sm font-medium text-slate-400">
        {count} {count === 1 ? 'route' : 'routes'}
      </span>
      {active && <Check size={18} className="text-emerald-600 shrink-0" />}
    </button>
  );
}
