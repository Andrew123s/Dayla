import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Piko, createApiDataSource } from '../features/piko';
import type { GroupMember, Route } from '../features/piko';
import { API_BASE_URL, authFetch } from '../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// PikoPanel — the Dayla integration wrapper for the Piko trails feature.
//
// Launches from the Plan Dashboard as a full-screen overlay. Wires the feature
// to Dayla's API (createApiDataSource) and real trip members (dashboard
// collaborators), and routes "add to plan" straight onto THIS dashboard (drops a
// `route` sticky note). No mock group data.
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

export function PikoPanel({ dashboardId, user, collaborators = [], onClose }: PikoPanelProps) {
  const [toast, setToast] = useState<string | null>(null);
  const source = useMemo(() => createApiDataSource(authFetch, API_BASE_URL), []);

  // Real group = current user + trip collaborators. (Live presence arrives in
  // Layer 3 via the dashboard socket room; here everyone shows as available.)
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

  const handleAddToPlan = async (route: Route) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/piko/routes/${route.id}/add-to-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardId }),
      });
      setToast(res.ok ? `Added “${route.title}” to your plan` : 'Could not add to plan');
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
        <Piko embedded dataSource={source} members={members} apiBase={API_BASE_URL} onAddToPlan={handleAddToPlan} />
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
