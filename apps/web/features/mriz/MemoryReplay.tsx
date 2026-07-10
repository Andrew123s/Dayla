import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Play, Camera } from 'lucide-react';
import type { Memory, MemoryMedia } from './types';
import { seasonColor } from './types';

/**
 * Mriz Route Replay (web) — the trip retold as a slow, cinematic animation.
 * The route draws itself as a projected SVG path (dependency-free, like
 * RouteMiniMap), photos surface as floating polaroids at their place on the
 * trail — or spread through the draw in capture-time order when untagged —
 * an elevation ribbon fills beneath, and the story closes on its milestones.
 * Click anywhere to pause/resume. Without a route it degrades into a slow
 * crossfade slideshow of the trip's photos.
 */

interface MemoryReplayProps {
  memory: Memory;
  onClose: () => void;
}

/** Fraction of the timeline used for the route draw; the rest is the outro. */
const DRAW_END = 0.84;

interface PhotoEvent {
  fraction: number;
  media: MemoryMedia;
  /** Projected SVG position when the photo has GPS. */
  x?: number;
  y?: number;
}

export const MemoryReplay: React.FC<MemoryReplayProps> = ({ memory, onClose }) => {
  const color = seasonColor(memory.season);
  const coords = memory.routeGeometry?.coordinates ?? [];
  const hasRoute = coords.length > 1;

  // ── Timeline: rAF-driven progress 0..1, click to pause ────────────────────
  const durationMs = Math.min(45, Math.max(20, 18 + memory.media.length * 2.5)) * 1000;
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  const progressRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (playingRef.current && progressRef.current < 1) {
        progressRef.current = Math.min(1, progressRef.current + dt / durationMs);
        setProgress(progressRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs]);

  const togglePlay = () => {
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      setProgress(0);
      playingRef.current = true;
      setPlaying(true);
      return;
    }
    playingRef.current = !playingRef.current;
    setPlaying(playingRef.current);
  };

  // Ease the raw progress so the whole piece breathes (no linear robot-draw).
  const t = easeInOutCubic(progress);
  const drawT = Math.min(1, t / DRAW_END);

  // ── Route projection into a fixed viewBox (like RouteMiniMap) ─────────────
  const W = 1000;
  const H = 620;
  const projected = useMemo(() => {
    if (!hasRoute) return null;
    const pad = 90;
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const spanLng = maxLng - minLng || 1e-4;
    const spanLat = maxLat - minLat || 1e-4;
    const scale = Math.min((W - pad * 2) / spanLng, (H - pad * 2) / spanLat);
    const offX = (W - spanLng * scale) / 2;
    const offY = (H - spanLat * scale) / 2;
    const pts = coords.map((c): [number, number] => [
      offX + (c[0] - minLng) * scale,
      H - (offY + (c[1] - minLat) * scale),
    ]);
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    return { pts, d };
  }, [coords, hasRoute]);

  // ── Photo schedule: GPS photos pin to their spot; others spread by time ───
  const events = useMemo<PhotoEvent[]>(() => {
    const out: PhotoEvent[] = [];
    const unplaced: MemoryMedia[] = [];
    for (const m of memory.media) {
      if (m.coords && projected) {
        let best = 0;
        let bestDist = Infinity;
        coords.forEach((c, i) => {
          const d = (c[1] - m.coords!.lat) ** 2 + (c[0] - m.coords!.lng) ** 2;
          if (d < bestDist) { bestDist = d; best = i; }
        });
        out.push({
          fraction: (best / (coords.length - 1)) * DRAW_END,
          media: m,
          x: projected.pts[best][0],
          y: projected.pts[best][1],
        });
      } else {
        unplaced.push(m);
      }
    }
    unplaced
      .slice()
      .sort((a, b) => (a.takenAt || '9999').localeCompare(b.takenAt || '9999'))
      .forEach((m, i) => {
        out.push({ fraction: ((i + 1) / (unplaced.length + 1)) * DRAW_END, media: m });
      });
    return out.sort((a, b) => a.fraction - b.fraction);
  }, [memory.media, coords, projected]);

  // ── Elevation ribbon data ──────────────────────────────────────────────────
  const elevations = useMemo(
    () => coords.filter((c) => c.length > 2).map((c) => c[2]),
    [coords]
  );

  const weather = memory.weatherDays?.[0];

  return (
    <div
      className="fixed inset-0 z-[90] bg-black select-none cursor-pointer overflow-hidden"
      onClick={togglePlay}
    >
      {/* Scene */}
      {hasRoute && projected ? (
        <RouteScene
          d={projected.d}
          pts={projected.pts}
          drawT={drawT}
          color={color}
          events={events}
          t={t}
          W={W}
          H={H}
        />
      ) : (
        <Slideshow memory={memory} drawT={Math.min(0.999, drawT)} color={color} />
      )}

      {/* Photo polaroids */}
      {events.map((event, i) => (
        <Polaroid key={i} event={event} t={t} />
      ))}

      {/* Elevation ribbon */}
      {elevations.length > 10 && (
        <ElevationRibbon elevations={elevations} progress={drawT} color={color} />
      )}

      {/* Header */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute top-4 inset-x-0 flex items-start px-3">
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X size={20} />
        </button>
        <div
          className="flex-1 text-center transition-opacity duration-500"
          style={{ opacity: Math.min(1, t * 4) }}
        >
          <div className="text-white font-extrabold text-lg leading-tight truncate px-2">
            {memory.title}
          </div>
          {weather?.condition && (
            <div className="text-white/75 text-xs">
              {weather.condition}
              {typeof weather.tempC === 'number' ? ` · ${Math.round(weather.tempC)}°C` : ''}
            </div>
          )}
        </div>
        <div className="w-9" />
      </div>

      {/* Milestone outro */}
      {t > DRAW_END && <Outro memory={memory} t={t} color={color} />}

      {/* Pause hint */}
      {!playing && progress < 1 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play size={72} className="text-white/70" fill="currentColor" />
        </div>
      )}

      {/* Progress line */}
      <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/15">
        <div className="h-full transition-none" style={{ width: `${progress * 100}%`, background: color }} />
      </div>
    </div>
  );
};

