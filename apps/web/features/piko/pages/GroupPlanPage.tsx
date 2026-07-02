import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Award,
  ThumbsUp,
  Users,
  Sparkles,
  ChevronRight,
  Plus,
  Route as RouteIcon,
  Mountain,
  Leaf,
} from 'lucide-react';
import { GroupMember, GroupTask, Route } from '../types';
import { rankForGroup } from '../ranking';
import { loadTasks, saveTasks } from '../group';
import { difficultyStyles } from '../utils';

interface GroupPlanPageProps {
  onClose: () => void;
  candidates: Route[];
  members: GroupMember[];
  onVote: (routeId: string, value: -1 | 0 | 1) => void;
  onOpenRoute: (route: Route) => void;
}

/**
 * Group collaboration view: presence, a group-aware ranked shortlist whose top
 * pick is the collaborative "Selected Route", live voting, and task assignment.
 */
export function GroupPlanPage({ onClose, candidates, members, onVote, onOpenRoute }: GroupPlanPageProps) {
  const ranked = useMemo(() => rankForGroup(candidates), [candidates]);
  const selected = ranked[0];
  const rest = ranked.slice(1);

  const [tasks, setTasks] = useState<GroupTask[]>(() => loadTasks());
  const memberOf = (id: string | null) => members.find((m) => m.id === id) ?? null;
  const onlineCount = members.filter((m) => m.online).length;

  const cycleAssignee = (taskId: string) => {
    setTasks((prev) => {
      const ids: (string | null)[] = [null, ...members.map((m) => m.id)];
      const next = prev.map((t) => {
        if (t.id !== taskId) return t;
        const idx = ids.indexOf(t.assignee);
        return { ...t, assignee: ids[(idx + 1) % ids.length] };
      });
      saveTasks(next);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      className="absolute inset-0 z-[75] bg-gray-50 flex flex-col"
    >
      {/* Header */}
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
          <div className="flex-1">
            <h1 className="text-base font-black text-slate-900 leading-none">Group planning</h1>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{onlineCount} online now</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-28">
        {/* Presence */}
        <div className="flex items-center gap-2 mb-5">
          {members.map((m) => (
            <div key={m.id} className="relative">
              <span
                className="grid place-items-center w-10 h-10 rounded-full text-white text-xs font-bold"
                style={{ background: m.color }}
                title={m.name}
              >
                {m.initials}
              </span>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-gray-50 ${
                  m.online ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            </div>
          ))}
          <span className="ml-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
            <Users size={13} /> {members.length}
          </span>
        </div>

        {ranked.length === 0 ? (
          <div className="grid place-items-center py-16 text-center">
            <div className="grid place-items-center w-14 h-14 rounded-2xl bg-white text-emerald-500 ring-1 ring-gray-100 mb-3">
              <Sparkles size={26} />
            </div>
            <p className="text-sm font-bold text-slate-700">No routes to compare yet</p>
            <p className="text-sm text-slate-400 mt-1 max-w-[16rem]">
              Save a few routes and they’ll show up here for the group to vote on.
            </p>
          </div>
        ) : (
          <>
            {/* Selected route */}
            {selected && (
              <section className="mb-6">
                <div className="flex items-center gap-1.5 mb-2 text-emerald-600">
                  <Award size={15} />
                  <h2 className="text-[11px] font-black uppercase tracking-wider">Selected route</h2>
                </div>
                <div className="rounded-3xl overflow-hidden bg-white ring-1 ring-emerald-200 shadow-lg shadow-emerald-500/10">
                  <button
                    type="button"
                    onClick={() => onOpenRoute(selected.route)}
                    className="block w-full text-left active:scale-[0.99] transition-transform"
                  >
                    <div className="relative h-32">
                      <img src={selected.route.photos[0]} alt={selected.route.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white">
                        <Award size={12} /> Top pick · {selected.score}
                      </span>
                      <div className="absolute bottom-2.5 left-3.5 right-3.5">
                        <p className="text-white font-black text-lg leading-tight drop-shadow">{selected.route.title}</p>
                        <p className="text-white/85 text-xs font-medium">{selected.route.location}</p>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-3 px-4 py-3 text-[12px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><RouteIcon size={13} className="text-emerald-500" />{selected.route.distanceKm} km</span>
                    <span className="flex items-center gap-1"><Mountain size={13} className="text-slate-400" />{selected.route.elevationGainM} m</span>
                    <span className="flex items-center gap-1"><Leaf size={13} className="text-emerald-500" />{selected.route.ecoScore}</span>
                    <VoteChip route={selected.route} onVote={onVote} className="ml-auto" />
                  </div>
                </div>
              </section>
            )}

            {/* Ranked alternatives */}
            {rest.length > 0 && (
              <section className="mb-6">
                <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5">Also in the running</h2>
                <div className="flex flex-col gap-2.5">
                  {rest.map((fit, i) => (
                    <div key={fit.route.id} className="flex items-center gap-3 rounded-2xl bg-white ring-1 ring-gray-100 p-2.5">
                      <span className="grid place-items-center w-7 h-7 rounded-full bg-gray-100 text-slate-500 text-xs font-black shrink-0">
                        {i + 2}
                      </span>
                      <button type="button" onClick={() => onOpenRoute(fit.route)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                        <img src={fit.route.photos[0]} alt={fit.route.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{fit.route.title}</p>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                            <span>Fit {fit.score}</span>
                            <span className={`rounded-full px-1.5 py-0.5 ${difficultyStyles(fit.route.difficulty).soft}`}>
                              {difficultyStyles(fit.route.difficulty).label}
                            </span>
                          </div>
                        </div>
                      </button>
                      <VoteChip route={fit.route} onVote={onVote} className="shrink-0" />
                      <ChevronRight size={16} className="text-gray-300 shrink-0" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Tasks */}
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5">Who’s bringing what</h2>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => {
              const m = memberOf(task.assignee);
              return (
                <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-white ring-1 ring-gray-100 px-3.5 py-2.5">
                  <span className="flex-1 text-sm font-semibold text-slate-700">{task.label}</span>
                  <button
                    type="button"
                    onClick={() => cycleAssignee(task.id)}
                    aria-label={m ? `Assigned to ${m.name}. Tap to change.` : 'Assign this task'}
                    className="flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    {m ? (
                      <>
                        <span className="text-xs font-bold text-slate-500">{m.you ? 'You' : m.name}</span>
                        <span className="grid place-items-center w-8 h-8 rounded-full text-white text-[11px] font-bold" style={{ background: m.color }}>
                          {m.initials}
                        </span>
                      </>
                    ) : (
                      <span className="grid place-items-center w-8 h-8 rounded-full border-2 border-dashed border-gray-300 text-gray-400">
                        <Plus size={16} />
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <ThumbsUp size={12} /> Tap an avatar to pass a task around the group.
          </p>
        </section>
      </div>
    </motion.div>
  );
}

function VoteChip({
  route,
  onVote,
  className = '',
}: {
  route: Route;
  onVote: (routeId: string, value: -1 | 0 | 1) => void;
  className?: string;
}) {
  const up = route.userVote === 1;
  const score = route.voteScore ?? 0;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onVote(route.id, up ? 0 : 1);
      }}
      aria-pressed={up}
      aria-label="Upvote route"
      className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors ${
        up ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-slate-600'
      } ${className}`}
    >
      <ThumbsUp size={13} className={up ? 'fill-white' : ''} />
      {score > 0 ? `+${score}` : score}
    </button>
  );
}
