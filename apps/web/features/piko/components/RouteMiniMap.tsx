import { useMemo } from 'react';
import { MapPin, Flag } from 'lucide-react';
import { RouteGeometry } from '../types';

interface RouteMiniMapProps {
  geometry?: RouteGeometry;
  className?: string;
}

/**
 * A dependency-free schematic of the route's real geometry. Projects the
 * [lng, lat] polyline into an SVG viewBox with start/end markers. This is a
 * shape preview, not a tiled basemap — the interactive MapLibre map is Phase 1.
 */
export function RouteMiniMap({ geometry, className = '' }: RouteMiniMapProps) {
  const path = useMemo(() => {
    const coords = geometry?.coordinates ?? [];
    if (coords.length < 2) return null;

    const W = 300;
    const H = 170;
    const pad = 22;
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const spanLng = maxLng - minLng || 1e-4;
    const spanLat = maxLat - minLat || 1e-4;
    // Preserve aspect ratio so the shape isn't distorted.
    const scale = Math.min((W - pad * 2) / spanLng, (H - pad * 2) / spanLat);
    const offX = (W - spanLng * scale) / 2;
    const offY = (H - spanLat * scale) / 2;

    const project = (c: number[]): [number, number] => [
      offX + (c[0] - minLng) * scale,
      // Flip Y so north is up.
      H - (offY + (c[1] - minLat) * scale),
    ];

    const pts = coords.map(project);
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    return { d, start: pts[0], end: pts[pts.length - 1], W, H };
  }, [geometry]);

  if (!path) return null;

  return (
    <div className={`relative rounded-3xl overflow-hidden ring-1 ring-emerald-100 ${className}`}>
      <svg viewBox={`0 0 ${path.W} ${path.H}`} className="w-full h-full" role="img" aria-label="Route shape">
        <defs>
          <linearGradient id="piko-map-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ecfdf5" />
            <stop offset="100%" stopColor="#d1fae5" />
          </linearGradient>
        </defs>
        <rect width={path.W} height={path.H} fill="url(#piko-map-bg)" />
        {/* subtle contour grid */}
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={(path.H / 5) * (i + 1)}
            x2={path.W}
            y2={(path.H / 5) * (i + 1)}
            stroke="#10b981"
            strokeOpacity="0.08"
          />
        ))}
        <path d={path.d} fill="none" stroke="#059669" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={path.start[0]} cy={path.start[1]} r="6" fill="#10b981" stroke="white" strokeWidth="2.5" />
        <circle cx={path.end[0]} cy={path.end[1]} r="6" fill="#0f172a" stroke="white" strokeWidth="2.5" />
      </svg>
      <span className="absolute top-2.5 left-3 flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full">
        <MapPin size={11} /> Start
      </span>
      <span className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full">
        <Flag size={11} /> Finish
      </span>
    </div>
  );
}