// ── Scene: the route drawing itself over a soft terrain backdrop ────────────
const RouteScene: React.FC<{
  d: string;
  pts: [number, number][];
  drawT: number;
  color: string;
  events: PhotoEvent[];
  t: number;
  W: number;
  H: number;
}> = ({ d, pts, drawT, color, events, t, W, H }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(1);
  useEffect(() => {
    if (pathRef.current) setLength(pathRef.current.getTotalLength());
  }, [d]);

  const headIndex = Math.min(pts.length - 1, Math.round(drawT * (pts.length - 1)));
  const head = pts[headIndex];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="mriz-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#101816" />
          <stop offset="100%" stopColor="#1c2a24" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#mriz-bg)" />
      {/* Contour whispers */}
      {[...Array(7)].map((_, i) => (
        <line
          key={i}
          x1="0"
          y1={(H / 7) * (i + 1)}
          x2={W}
          y2={(H / 7) * (i + 1)}
          stroke={color}
          strokeOpacity="0.06"
        />
      ))}
      {/* Full route, faint, underneath */}
      <path d={d} fill="none" stroke={color} strokeOpacity="0.2" strokeWidth="3" strokeLinejoin="round" />
      {/* The story line drawing itself */}
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - drawT)}
      />
      {/* Start dot */}
      <circle cx={pts[0][0]} cy={pts[0][1]} r="8" fill={color} stroke="white" strokeWidth="3" />
      {/* Finish dot appears when the draw completes */}
      {drawT >= 1 && (
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="8" fill="#0f172a" stroke="white" strokeWidth="3" />
      )}
      {/* Travelling head */}
      {drawT < 1 && (
        <circle cx={head[0]} cy={head[1]} r="9" fill="white" stroke={color} strokeWidth="5" />
      )}
      {/* Passed photo pins stay behind */}
      {events.map((event, i) =>
        event.x !== undefined && t >= event.fraction ? (
          <g key={i} transform={`translate(${event.x}, ${event.y})`}>
            <circle r="12" fill="white" opacity="0.95" />
            <Camera size={13} x={-6.5} y={-6.5} color={color} />
          </g>
        ) : null
      )}
    </svg>
  );
};

