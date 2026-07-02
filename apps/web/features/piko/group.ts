import { GroupMember, GroupTask } from './types';

/**
 * Group context for the collaboration view.
 *
 * Standalone this is mocked; in Dayla it comes from the trip's collaborators and
 * the socket service (presence + live task updates). The UI reads only these
 * shapes, so swapping the source needs no component changes.
 */
export const GROUP_MEMBERS: GroupMember[] = [
  { id: 'u1', name: 'You', initials: 'YO', color: '#3a5a40', online: true, you: true },
  { id: 'u2', name: 'Kwame', initials: 'KO', color: '#c1734a', online: true },
  { id: 'u3', name: 'Lena', initials: 'LH', color: '#4f7a99', online: false },
  { id: 'u4', name: 'Marcus', initials: 'MB', color: '#9a6a9c', online: true },
];

export const DEFAULT_TASKS: GroupTask[] = [
  { id: 't-water', label: 'Bring water', assignee: null },
  { id: 't-nav', label: 'Navigate', assignee: null },
  { id: 't-firstaid', label: 'First-aid kit', assignee: null },
  { id: 't-snacks', label: 'Trail snacks', assignee: null },
  { id: 't-transport', label: 'Arrange transport', assignee: null },
];

const TASKS_KEY = 'piko_group_tasks';

/** Load saved task assignments, merged over the defaults (so new tasks appear). */
export function loadTasks(): GroupTask[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return DEFAULT_TASKS.map((t) => ({ ...t }));
    const saved = JSON.parse(raw) as GroupTask[];
    const byId = new Map(saved.map((t) => [t.id, t]));
    return DEFAULT_TASKS.map((t) => ({ ...t, assignee: byId.get(t.id)?.assignee ?? null }));
  } catch {
    return DEFAULT_TASKS.map((t) => ({ ...t }));
  }
}

export function saveTasks(tasks: GroupTask[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    /* fail soft */
  }
}
