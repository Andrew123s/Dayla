import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Loader2,
  Route as RouteIcon,
  Mountain,
  Clock,
  AlertCircle,
  Trash2,
  ShieldCheck,
  LocateFixed,
} from 'lucide-react';
import { NewRouteInput } from '../types';
import { TrailMap } from '../components/TrailMapLazy';
import { lineDistanceKm, elevationGainM, haversineKm, scoreDifficulty, estimateDurationMins } from '../geo';
import { isMapConfigured } from '../map/mapConfig';

type LngLat = [number, number];
type Phase = 'consent' | 'recording' | 'paused' | 'summary' | 'denied';

interface RecordRoutePageProps {
  onClose: () => void;
  onSave: (input: NewRouteInput) => Promise<void> | void;
}

function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

/**
 * Record a hike live from the device GPS. Privacy-first: location is only read
 * after explicit consent, the live track stays on-device, and "Discard" deletes
 * it without ever leaving the phone. Tracking stops on pause/stop/leave.
 */
export function RecordRoutePage({ onClose, onSave }: RecordRoutePageProps) {
  const [phase, setPhase] = useState<Phase>('consent');
  const [track, setTrack] = useState<number[][]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const accumulatedRef = useRef(0);

  // ── geolocation lifecycle ───────────────────────────────────────────────────
  const stopWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const onPosition = (pos: GeolocationPosition) => {
    const { longitude: lng, latitude: lat, altitude, accuracy: acc } = pos.coords;
    setAccuracy(acc ?? null);
    setTrack((prev) => {
      const last = prev[prev.length - 1];
      // Drop GPS jitter: ignore fixes that barely moved (<4 m) from the last one.
      if (last && haversineKm(last, [lng, lat]) * 1000 < 4) return prev;
      const point = typeof altitude === 'number' && Number.isFinite(altitude) ? [lng, lat, altitude] : [lng, lat];
      return [...prev, point];
    });
  };

  const onGeoError = (err: GeolocationPositionError) => {
    stopWatch();
    if (err.code === err.PERMISSION_DENIED) {
      setPhase('denied');
    } else {
      setError(err.message || 'Lost the GPS signal. Move to open sky and try again.');
    }
  };

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('This device has no GPS / geolocation support.');
      setPhase('denied');
      return;
    }
    startedAtRef.current = Date.now();
    tickRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startedAtRef.current));
    }, 1000);
    watchIdRef.current = navigator.geolocation.watchPosition(onPosition, onGeoError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 20000,
    });
  };

  const handleStart = () => {
    setError(null);
    setPhase('recording');
    startWatching();
  };

  const handlePause = () => {
    accumulatedRef.current += Date.now() - startedAtRef.current;
    setElapsed(accumulatedRef.current);
    stopWatch();
    setPhase('paused');
  };

  const handleResume = () => {
    setPhase('recording');
    startWatching();
  };

  const handleStop = () => {
    if (phase === 'recording') {
      accumulatedRef.current += Date.now() - startedAtRef.current;
      setElapsed(accumulatedRef.current);
    }
    stopWatch();
    setPhase('summary');
  };

  // Always stop the GPS watch when this screen unmounts (privacy + battery).
  useEffect(() => () => stopWatch(), []);

  const metrics = useMemo(() => {
    const distanceKm = lineDistanceKm(track);
    return {
      distanceKm,
      elevationGainM: elevationGainM(track),
      durationMins: Math.max(0, Math.round(elapsed / 60000)),
    };
  }, [track, elapsed]);

  const lastRaw = track[track.length - 1];
  const last: LngLat | null = lastRaw ? [lastRaw[0], lastRaw[1]] : null;
  const trackGeometry = track.length > 1 ? { type: 'LineString' as const, coordinates: track } : null;

  const canSave = track.length > 1 && metrics.distanceKm > 0 && title.trim().length > 1 && !saving;

  const handleSave = async () => {
    if (!canSave || !trackGeometry) return;
    setSaving(true);
    try {
      const input: NewRouteInput = {
        title: title.trim(),
        description: 'Recorded live with GPS. Add photos, tags and a description to share it.',
        difficulty: scoreDifficulty(metrics.distanceKm, metrics.elevationGainM),
        distanceKm: metrics.distanceKm,
        elevationGainM: metrics.elevationGainM,
        estimatedDurationMins: metrics.durationMins || estimateDurationMins(metrics.distanceKm, metrics.elevationGainM),
        geometry: trackGeometry,
        tags: ['User route', 'Recorded'],
        ecoScore: 80,
        weatherScore: 70,
        accessibilityScore: 50,
        ecoImpact: { transportMode: 'Your own way there', co2EstimateKg: 0, greenerAlternatives: [] },
      };
      await onSave(input);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    stopWatch();
    onClose();
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
      <div className="absolute top-0 inset-x-0 z-20 flex items-center px-3 pt-safe-top">
        <div className="h-14 flex items-center">
          <button
            type="button"
            onClick={discard}
            aria-label="Cancel recording"
            className="grid place-items-center w-10 h-10 rounded-full bg-white/90 backdrop-blur text-slate-700 shadow ring-1 ring-black/5"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        {(phase === 'recording' || phase === 'paused') && (
          <div className="ml-3 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow ring-1 ring-black/5">
            <span className={`w-2.5 h-2.5 rounded-full ${phase === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-sm font-bold text-slate-800 tabular-nums">{formatClock(elapsed)}</span>
            {accuracy != null && (
              <span className="text-[11px] font-semibold text-slate-400">±{Math.round(accuracy)} m</span>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <TrailMap
          drawGeometry={trackGeometry}
          drawPoints={last ? [last] : []}
          recenterTo={last}
          className="h-full w-full !rounded-none"
        />

        {/* Consent gate */}
        {phase === 'consent' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center px-8">
            <div className="grid place-items-center w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mb-5">
              <LocateFixed size={30} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Record with GPS</h2>
            <p className="text-sm text-slate-500 max-w-xs mb-5">
              We’ll use your location to trace the trail as you walk it. The track stays{' '}
              <span className="font-semibold text-slate-700">on your device</span> and is only saved if you choose to —
              you can discard it any time.
            </p>
            <div className="flex items-start gap-2.5 text-left bg-emerald-50/70 rounded-2xl p-3.5 mb-6 max-w-xs">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800/90">
                Recording stops when you pause, stop, or leave this screen. Nothing is uploaded until you tap Save.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="w-full max-w-xs bg-emerald-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-emerald-500/30"
            >
              <Play size={18} className="fill-white" /> Allow location &amp; start
            </button>
            <button type="button" onClick={onClose} className="mt-3 text-sm font-semibold text-slate-400">
              Not now
            </button>
          </div>
        )}

        {/* Permission denied */}
        {phase === 'denied' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center px-8">
            <AlertCircle size={30} className="text-rose-500 mb-3" />
            <h2 className="text-lg font-black text-slate-900 mb-1.5">Location is off</h2>
            <p className="text-sm text-slate-500 max-w-xs mb-6">
              GPS recording needs location access. Enable it for this site in your browser settings, then try again.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-900 text-white font-bold text-sm px-6 py-3 rounded-full active:scale-95 transition-transform"
            >
              Close
            </button>
          </div>
        )}

        {/* Waiting for first fix */}
        {phase === 'recording' && track.length === 0 && (
          <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none px-6">
            <span className="flex items-center gap-2 bg-slate-900/85 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl">
              <Loader2 size={15} className="animate-spin" /> Acquiring GPS…
            </span>
          </div>
        )}
        {error && (phase === 'recording' || phase === 'paused') && (
          <div className="absolute top-20 inset-x-0 flex justify-center px-6">
            <span className="flex items-center gap-2 bg-rose-500 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl text-center">
              <AlertCircle size={15} /> {error}
            </span>
          </div>
        )}
      </div>

      {/* Bottom controls / summary */}
      {(phase === 'recording' || phase === 'paused') && (
        <div className="shrink-0 bg-white border-t border-gray-100 px-5 pt-4 pb-safe">
          <Stats metrics={metrics} />
          <div className="flex items-center gap-3 mt-4">
            {phase === 'recording' ? (
              <button
                type="button"
                onClick={handlePause}
                className="flex-1 bg-amber-100 text-amber-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Pause size={18} /> Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                className="flex-1 bg-emerald-100 text-emerald-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Play size={18} /> Resume
              </button>
            )}
            <button
              type="button"
              onClick={handleStop}
              disabled={track.length < 2}
              className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              <Square size={16} className="fill-white" /> Finish
            </button>
          </div>
        </div>
      )}

      {phase === 'summary' && (
        <div className="shrink-0 bg-white border-t border-gray-100 px-5 pt-4 pb-safe">
          <Stats metrics={metrics} totalTime={formatClock(elapsed)} />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name your route"
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400 mt-4 mb-3"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={discard}
              className="shrink-0 bg-rose-50 text-rose-600 font-bold px-4 py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Trash2 size={18} /> Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1 bg-emerald-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/30"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {saving ? 'Saving…' : 'Save route'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Stats({
  metrics,
  totalTime,
}: {
  metrics: { distanceKm: number; elevationGainM: number; durationMins: number };
  totalTime?: string;
}) {
  return (
    <div className="flex items-center justify-around">
      <Stat icon={RouteIcon} value={`${metrics.distanceKm}`} unit="km" />
      <Stat icon={Mountain} value={`${metrics.elevationGainM}`} unit="m gain" />
      {totalTime ? <Stat icon={Clock} value={totalTime} unit="time" /> : null}
    </div>
  );
}

function Stat({ icon: Icon, value, unit }: { icon: typeof RouteIcon; value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon size={18} className="text-emerald-600" />
      <span className="text-lg font-black text-slate-900 leading-none tabular-nums">{value}</span>
      <span className="text-[11px] text-slate-400 font-semibold">{unit}</span>
    </div>
  );
}
