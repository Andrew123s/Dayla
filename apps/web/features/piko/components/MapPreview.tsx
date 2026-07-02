import { Navigation, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface MapPreviewProps {
  nearbyCount: number;
  locationLabel: string;
}

export function MapPreview({ nearbyCount, locationLabel }: MapPreviewProps) {
  return (
    <div className="relative h-40 rounded-3xl overflow-hidden shadow-sm ring-1 ring-black/5">
      <img
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200"
        alt="Map of nearby routes"
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />

      {/* Pulsing "you are here" marker */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="relative flex h-3.5 w-3.5">
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
            animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
        </span>
      </div>

      <button
        type="button"
        className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm hover:bg-white active:scale-95 transition-all"
        aria-label="Map layers"
      >
        <Layers size={17} />
      </button>

      <div className="absolute bottom-3 left-4 right-3 flex items-end justify-between">
        <div className="text-white">
          <p className="text-sm font-bold leading-tight drop-shadow">Explore the map</p>
          <p className="text-xs text-white/85 drop-shadow">
            {nearbyCount} {nearbyCount === 1 ? 'route' : 'routes'}
            {locationLabel === 'All locations' ? ' worldwide' : ` in ${locationLabel}`}
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 bg-white text-slate-800 text-xs font-bold pl-3 pr-3.5 py-2 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Navigation size={14} className="text-emerald-600" />
          Open
        </button>
      </div>
    </div>
  );
}
