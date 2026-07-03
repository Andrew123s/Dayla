import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck, Check, Trash2, Loader2, AlertCircle, Flag, MapPin } from 'lucide-react';
import { Route } from '../types';
import { RoutePhoto } from '../components/RoutePhoto';
import { difficultyStyles } from '../utils';

/** A queue item is a route plus its report context. */
export interface ModerationItem extends Route {
  reportCount?: number;
  reportReasons?: string[];
}

interface ModerationPageProps {
  onClose: () => void;
  fetchQueue: () => Promise<ModerationItem[]>;
  /** Approve or remove; resolves when persisted. */
  onModerate: (id: string, action: 'approve' | 'remove') => Promise<void>;
}

/**
 * Phase 4 moderation queue — admin-only review of pending (new UGC) and
 * flagged (reported) routes. Approve publishes to everyone; Remove hides the
 * route from all listings (the record is kept for audit).
 */
export function ModerationPage({ onClose, fetchQueue, onModerate }: ModerationPageProps) {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchQueue());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the queue');
    } finally {
      setLoading(false);
    }
  }, [fetchQueue]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: 'approve' | 'remove') => {
    if (busyId) return;
    setBusyId(id);
    try {
      await onModerate(id, action);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      /* leave the item in place on failure */
    } finally {
      setBusyId(null);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      role="dialog"
      aria-modal="true"
      aria-label="Moderation queue"
      className="absolute inset-0 z-[80] bg-gray-50 flex flex-col"
    >
      <div className="shrink-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-3 pt-safe-top">
        <div className="h-14 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="grid place-items-center w-10 h-10 rounded-full text-slate-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <ShieldCheck size={18} className="text-emerald-600" />
          <div className="flex-1">
            <h1 className="text-base font-black text-slate-900 leading-none">Moderation queue</h1>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              {loading ? 'Loading…' : `${items.length} awaiting review`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-10">
        {loading ? (
          <div className="grid place-items-center py-16 text-emerald-500">
            <Loader2 size={26} className="animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-center py-14 px-6">
            <AlertCircle size={22} className="text-rose-500 mb-2" />
            <p className="text-sm font-semibold text-slate-700 mb-4">{error}</p>
            <button
              type="button"
              onClick={load}
              className="text-sm font-bold text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full active:scale-95 transition-transform"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="grid place-items-center w-14 h-14 rounded-2xl bg-white text-emerald-500 ring-1 ring-gray-100 mb-3">
              <ShieldCheck size={26} />
            </div>
            <p className="text-sm font-bold text-slate-700">Queue is clear</p>
            <p className="text-sm text-slate-400 mt-1 max-w-[16rem]">
              New community routes and reported content will appear here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const busy = busyId === item.id;
              return (
                <li key={item.id} className="rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <RoutePhoto src={item.photos[0]} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            item.moderationStatus === 'flagged' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.moderationStatus === 'flagged' ? 'Flagged' : 'Pending'}
                        </span>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-medium text-slate-500">
                        <MapPin size={11} />
                        {item.location || 'No location'} · by {item.creatorName || 'Unknown'}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <span>{item.distanceKm} km</span>
                        <span>{item.elevationGainM} m</span>
                        <span className={`rounded-full px-1.5 py-0.5 ${difficultyStyles(item.difficulty).soft}`}>
                          {difficultyStyles(item.difficulty).label}
                        </span>
                        {(item.reportCount ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-rose-500">
                            <Flag size={11} /> {item.reportCount}
                          </span>
                        )}
                      </div>
                      {item.reportReasons && item.reportReasons.length > 0 && (
                        <p className="mt-1 truncate text-[11px] italic text-slate-400">“{item.reportReasons[0]}”</p>
                      )}
                    </div>
                  </div>
                  <div className="flex border-t border-gray-100">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => act(item.id, 'approve')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                    >
                      {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Approve
                    </button>
                    <div className="w-px bg-gray-100" />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => act(item.id, 'remove')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
