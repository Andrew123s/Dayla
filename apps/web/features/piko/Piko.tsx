import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Map, Compass, Bookmark, Plus, Loader2, RefreshCw } from 'lucide-react';
import { PikoTab, Route, NewRouteInput, PikoPlan, RouteComment, GroupMember, GroupTask } from './types';
import { PikoDataSource, createLocalDataSource } from './dataSource';
import { parseGpx, gpxToRouteInput } from './gpx';
import { DiscoverPage } from './pages/DiscoverPage';
import { SavedPage } from './pages/SavedPage';
import { RouteDetailPage } from './pages/RouteDetailPage';
import { MapPage } from './pages/MapPage';
import { DrawRoutePage } from './pages/DrawRoutePage';
import { RecordRoutePage } from './pages/RecordRoutePage';
import { GroupPlanPage } from './pages/GroupPlanPage';
import { GROUP_MEMBERS } from './group';
import { BottomNav } from './components/BottomNav';
import { CreateSheet } from './components/CreateSheet';
import { PlanPickerSheet } from './components/PlanPickerSheet';

export interface PikoProps {
  /** Back arrow on the Discover screen (standalone mode). Embedded host owns nav. */
  onExit?: () => void;
  /**
   * Where routes/saves/creates are read & written. Defaults to a local
   * (seed + localStorage) source so Piko runs with zero wiring. Dayla passes
   * an API-backed source via createApiDataSource(authFetch, apiBase).
   */
  dataSource?: PikoDataSource;
  /** When true, Piko renders inside the host's chrome: no internal bottom nav. */
  embedded?: boolean;
  /** Attach a route to a group plan. Falls back to a toast if omitted. */
  onAddToPlan?: (route: Route) => void;
  /** Open turn-by-turn navigation. Defaults to opening the trailhead in maps. */
  onNavigate?: (route: Route) => void;
  /**
   * API base for the routing proxy used by the "Draw on the map" flow
   * (POST {apiBase}/api/piko/route). Defaults to relative — the standalone Vite
   * proxy. Dayla passes its API base so drawing snaps via its Express backend.
   */
  apiBase?: string;
  /** Real group members (Dayla trip collaborators). Defaults to the demo group. */
  members?: GroupMember[];
  /**
   * Dashboard-backed group decision (Dayla). When provided, the group panel uses
   * these instead of the standalone saved-routes + localStorage behaviour.
   */
  group?: {
    candidates?: Route[];
    onGroupVote?: (routeId: string, value: -1 | 0 | 1) => void;
    tasks?: GroupTask[];
    onAssignTask?: (taskId: string, assignee: string | null) => void;
    selectedId?: string | null;
    onSelectRoute?: (routeId: string | null) => void;
  };
}

const SUB_TABS: { id: PikoTab; icon: typeof Compass; label: string }[] = [
  { id: 'discover', icon: Compass, label: 'Discover' },
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'saved', icon: Bookmark, label: 'Saved' },
];

/**
 * Piko — Dayla's collaborative trails feature. Self-contained: manages its own
 * sub-tab + detail navigation, loads from a pluggable data source, and persists
 * saved/created routes. Drop in as a single component.
 */