// ── Slideshow fallback (no route) ────────────────────────────────────────────
const Slideshow: React.FC<{ memory: Memory; drawT: number; color: string }> = ({ memory, drawT, color }) => {
  if (memory.media.length === 0) {
    return memory.coverPhoto ? (
      <img src={memory.coverPhoto} alt="" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full" style={{ background: color }} />
    );
  }
  const index = Math.floor(drawT * memory.media.length);
  return (
    <div className="w-full h-full relative">
      {memory.media.map((m, i) => (
        <img
          key={i}
          src={m.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </div>
  );
};

// ── Floating polaroid for a photo moment ────────────────────────────────────
const Polaroid: React.FC<{ event: PhotoEvent; t: number }> = ({ event, t }) => {
  const window = 0.09;
  const local = (t - event.fraction) / window;
  if (local < 0 || local > 1) return null;
  const opacity = local < 0.25 ? local / 0.25 : local > 0.8 ? (1 - local) / 0.2 : 1;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className="bg-white rounded-2xl p-2 shadow-2xl"
        style={{ opacity, transform: `scale(${0.92 + 0.08 * opacity})` }}
      >
        <img src={event.media.url} alt="" className="w-56 h-56 object-cover rounded-xl" />
      </div>
    </div>
  );
};

// ── Elevation ribbon ─────────────────────────────────────────────────────────
const ElevationRibbon: React.FC<{ elevations: number[]; progress: number; color: string }> = ({
  elevations,
  progress,
  color,
}) => {
  const W = 1000;
  const H = 90;
  const minE = Math.min(...elevations);
  const maxE = Math.max(...elevations);
  const span = maxE - minE || 1;
  const visible = Math.max(2, Math.round(progress * elevations.length));
  const pts = elevations
    .slice(0, visible)
    .map((e, i) => `${(W * i) / (elevations.length - 1)},${H - 8 - ((e - minE) / span) * (H - 24)}`);
  const line = `M${pts.join(' L')}`;
  const lastX = (W * (visible - 1)) / (elevations.length - 1);
  return (
    <div className="absolute bottom-0 inset-x-0 pointer-events-none">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 90 }} preserveAspectRatio="none">
        <path d={`${line} L${lastX},${H} L0,${H} Z`} fill={color} fillOpacity="0.35" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// ── Milestone outro ──────────────────────────────────────────────────────────
const Outro: React.FC<{ memory: Memory; t: number; color: string }> = ({ memory, t, color }) => {
  const outroT = Math.min(1, (t - DRAW_END) / (1 - DRAW_END));
  const s = memory.stats;
  const lines = [
    [
      s.distanceKm > 0 ? `${s.distanceKm.toFixed(1)} km` : null,
      `${s.days} day${s.days === 1 ? '' : 's'}`,
      s.companions > 0 ? `${s.companions + 1} of you` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    ...memory.milestones,
  ];
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ background: `rgba(0,0,0,${0.55 * outroT})` }}
    >
      <div className="text-center px-10">
        {lines.map((line, i) => (
          <div
            key={i}
            className="py-2 transition-opacity duration-300"
            style={{
              opacity: Math.max(0, Math.min(1, outroT * (lines.length + 1) - i)),
              color: i === 0 ? 'white' : color,
              fontSize: i === 0 ? 15 : 19,
              fontWeight: i === 0 ? 500 : 800,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export default MemoryReplay;
