import { useMemo } from 'react';
import { Mountain, TrendingUp } from 'lucide-react';
import { RouteGeometry } from '../types';
import { haversineKm } from '../geo';

interface ElevationProfileProps {
  geometry?: RouteGeometry;
  className?: string;
}

/**
 * Dependency-free elevation chart built from the route's 3D coordinates
 * ([lng, lat, ele]). Renders nothing if the geometry has no elevation data
 * (e.g. a GPX without <ele>, or a route never snapped with elevation).
 */
export function ElevationProfile({ geometry, className = '' }: ElevationProfileProps) {
  const profile = useMemo(() => {
    const coords = geometry?.coordinates ?? [];
    const withEle = coords.filter((c) => typeof c[2] === 'number');
    if (withEle.length < 2 || withEle.length / coords.length < 0.5) return null;

    let dist = 0;
    const pts = withEle.map((c, i) => {
      if (i > 0) dist += haversineKm(withEle[i - 1], c);
      return { d: dist, ele: c[2] as number };
    });

    const eles = pts.map((p) => p.ele);
    const minEle = Math.min(...eles);
    const maxEle = Math.max(...eles);
    const totalKm = pts[pts.length - 1].d || 1;
    const span = maxEle - minEle || 1;

    const W = 320;
    const H = 96;
    const pad = 4;
    const x = (d: number) => pad + (d / totalKm) * (W - pad * 2);
    const y = (e: number) => H - pad - ((e - minEle) / span) * (H - pad * 2);

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.d).toFixed(1)},${y(p.ele).toFixed(1)}`).join(' ');
    const area = `${line} L${x(totalKm).toFixed(1)},${H - pad} L${x(0).toFixed(1)},${H - pad} Z`;

    return { line, area, minEle: Math.round(minEle), maxEle: Math.round(maxEle), totalKm: Math.round(totalKm * 10) / 10, W, H };
  }, [geometry]);

  if (!profile) return null;

  return (
    <section className={`pt-6 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-900">Elevation</h2>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <TrendingUp size={13} className="text-emerald-500" /> {profile.maxEle} m
          </span>
          <span className="flex items-center gap-1">
            <Mountain size={13} className="text-slate-400" /> {profile.minEle} m
          </span>
        </div>
      </div>
      <div className="rounded-2xl bg-gradient-to-b from-emerald-50/60 to-white ring-1 ring-emerald-100 p-2">
        <svg viewBox={`0 0 ${profile.W} ${profile.H}`} className="w-full h-24" role="img" aria-label="Elevation profile">
          <defs>
            <linearGradient id="piko-ele-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={profile.area} fill="url(#piko-ele-fill)" />
          <path d={profile.line} fill="none" stroke="#059669" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div className="flex justify-between px-1 pt-0.5 text-[10px] font-medium text-slate-400">
          <span>0 km</span>
          <span>{profile.totalKm} km</span>
        </div>
      </div>
    </section>
  );
}
