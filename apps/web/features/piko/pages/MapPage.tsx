import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Crosshair, Route as RouteIcon, Mountain, Leaf, ChevronRight, MapPinned } from 'lucide-react';
import { Route } from '../types';
import { TrailMap } from '../components/TrailMapLazy';
import { isMapConfigured } from '../map/mapConfig';
import { difficultyStyles } from '../utils';

interface MapPageProps {
  routes: Route[];
  onOpenRoute: (route: Route) => void;
}

/** The "Map" sub-tab: every mappable route on a real basemap. */
export function MapPage({ routes, onOpenRoute }: MapPageProps) {
  const mappable = useMemo(
    () => routes.filter((r) => r.geometry?.coordinates?.length || r.startPoint),
    [routes]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = mappable.find((r) => r.id === selectedId) ?? null;
  const [locating, setLocating] = useState(false);

  const flyToMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        // Nearest mappable route to the user, then select it.
        const me: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        let best: Route | null = null;
        let bestD = Infinity;
        for (const r of mappable) {
          const s = r.startPoint ?? (r.geometry?.coordinates?.[0] as [number, number] | undefined);
          if (!s) continue;
          const d = (s[0] - me[0]) ** 2 + (s[1] - me[1]) ** 2;
          if (d < bestD) {
            bestD = d;
            best = r;
          }
        }
        if (best) setSelectedId(best.id);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="relative h-full w-full">
      <TrailMap
        routes={mappable}
        selectedId={selectedId}
        onSelectRoute={(r) => setSelectedId(r.id)}
        className="h-full w-full !rounded-none"
      />

      {/* Near-me button (only meaningful with a real map). */}
      {isMapConfigured() && (
        <button
          type="button"
          onClick={flyToMe}
          aria-label="Find routes near me"
          className="absolute top-3 left-3 z-10 grid place-items-center w-11 h-11 rounded-full bg-white text-emerald-600 shadow-lg ring-1 ring-black/5 active:scale-90 transition-transform"
        >
          <Crosshair size={20} className={locating ? 'animate-pulse' : ''} />
        </button>
      )}

      {/* Count chip */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur text-slate-700 text-xs font-bold px-3 py-2 rounded-full shadow ring-1 ring-black/5">
        <MapPinned size={13} className="text-emerald-500" />
        {mappable.length} routes
      </div>

      {/* Selected-route card */}
      <AnimatePresence>
        {selected && (
          <motion.button
            type="button"
            onClick={() => onOpenRoute(selected)}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="absolute bottom-4 inset-x-4 z-10 flex items-center gap-3 bg-white rounded-2xl p-3 shadow-2xl ring-1 ring-black/5 text-left active:scale-[0.99] transition-transform"
          >
            <img
              src={selected.photos[0]}
              alt={selected.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{selected.title}</p>
              <p className="text-xs text-slate-500 truncate">{selected.location}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <RouteIcon size={12} className="text-emerald-500" /> {selected.distanceKm} km
                </span>
                <span className="flex items-center gap-1">
                  <Mountain size={12} className="text-slate-400" /> {selected.elevationGainM} m
                </span>
                <span className={`px-1.5 py-0.5 rounded-full ${difficultyStyles(selected.difficulty).soft}`}>
                  {difficultyStyles(selected.difficulty).label}
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-300 shrink-0" />
          </motion.button>
        )}
      </AnimatePresence>

      {mappable.length === 0 && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center pointer-events-none">
          <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur text-slate-600 text-sm font-semibold px-4 py-2 rounded-full shadow">
            <Leaf size={14} className="text-emerald-500" /> No mapped routes yet
          </span>
        </div>
      )}
    </div>
  );
}
