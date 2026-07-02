import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Piko, createApiDataSource } from '../features/piko';
import type { GroupMember, GroupTask, Route } from '../features/piko';
import { DEFAULT_TASKS } from '../features/piko/group';
import { API_BASE_URL, authFetch } from '../lib/api';
import { getSocket } from '../lib/socket';

// ─────────────────────────────────────────────────────────────────────────────
// PikoPanel — the Dayla integration wrapper for the Piko trails feature.
//
// Launches from the Plan Dashboard as a full-screen overlay. Wires the feature
// to Dayla's API (createApiDataSource), real trip members (dashboard
// collaborators), and — for the group decision panel — the dashboard-backed
// group votes / selected route / role tasks (board group endpoints), live-synced
// over the dashboard socket room. "Add to plan" drops a `route` note on THIS
// dashboard. No mock group data.
// ─────────────────────────────────────────────────────────────────────────────

interface Collaborator {
  id?: string;
  _id?: string;
  name?: string;
  avatar?: string;
}

interface PikoPanelProps {
  dashboardId: string;
  user: { id: string; name: string; avatar?: string };
  collaborators?: Collaborator[];
  onClose: () => void;
}

const PALETTE = ['#3a5a40', '#c1734a', '#4f7a99', '#9a6a9c', '#7c9b86', '#d2a93f', '#c98694', '#a9a396'];
function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function initialsOf(name: string): string {
  const p = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

interface GroupSnapshot {
  candidates: Route[];
  selectedId: string | null;
  serverTasks: GroupTask[];
}

export function PikoPanel({ dashboardId, user, collaborators = [], onClose }: PikoPanelProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [snap, setSnap] = useState<GroupSnapshot>({ candidates: [], selectedId: null, serverTasks: [] });
  const source = useMemo(() => createApiDataSource(authFetch, API_BASE_URL), []);

  // Real group = current user + trip collaborators.
  const members = useMemo<GroupMember[]>(() => {
    const seen = new Set<string>();
    const out: GroupMember[] = [];
    const add = (id: string, name: string, you: boolean) => {
      if (!id || seen.has(id)) return;
      seen.add(id);
      out.push({
        id,
        name: you ? 'You' : (name || '').split(/\s+/)[0] || name || 'Member',
        initials: initialsOf(name),
        color: colorFor(id),
        online: true,
        you,
      });
    };
    add(user.id, user.name, true);
    for (const c of collaborators) add(String(c._id || c.id || ''), c.name || 'Member', false);
    return out;
  }, [user.id, user.name, collaborators]);

  // ── dashboard group state (candidates = route notes, votes, selection, tasks) ─
  const fetchGroup = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/boards/${dashboardId}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) return;
      const d = body.data?.dashboard || body.data || {};
      const notes: any[] = d.notes || [];
      const votes: Record<string, Record<string, number>> = d.routeVotes || {};
      const seen = new Set<string>();
      const candidates: Route[] = [];
      for (const n of notes) {
        if (n.type !== 'route') continue;
        const m = n.metadata || {};
        const rid = String(m.routeId || n.id);
        if (seen.has(rid)) continue;
        seen.add(rid);
        const gv = votes[rid] || {};
        const voteScore = Object.values(gv).reduce((s: number, v) => s + (v as number), 0);
        const userVote = ((gv[user.id] as number) || 0) as -1 | 0 | 1;
        candidates.push({
          id: rid,
          type: 'curated',
          title: m.title || n.content || 'Route',
          country: '',
          location: m.location || '',
          description: '',
          difficulty: m.difficulty || 'moderate',
          distanceKm: m.distanceKm || 0,
          elevationGainM: m.elevationGainM || 0,
          estimatedDurationMins: 0,
          photos: m.thumbnail ? [m.thumbnail] : [],
          tags: [],
          ecoScore: m.ecoScore ?? 75,
          weatherScore: 70,
          accessibilityScore: 50,
          ecoImpact: { transportMode: '', co2EstimateKg: 0, greenerAlternatives: [] },
          voteScore,
          userVote,
        } as Route);
      }
      setSnap({ candidates, selectedId: d.selectedRouteId || null, serverTasks: d.groupTasks || [] });
    } catch {
      /* keep current on transient failure */
    }
  }, [dashboardId, user.id]);

  useEffect(() => {
    fetchGroup();
    const socket = getSocket();
    if (!socket) return;
    const onEvt = (data: { dashboardId?: string }) => {
      if (!data || data.dashboardId === dashboardId) fetchGroup();
    };
    socket.on('route:groupVote', onEvt);
    socket.on('route:selected', onEvt);
    socket.on('task:updated', onEvt);
    socket.on('route:added', onEvt);
    return () => {
      socket.off('route:groupVote', onEvt);
      socket.off('route:selected', onEvt);
      socket.off('task:updated', onEvt);
      socket.off('route:added', onEvt);
    };
  }, [fetchGroup, dashboardId]);

  // Role tasks: defaults merged with any saved assignees (packing-type "bring X"
  // items are funnelled to Ntelipak separately in Layer 4).
  const tasks = useMemo<GroupTask[]>(() => {
    const byId = new Map(snap.serverTasks.map((t) => [t.id, t]));
    const merged: GroupTask[] = DEFAULT_TASKS.map((t) => ({ ...t, assignee: byId.get(t.id)?.assignee ?? null }));
    for (const t of snap.serverTasks) if (!DEFAULT_TASKS.some((d) => d.id === t.id)) merged.push(t);
    return merged;
  }, [snap.serverTasks]);

  const onGroupVote = useCallback(
    async (routeId: string, value: -1 | 0 | 1) => {
      setSnap((s) => ({
        ...s,
        candidates: s.candidates.map((c) =>
          c.id === routeId ? { ...c, userVote: value, voteScore: (c.voteScore ?? 0) - ((c.userVote ?? 0) as number) + value } : c
        ),
      }));
      try {
        await authFetch(`${API_BASE_URL}/api/boards/${dashboardId}/routes/${routeId}/group-vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        });
      } catch {
        /* ignore */
      }
      fetchGroup();
    },
    [dashboardId, fetchGroup]
  );

  const onSelectRoute = useCallback(
    async (routeId: string | null) => {
      setSnap((s) => ({ ...s, selectedId: routeId }));
      try {
        await authFetch(`${API_BASE_URL}/api/boards/${dashboardId}/select-route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ routeId }),
        });
      } catch {
        /* ignore */
      }
      fetchGroup();
    },
    [dashboardId, fetchGroup]
  );

  const onAssignTask = useCallback(
    async (taskId: string, assignee: string | null) => {
      const label = (DEFAULT_TASKS.find((t) => t.id === taskId) || tasks.find((t) => t.id === taskId))?.label;
      try {
        await authFetch(`${API_BASE_URL}/api/boards/${dashboardId}/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignee, label }),
        });
      } catch {
        /* ignore */
      }
      fetchGroup();
    },
    [dashboardId, fetchGroup, tasks]
  );

  const group = useMemo(
    () => ({
      candidates: snap.candidates,
      onGroupVote,
      tasks,
      onAssignTask,
      selectedId: snap.selectedId,
      onSelectRoute,
    }),
    [snap.candidates, snap.selectedId, tasks, onGroupVote, onAssignTask, onSelectRoute]
  );

  const handleAddToPlan = async (route: Route) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/piko/routes/${route.id}/add-to-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardId }),
      });
      setToast(res.ok ? `Added “${route.title}” to your plan` : 'Could not add to plan');
      if (res.ok) fetchGroup();
    } catch {
      setToast('Could not add to plan');
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="absolute inset-0 z-[60] bg-gray-50 flex flex-col">
      <div className="h-12 shrink-0 flex items-center gap-2 px-2 bg-white/90 backdrop-blur border-b border-gray-100 pt-safe-top">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to plan"
          className="grid place-items-center w-9 h-9 rounded-full text-slate-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-bold text-slate-900">Trails</span>
      </div>
      <div className="flex-1 relative">
        <Piko
          embedded
          dataSource={source}
          members={members}
          group={group}
          apiBase={API_BASE_URL}
          onAddToPlan={handleAddToPlan}
        />
      </div>
      {toast && (
        <div className="absolute bottom-6 inset-x-0 z-[70] flex justify-center px-4 pointer-events-none">
          <div className="bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl max-w-[90%] text-center">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default PikoPanel;
