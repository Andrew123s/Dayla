import { MapPin, Route as RouteIcon, Mountain, Leaf } from 'lucide-react';
import { Route } from '../types';
import { difficultyStyles, formatDuration } from '../utils';

interface RouteShareCardProps {
  route: Route;
  /** Tap to open the full route detail (host wires this to open Piko). */
  onOpen?: (route: Route) => void;
  className?: string;
}

/**
 * Compact, self-contained route preview for embedding OUTSIDE the Piko page —
 * e.g. as a card inside a Dayla chat message. Exported from the feature's public
 * entry so hosts can render `<RouteShareCard route={…} onOpen={…} />` inline.
 */
export function RouteShareCard({ route, onOpen, className = '' }: RouteShareCardProps) {
  const diff = difficultyStyles(route.difficulty);
  return (
    <button
      type="button"
      onClick={() => onOpen?.(route)}
      className={`group flex w-full max-w-sm items-stretch gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm active:scale-[0.99] transition-transform ${className}`}
    >
      <div className="relative w-24 shrink-0">
        <img src={route.photos[0]} alt={route.title} className="h-full w-full object-cover" />
        <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
          <Leaf size={9} />
          {route.ecoScore}
        </span>
      </div>
      <div className="min-w-0 flex-1 p-3">
        <p className="truncate text-[13px] font-bold text-slate-900">{route.title}</p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-medium text-slate-500">
          <MapPin size={11} />
          {route.location}
        </p>
        <div className="mt-2 flex items-center gap-2.5 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <RouteIcon size={12} className="text-emerald-500" />
            {route.distanceKm} km
          </span>
          <span className="flex items-center gap-1">
            <Mountain size={12} className="text-slate-400" />
            {route.elevationGainM} m
          </span>
          <span className={`rounded-full px-1.5 py-0.5 ${diff.soft}`}>{diff.label}</span>
        </div>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
          {formatDuration(route.estimatedDurationMins)} · View route →
        </p>
      </div>
    </button>
  );
}
