import { authFetch, API_BASE_URL } from '../../lib/api';
import type { Memory } from './types';

/** GET /api/memories — the viewer's memories (owner or participant). */
export async function fetchMemories(): Promise<Memory[]> {
  const res = await authFetch(`${API_BASE_URL}/api/memories`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to load memories');
  return data.data.memories || [];
}

/** GET /api/memories/:id */
export async function fetchMemory(id: string): Promise<Memory> {
  const res = await authFetch(`${API_BASE_URL}/api/memories/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to load memory');
  return data.data.memory;
}

/** POST /api/memories/generate/:tripId — assemble/refresh (also backfill). */
export async function generateMemory(tripId: string): Promise<Memory> {
  const res = await authFetch(`${API_BASE_URL}/api/memories/generate/${tripId}`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to generate memory');
  return data.data.memory;
}

/** POST /api/memories/:id/share — post the story card to the community. */
export async function shareMemory(id: string): Promise<boolean> {
  const res = await authFetch(`${API_BASE_URL}/api/memories/${id}/share`, {
    method: 'POST',
  });
  const data = await res.json();
  return !!data.success;
}
