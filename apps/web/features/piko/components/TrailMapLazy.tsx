import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { TrailMapProps } from './TrailMap';

/**
 * Lazy entry point for the map.
 *
 * `maplibre-gl` (+ its CSS) is ~1 MB — far too heavy to sit in the main bundle
 * when Discover and Saved never touch a map. This dynamic import splits MapLibre
 * and `TrailMap` into their own chunk that loads only when a map first renders
 * (Map tab, route detail, draw, or record). Everything else imports THIS file,
 * never `./TrailMap` directly.
 */
const TrailMapImpl = lazy(() => import('./TrailMap').then((m) => ({ default: m.TrailMap })));

export function TrailMap(props: TrailMapProps) {
  return (
    <Suspense fallback={<MapFallback className={props.className} />}>
      <TrailMapImpl {...props} />
    </Suspense>
  );
}

function MapFallback({ className = '' }: { className?: string }) {
  return (
    <div className={`grid place-items-center bg-emerald-50 text-emerald-400 ${className}`}>
      <Loader2 size={24} className="animate-spin" />
    </div>
  );
}