export function Piko({ onExit, dataSource, embedded = false, onAddToPlan, onNavigate, apiBase = '', members, group }: PikoProps) {
  const source = useMemo(() => dataSource ?? createLocalDataSource(), [dataSource]);

  const [tab, setTab] = useState<PikoTab>('discover');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Add-to-plan picker
  const [planRoute, setPlanRoute] = useState<Route | null>(null);
  const [plans, setPlans] = useState<PikoPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [addingPlanId, setAddingPlanId] = useState<string | null>(null);
  const [addedPlanId, setAddedPlanId] = useState<string | null>(null);

  // Community (votes + comments) for the open route
  const [comments, setComments] = useState<RouteComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [addingComment, setAddingComment] = useState(false);

  // Group collaboration
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupSeedId, setGroupSeedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, saved] = await Promise.all([source.listRoutes(), source.getSavedIds()]);
      setRoutes(list);
      setSavedIds(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load routes');
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleSave = useCallback(
    async (id: string) => {
      const willSave = !savedIds.has(id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (willSave) next.add(id);
        else next.delete(id);
        return next;
      });
      try {
        await source.toggleSave(id);
      } catch {
        // Revert on failure.
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (willSave) next.delete(id);
          else next.add(id);
          return next;
        });
        setToast('Could not update saved routes');
      }
    },
    [savedIds, source]
  );

  const handleUploadGpx = useCallback(
    async (file: File) => {
      setCreateOpen(false);
      try {
        const text = await file.text();
        const parsed = parseGpx(text);
        const route = await source.createRoute(gpxToRouteInput(parsed));
        setRoutes((prev) => [route, ...prev]);
        setToast(`Imported “${route.title}” · ${route.distanceKm} km`);
        setSelectedRoute(route);
      } catch (e) {
        setToast(e instanceof Error ? e.message : 'Could not import that file');
      }
    },
    [source]
  );

  const handleSaveCreated = useCallback(
    async (input: NewRouteInput) => {
      const route = await source.createRoute(input);
      setRoutes((prev) => [route, ...prev]);
      setDrawOpen(false);
      setRecordOpen(false);
      setToast(`Saved “${route.title}” · ${route.distanceKm} km`);
      setSelectedRoute(route);
    },
    [source]
  );

  const fetchPlans = useCallback(async () => {
    if (!source.listPlans) {
      setPlans([]);
      return;
    }
    setPlansLoading(true);
    setPlansError(null);
    try {
      setPlans(await source.listPlans());
    } catch (e) {
      setPlansError(e instanceof Error ? e.message : 'Could not load plans');
    } finally {
      setPlansLoading(false);
    }
  }, [source]);

  const handleAddToPlan = useCallback(
    (route: Route) => {
      // Host owns it → defer. Otherwise open Piko's own picker if the source
      // supports it. Else fall back to a toast.
      if (onAddToPlan) {
        onAddToPlan(route);
        return;
      }
      if (source.addToPlan) {
        setAddedPlanId(null);
        setAddingPlanId(null);
        setPlanRoute(route);
        fetchPlans();
      } else {
        setToast(`“${route.title}” is ready to add to a group plan`);
      }
    },
    [onAddToPlan, source, fetchPlans]
  );

  const handlePickPlan = useCallback(
    async (planId: string) => {
      if (!planRoute || !source.addToPlan || addingPlanId) return;
      setAddingPlanId(planId);
      try {
        await source.addToPlan(planRoute.id, planId);
        setAddedPlanId(planId);
        const plan = plans.find((p) => p.id === planId);
        setToast(`Added to ${plan?.name ?? 'your plan'}`);
        setTimeout(() => setPlanRoute(null), 900);
      } catch (e) {
        setToast(e instanceof Error ? e.message : 'Could not add to plan');
      } finally {
        setAddingPlanId(null);
      }
    },
    [planRoute, source, addingPlanId, plans]
  );

  // ── community: votes + comments ─────────────────────────────────────────────
  const openRouteId = selectedRoute?.id ?? null;
  useEffect(() => {
    if (!openRouteId || !source.listComments) {
      setComments([]);
      return;
    }
    let active = true;
    setCommentsLoading(true);
    source
      .listComments(openRouteId)
      .then((c) => active && setComments(c))
      .catch(() => active && setComments([]))
      .finally(() => active && setCommentsLoading(false));
    return () => {
      active = false;
    };
  }, [openRouteId, source]);

  const voteOnRoute = useCallback(
    async (id: string, value: -1 | 0 | 1) => {
      if (!source.vote) return;
      const patch = (score: number, uv: -1 | 0 | 1) => {
        const apply = (r: Route): Route => (r.id === id ? { ...r, voteScore: score, userVote: uv } : r);
        setSelectedRoute((prev) => (prev && prev.id === id ? apply(prev) : prev));
        setRoutes((prev) => prev.map(apply));
      };
      patch(value, value); // optimistic
      try {
        const res = await source.vote(id, value);
        patch(res.voteScore, res.userVote);
      } catch {
        setToast('Could not save your vote');
      }
    },
    [source]
  );

  const handleVote = useCallback(
    (value: -1 | 0 | 1) => {
      if (selectedRoute) voteOnRoute(selectedRoute.id, value);
    },
    [selectedRoute, voteOnRoute]
  );

  // Candidate routes the group is deciding among: the saved shortlist (falls
  // back to a demo set), always including the route the group view was opened from.
  const groupCandidates = useMemo(() => {
    const saved = routes.filter((r) => savedIds.has(r.id));
    let base = saved.length >= 2 ? saved : routes.slice(0, 5);
    if (groupSeedId && !base.some((r) => r.id === groupSeedId)) {
      const seed = routes.find((r) => r.id === groupSeedId);
      if (seed) base = [seed, ...base];
    }
    return base;
  }, [routes, savedIds, groupSeedId]);

  const handleOpenGroup = useCallback((route: Route) => {
    setGroupSeedId(route.id);
    setGroupOpen(true);
  }, []);

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!selectedRoute || !source.addComment || addingComment) return;
      const id = selectedRoute.id;
      setAddingComment(true);
      try {
        const comment = await source.addComment(id, content);
        setComments((prev) => [...prev, comment]);
        const bump = (r: Route): Route => (r.id === id ? { ...r, commentCount: (r.commentCount ?? 0) + 1 } : r);
        setSelectedRoute((prev) => (prev && prev.id === id ? bump(prev) : prev));
        setRoutes((prev) => prev.map(bump));
      } catch {
        setToast('Could not post your comment');
      } finally {
        setAddingComment(false);
      }
    },
    [selectedRoute, source, addingComment]
  );

  const handleNavigate = useCallback(
    (route: Route) => {
      if (onNavigate) {
        onNavigate(route);
        return;
      }
      const start = route.startPoint;
      if (start) {
        // start is [lng, lat]; maps expects lat,lng.
        window.open(`https://www.openstreetmap.org/?mlat=${start[1]}&mlon=${start[0]}#map=14/${start[1]}/${start[0]}`, '_blank');
      } else {
        setToast('No trailhead location for this route yet');
      }
    },
    [onNavigate]
  );

  const handleExit = onExit ?? (() => {});
  const savedCount = savedIds.size;

  return (
    <div className="relative h-full w-full bg-gray-50 overflow-hidden">
      {/* Embedded: a top sub-tab bar replaces the internal bottom nav. */}
      {embedded && !selectedRoute && (
        <PikoHeader active={tab} onChange={setTab} onCreate={() => setCreateOpen(true)} savedCount={savedCount} />
      )}

      {/* Active tab */}
      <div className={embedded ? 'absolute inset-x-0 bottom-0 top-14' : 'absolute inset-0'}>
        {loading ? (
          <div className="h-full grid place-items-center text-emerald-500">
            <Loader2 size={30} className="animate-spin" />
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <p className="font-bold text-slate-700 mb-1">Couldn’t load trails</p>
            <p className="text-sm text-slate-500 mb-5 max-w-[16rem]">{error}</p>
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-2 bg-slate-900 text-white font-bold text-sm px-5 py-3 rounded-full active:scale-95 transition-transform"
            >
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        ) : (
          <>
            {tab === 'discover' && (
              <DiscoverPage
                routes={routes}
                embedded={embedded}
                onOpenRoute={setSelectedRoute}
                onBack={handleExit}
                savedIds={savedIds}
                onToggleSave={toggleSave}
                onOpenMap={() => setTab('map')}
              />
            )}
            {tab === 'saved' && (
              <SavedPage
                routes={routes}
                embedded={embedded}
                savedIds={savedIds}
                onOpenRoute={setSelectedRoute}
                onToggleSave={toggleSave}
                onBrowse={() => setTab('discover')}
              />
            )}
            {tab === 'map' && <MapPage routes={routes} onOpenRoute={setSelectedRoute} />}
          </>
        )}
      </div>

      {/* Standalone bottom navigation — hidden when embedded or in detail view. */}
      {!embedded && !selectedRoute && (
        <BottomNav active={tab} onChange={setTab} savedCount={savedCount} onCreate={() => setCreateOpen(true)} />
      )}

      {/* Route detail overlay */}
      <AnimatePresence>
        {selectedRoute && (
          <RouteDetailPage
            route={selectedRoute}
            onBack={() => setSelectedRoute(null)}
            isSaved={savedIds.has(selectedRoute.id)}
            onToggleSave={toggleSave}
            onAddToPlan={handleAddToPlan}
            onNavigate={handleNavigate}
            onOpenGroup={handleOpenGroup}
            voteScore={selectedRoute.voteScore ?? 0}
            userVote={selectedRoute.userVote ?? 0}
            onVote={handleVote}
            comments={comments}
            commentsLoading={commentsLoading}
            onAddComment={handleAddComment}
            addingComment={addingComment}
          />
        )}
      </AnimatePresence>

      {/* Create route bottom sheet */}
      <CreateSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onUploadGpx={handleUploadGpx}
        onDraw={() => {
          setCreateOpen(false);
          setDrawOpen(true);
        }}
        onRecord={() => {
          setCreateOpen(false);
          setRecordOpen(true);
        }}
      />

      {/* Draw-on-the-map create flow */}
      <AnimatePresence>
        {drawOpen && (
          <DrawRoutePage onClose={() => setDrawOpen(false)} onSave={handleSaveCreated} apiBase={apiBase} />
        )}
      </AnimatePresence>

      {/* Record-with-GPS create flow */}
      <AnimatePresence>
        {recordOpen && <RecordRoutePage onClose={() => setRecordOpen(false)} onSave={handleSaveCreated} />}
      </AnimatePresence>

      {/* Group collaboration */}
      <AnimatePresence>
        {groupOpen && (
          <GroupPlanPage
            onClose={() => setGroupOpen(false)}
            candidates={group?.candidates ?? groupCandidates}
            members={members ?? GROUP_MEMBERS}
            onVote={group?.onGroupVote ?? voteOnRoute}
            tasks={group?.tasks}
            onAssignTask={group?.onAssignTask}
            selectedId={group?.selectedId}
            onSelectRoute={group?.onSelectRoute}
            onOpenRoute={(r) => {
              setGroupOpen(false);
              setSelectedRoute(r);
            }}
          />
        )}
      </AnimatePresence>

      {/* Add-to-plan picker */}
      <PlanPickerSheet
        open={!!planRoute}
        route={planRoute}
        plans={plans}
        loading={plansLoading}
        error={plansError}
        addingId={addingPlanId}
        addedId={addedPlanId}
        onClose={() => setPlanRoute(null)}
        onPick={handlePickPlan}
        onRetry={fetchPlans}
      />

      {/* Transient toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none"
          >
            <div className="bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl max-w-[90%] text-center">
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Top sub-tab bar + create button, used when Piko is embedded in Dayla. */
function PikoHeader({
  active,
  onChange,
  onCreate,
  savedCount,
}: {
  active: PikoTab;
  onChange: (tab: PikoTab) => void;
  onCreate: () => void;
  savedCount: number;
}) {
  return (
    <div className="absolute top-0 inset-x-0 h-14 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-100 flex items-center gap-2 px-3">
      <div className="flex-1 flex items-center gap-1 bg-gray-100 rounded-full p-1">
        {SUB_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          const badge = t.id === 'saved' ? savedCount : 0;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-semibold transition-colors ${
                isActive ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.6 : 2} />
              {t.label}
              {badge > 0 && (
                <span className="min-w-[16px] h-4 px-1 grid place-items-center text-[10px] font-bold text-white bg-emerald-500 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onCreate}
        aria-label="Create route"
        className="shrink-0 grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/30 active:scale-90 transition-transform"
      >
        <Plus size={22} strokeWidth={2.6} />
      </button>
    </div>
  );
}
