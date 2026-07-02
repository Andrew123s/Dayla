import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Undo2, Trash2, Loader2, Route as RouteIcon, Mountain, Clock, AlertCircle } from 'lucide-react';
import { NewRouteInput, RouteGeometry } from '../types';
import { TrailMap } from '../components/TrailMapLazy';
import { snapRoute, GhProfile } from '../graphhopper';
import { scoreDifficulty, estimateDurationMins } from '../geo';
import { isMapConfigured } from '../map/mapConfig';
import { formatDuration } from '../utils';

type LngLat = [number, number];

interface DrawRoutePageProps {
  onClose: () => void;
  onSave: (input: NewRouteInput) => Promise<void> | void;
  /** Host API base for the routing proxy (Dayla passes its API_BASE_URL). */
  apiBase?: string;
}

const PROFILES: { id: GhProfile; label: string }[] = [
  { id: 'foot', label: 'Walk' },
  { id: 'hike', label: 'Hike' },
  { id: 'bike', label: 'Bike' },
];

/** Draw waypoints on the map → snap to real trails via GraphHopper → save. */
export function DrawRoutePage({ onClose, onSave, apiBase = '' }: DrawRoutePageProps) {
  const [points, setPoints] = useState<LngLat[]>([]);
  const [snapped, setSnapped] = useState<RouteGeometry | null>(null);
  const [metrics, setMetrics] = useState<{ distanceKm: number; elevationGainM: number; durationMins: number } | null>(null);
  const [profile, setProfile] = useState<GhProfile>('foot');
  const [snapping, setSnapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Snap whenever the waypoints or profile change (debounced; cancellable).
  useEffect(() => {
    if (points.length < 2) {
      setSnapped(null);
      setMetrics(null);
      setError(null);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setSnapping(true);
      setError(null);
      try {
        const r = await snapRoute(points, { profile, apiBase, signal: ac.signal });
        setSnapped(r.geometry);
        setMetrics({ distanceKm: r.distanceKm, elevationGainM: r.elevationGainM, durationMins: r.durationMins });
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setSnapped(null);
        setMetrics(null);
        setError(e instanceof Error ? e.message : 'Could not snap to trails');
      } finally {
        setSnapping(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [points, profile, apiBase]);

  const addPoint = (lngLat: LngLat) => setPoints((p) => [...p, lngLat]);
  const undo = () => setPoints((p) => p.slice(0, -1));
  const clear = () => setPoints([]);

  const canSave = !!snapped && !!metrics && metrics.distanceKm > 0 && title.trim().length > 1 && !snapping;

  const handleSave = async () => {
    if (!canSave || !snapped || !metrics) return;
    setSaving(true);
    try {
      const difficulty = scoreDifficulty(metrics.distanceKm, metrics.elevationGainM);
      const input: NewRouteInput = {
        title: title.trim(),
        description: 'Hand-drawn route, snapped to real trails. Add photos, tags and a description to share it.',
        difficulty,
        distanceKm: metrics.distanceKm,
        elevationGainM: metrics.elevationGainM,
        estimatedDurationMins: metrics.durationMins || estimateDurationMins(metrics.distanceKm, metrics.elevationGainM),
        geometry: snapped,
        tags: ['User route', 'Drawn'],
        ecoScore: 75,
        weatherScore: 70,
        accessibilityScore: 50,
        ecoImpact: { transportMode: 'Your own way there', co2EstimateKg: 0, greenerAlternatives: [] },
      };
      await onSave(input);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 300 }}
      className="absolute inset-0 z-[70] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 pt-safe-top">
        <div className="h-14 flex items-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel"
            className="grid place-items-center w-10 h-10 rounded-full bg-white/90 backdrop-blur text-slate-700 shadow ring-1 ring-black/5"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="h-14 flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={points.length === 0}
            aria-label="Undo last point"
            className="grid place-items-center w-10 h-10 rounded-full bg-white/90 backdrop-blur text-slate-700 shadow ring-1 ring-black/5 disabled:opacity-40"
          >
            <Undo2 size={18} />
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={points.length === 0}
            aria-label="Clear all points"
            className="grid place-items-center w-10 h-10 rounded-full bg-white/90 backdrop-blur text-rose-500 shadow ring-1 ring-black/5 disabled:opacity-40"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <TrailMap draw drawPoints={points} drawGeometry={snapped} className="h-full w-full !rounded-none" />

        {isMapConfigured() && points.length === 0 && (
          <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none px-6">
            <span className="bg-slate-900/85 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl text-center">
              Tap the map to drop waypoints — we’ll snap them to real trails.
            </span>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="shrink-0 bg-white border-t border-gray-100 px-5 pt-3 pb-safe shadow-[0_-8px_30px_rgba(15,23,42,0.06)]">
        {/* Profile selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 mb-3">
          {PROFILES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProfile(p.id)}
              className={`flex-1 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                profile === p.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Metrics / status */}
        <div className="min-h-[2.5rem] flex items-center mb-2">
          {snapping ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 size={16} className="animate-spin text-emerald-500" /> Snapping to trails…
            </span>
          ) : error ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-rose-500">
              <AlertCircle size={16} /> {error}
            </span>
          ) : metrics ? (
            <div className="flex items-center gap-5 text-sm font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <RouteIcon size={15} className="text-emerald-500" /> {metrics.distanceKm} km
              </span>
              <span className="flex items-center gap-1.5">
                <Mountain size={15} className="text-slate-400" /> {metrics.elevationGainM} m
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-slate-400" /> {formatDuration(metrics.durationMins)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-slate-400">
              {points.length === 1 ? 'Add one more point to start.' : 'Tap the map to begin.'}
            </span>
          )}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name your route"
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400 mb-3"
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/30"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : null}
          {saving ? 'Saving…' : 'Save route'}
        </button>
      </div>
    </motion.div>
  );
}
