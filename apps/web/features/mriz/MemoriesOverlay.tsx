import React, { useEffect, useMemo, useState } from 'react';
import {
  X, ArrowLeft, Play, Share2, Sparkles, MapPin, Mountain,
  CalendarDays, Users, Ruler, Loader,
} from 'lucide-react';
import type { Memory } from './types';
import { seasonColor, seasonLabel } from './types';
import { fetchMemories, fetchMemory, shareMemory } from './dataSource';
import MemoryReplay from './MemoryReplay';

/**
 * Mriz on the web — a full-screen overlay with three internal views:
 * seasonal timeline → story card → cinematic replay. Self-contained so
 * App.tsx only mounts it with an optional deep-linked memory id
 * (notification clicks land straight on the story card).
 */

interface MemoriesOverlayProps {
  /** When set, open directly on this memory's story card. */
  initialMemoryId?: string | null;
  onClose: () => void;
}

export const MemoriesOverlay: React.FC<MemoriesOverlayProps> = ({ initialMemoryId, onClose }) => {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [error, setError] = useState('');
  const [openMemory, setOpenMemory] = useState<Memory | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchMemories().then(setMemories).catch((e) => setError(e.message));
  }, []);

  // Deep link from a "memory ready" notification.
  useEffect(() => {
    if (!initialMemoryId) return;
    setLoadingDetail(true);
    fetchMemory(initialMemoryId)
      .then(setOpenMemory)
      .catch(() => {/* fall back to the timeline */})
      .finally(() => setLoadingDetail(false));
  }, [initialMemoryId]);

  const openStory = async (m: Memory) => {
    setLoadingDetail(true);
    try {
      // Refetch for populated participants (list payload has bare ids).
      setOpenMemory(await fetchMemory(m._id));
    } catch {
      setOpenMemory(m);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-[#f7f3ee] flex flex-col max-w-md mx-auto shadow-2xl border-x border-stone-200">
      {replaying && openMemory && (
        <MemoryReplay memory={openMemory} onClose={() => setReplaying(false)} />
      )}

      {openMemory ? (
        <StoryCard
          memory={openMemory}
          onBack={() => setOpenMemory(null)}
          onClose={onClose}
          onReplay={() => setReplaying(true)}
        />
      ) : (
        <Timeline
          memories={memories}
          error={error}
          loadingDetail={loadingDetail}
          onOpen={openStory}
          onClose={onClose}
        />
      )}
    </div>
  );
};

// ── Seasonal timeline ────────────────────────────────────────────────────────
const Timeline: React.FC<{
  memories: Memory[] | null;
  error: string;
  loadingDetail: boolean;
  onOpen: (m: Memory) => void;
  onClose: () => void;
}> = ({ memories, error, loadingDetail, onOpen, onClose }) => {
  const sections = useMemo(() => {
    const map = new Map<string, Memory[]>();
    for (const m of memories || []) {
      const year = m.createdAt ? new Date(m.createdAt).getFullYear() : new Date().getFullYear();
      const key = `${m.season}|${year}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return [...map.entries()];
  }, [memories]);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200">
        <h1 className="text-lg font-extrabold text-stone-800">Memories</h1>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 text-stone-500">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-10">
        {!memories && !error && (
          <div className="flex justify-center pt-16">
            <Loader className="animate-spin text-[#3a5a40]" />
          </div>
        )}
        {error && <p className="text-center text-sm text-red-500 pt-10">{error}</p>}

        {memories && memories.length === 0 && (
          <div className="text-center pt-16 px-6">
            <Sparkles size={44} className="mx-auto text-[#a3b18a]" />
            <h2 className="mt-4 font-bold text-stone-700">No memories yet</h2>
            <p className="mt-2 text-sm text-stone-500">
              When a trip completes, Dayla turns it into a story you can relive
              and share. Mark a past trip as completed to create its memory.
            </p>
          </div>
        )}

        {sections.map(([key, items]) => {
          const [season, year] = key.split('|');
          const color = seasonColor(season);
          return (
            <section key={key}>
              <div className="flex items-center gap-2 mt-6 mb-3">
                <span className="font-extrabold text-sm" style={{ color }}>
                  {seasonLabel(season)} {year}
                </span>
                <div
                  className="flex-1 h-[2px] rounded-full"
                  style={{ background: `linear-gradient(to right, ${color}80, transparent)` }}
                />
              </div>
              <div className="space-y-3">
                {items.map((m) => (
                  <TimelineCard key={m._id} memory={m} onOpen={() => onOpen(m)} />
                ))}
              </div>
            </section>
          );
        })}

        {loadingDetail && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/20">
            <Loader className="animate-spin text-white" />
          </div>
        )}
      </div>
    </>
  );
};

const TimelineCard: React.FC<{ memory: Memory; onOpen: () => void }> = ({ memory, onOpen }) => {
  const color = seasonColor(memory.season);
  const s = memory.stats;
  return (
    <button
      onClick={onOpen}
      className="relative w-full rounded-3xl overflow-hidden shadow-md text-left group"
    >
      <div className="aspect-[16/10] w-full">
        {memory.coverPhoto ? (
          <img
            src={memory.coverPhoto}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}c0, ${color})` }}
          >
            <Mountain size={44} className="text-white/50" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <span
        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9.5px] font-extrabold tracking-widest text-white"
        style={{ background: color }}
      >
        {seasonLabel(memory.season).toUpperCase()}
      </span>
      <div className="absolute bottom-3 left-4 right-4">
        <div className="text-white font-extrabold text-lg leading-tight truncate">{memory.title}</div>
        <div className="text-white/85 text-xs mt-0.5">
          {[
            s.distanceKm > 0 ? `${s.distanceKm.toFixed(1)} km` : null,
            `${s.days} day${s.days === 1 ? '' : 's'}`,
            s.companions > 0 ? `with ${s.companions} friend${s.companions === 1 ? '' : 's'}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
    </button>
  );
};

// ── Story card ───────────────────────────────────────────────────────────────
const StoryCard: React.FC<{
  memory: Memory;
  onBack: () => void;
  onClose: () => void;
  onReplay: () => void;
}> = ({ memory, onBack, onClose, onReplay }) => {
  const color = seasonColor(memory.season);
  const s = memory.stats;
  const weather = memory.weatherDays?.[0];
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [personFilter, setPersonFilter] = useState<string | null>(null);

  const people = memory.participants || [];
  const contributors = new Set(memory.media.map((m) => m.byUser).filter(Boolean));
  const filterPeople = people.filter((p) => contributors.has(p._id));
  const shownMedia = personFilter
    ? memory.media.filter((m) => m.byUser === personFilter)
    : memory.media;
  const canReplay = (memory.routeGeometry?.coordinates?.length ?? 0) > 1 || memory.media.length > 0;

  const doShare = async () => {
    setSharing(true);
    const ok = await shareMemory(memory._id).catch(() => false);
    setSharing(false);
    setShareMsg(ok ? 'Shared to the community feed' : 'Could not share this memory');
    setTimeout(() => setShareMsg(''), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* Cover */}
      <div className="relative h-72">
        {memory.coverPhoto ? (
          <img src={memory.coverPhoto} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${color}b0, ${color})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        <div className="absolute top-3 inset-x-3 flex justify-between">
          <button onClick={onBack} className="p-2 rounded-full bg-white/85 text-stone-700 hover:bg-white">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={doShare}
              disabled={sharing}
              className="p-2 rounded-full bg-white/85 text-stone-700 hover:bg-white"
              title="Share to community"
            >
              {sharing ? <Loader size={18} className="animate-spin" /> : <Share2 size={18} />}
            </button>
            <button onClick={onClose} className="p-2 rounded-full bg-white/85 text-stone-700 hover:bg-white">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-white text-2xl font-extrabold leading-tight">{memory.title}</h1>
          <p className="text-white/85 text-sm mt-0.5">
            {seasonLabel(memory.season)}
            {weather?.condition ? ` · ${weather.condition}` : ''}
          </p>
        </div>
      </div>

      <div className="px-5 pt-5 pb-28">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {s.distanceKm > 0 && <Stat icon={<Ruler size={18} />} value={`${s.distanceKm.toFixed(1)} km`} color={color} />}
          {s.elevationGainM > 0 && <Stat icon={<Mountain size={18} />} value={`${Math.round(s.elevationGainM)} m`} color={color} />}
          <Stat icon={<CalendarDays size={18} />} value={`${s.days}d`} color={color} />
          {s.companions > 0 && <Stat icon={<Users size={18} />} value={`${s.companions + 1}`} color={color} />}
        </div>

        {/* Mood tags */}
        {memory.moodTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {memory.moodTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ color, background: `${color}20` }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Milestones */}
        {memory.milestones.length > 0 && (
          <div className="mt-5 rounded-2xl p-4" style={{ background: `${color}14` }}>
            {memory.milestones.map((line) => (
              <div key={line} className="flex items-center gap-2 py-1">
                <Sparkles size={15} style={{ color }} />
                <span className="text-[13.5px] font-semibold text-stone-700">{line}</span>
              </div>
            ))}
          </div>
        )}

        {/* Companions */}
        {people.length > 0 && (
          <>
            <h3 className="mt-6 mb-2 text-sm font-bold text-stone-700">Together with</h3>
            <div className="flex gap-4 overflow-x-auto pb-1">
              {people.map((p) => (
                <div key={p._id} className="flex flex-col items-center shrink-0">
                  {p.avatar ? (
                    <img src={p.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#a3b18a]/40 flex items-center justify-center text-xs font-bold text-[#3a5a40]">
                      {p.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="text-[10.5px] mt-1 text-stone-600">{p.name?.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Moments with per-person perspectives */}
        {memory.media.length > 0 && (
          <>
            <h3 className="mt-6 mb-2 text-sm font-bold text-stone-700">Moments</h3>
            {filterPeople.length >= 2 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                <FilterChip label="Everyone" active={!personFilter} color={color} onClick={() => setPersonFilter(null)} />
                {filterPeople.map((p) => (
                  <FilterChip
                    key={p._id}
                    label={p.name.split(' ')[0]}
                    active={personFilter === p._id}
                    color={color}
                    onClick={() => setPersonFilter(p._id)}
                  />
                ))}
              </div>
            )}
            {shownMedia.length === 0 ? (
              <p className="text-sm text-stone-400 py-4">No moments from them yet</p>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {shownMedia.map((m, i) => (
                  <img key={i} src={m.url} alt="" className="h-36 w-28 object-cover rounded-2xl shrink-0" />
                ))}
              </div>
            )}
          </>
        )}

        {memory.country && (
          <p className="mt-6 flex items-center gap-1 text-xs text-stone-400">
            <MapPin size={12} /> {memory.country}
          </p>
        )}
      </div>

      {/* Relive */}
      {canReplay && (
        <button
          onClick={onReplay}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-full text-white font-bold shadow-xl hover:brightness-105 active:scale-95 transition-all"
          style={{ background: color }}
        >
          <Play size={18} fill="currentColor" /> Relive
        </button>
      )}

      {shareMsg && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center pointer-events-none">
          <span className="px-4 py-2 rounded-full bg-stone-800 text-white text-sm shadow-lg">{shareMsg}</span>
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; value: string; color: string }> = ({ icon, value, color }) => (
  <div className="rounded-2xl py-3 flex flex-col items-center gap-1" style={{ background: `${color}12` }}>
    <span style={{ color }}>{icon}</span>
    <span className="text-[13px] font-extrabold text-stone-700">{value}</span>
  </div>
);

const FilterChip: React.FC<{ label: string; active: boolean; color: string; onClick: () => void }> = ({
  label,
  active,
  color,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-colors"
    style={{
      background: active ? `${color}25` : 'white',
      borderColor: active ? color : '#e7e5e4',
      color: active ? color : '#57534e',
    }}
  >
    {label}
  </button>
);

export default MemoriesOverlay;
