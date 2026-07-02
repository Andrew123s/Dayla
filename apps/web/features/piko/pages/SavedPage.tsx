import { Bookmark, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { Route } from '../types';
import { RouteCard } from '../components/RouteCard';

interface SavedPageProps {
  routes: Route[];
  embedded?: boolean;
  savedIds: Set<string>;
  onOpenRoute: (route: Route) => void;
  onToggleSave: (id: string) => void;
  onBrowse: () => void;
}

export function SavedPage({ routes, embedded = false, savedIds, onOpenRoute, onToggleSave, onBrowse }: SavedPageProps) {
  const saved = routes.filter((r) => savedIds.has(r.id));

  return (
    <div className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-gray-50 pb-28">
      {!embedded && (
        <header className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-xl px-4 pt-safe-top">
          <div className="h-14 flex items-end pb-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Saved</h1>
          </div>
        </header>
      )}

      {saved.length > 0 ? (
        <div className="px-4 pt-2 flex flex-col gap-4">
          <p className="text-sm text-slate-500 -mt-1">
            {saved.length} {saved.length === 1 ? 'route' : 'routes'} ready for your next adventure.
          </p>
          {saved.map((route, i) => (
            <RouteCard
              key={route.id}
              route={route}
              index={i}
              isSaved
              onOpen={onOpenRoute}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center px-10 pt-24"
        >
          <div className="grid place-items-center w-20 h-20 rounded-3xl bg-white text-emerald-500 ring-1 ring-gray-100 mb-5">
            <Bookmark size={34} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1.5">No saved routes yet</h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-[15rem] mb-6">
            Tap the bookmark on any route to keep it here for later.
          </p>
          <button
            type="button"
            onClick={onBrowse}
            className="flex items-center gap-2 bg-slate-900 text-white font-bold text-sm px-5 py-3 rounded-full active:scale-95 transition-transform"
          >
            <Compass size={17} />
            Browse routes
          </button>
        </motion.div>
      )}
    </div>
  );
}
