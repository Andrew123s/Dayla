// Shared helpers for the Community feed components.

/** Post/comment ids arrive as `_id` (Mongo) or `id` — normalise once. */
export function pid(entity: { _id?: string; id?: string } | null | undefined): string {
  return String((entity as any)?._id || (entity as any)?.id || '');
}

/** Compact relative timestamp: "now", "5m", "3h", "2d", "4w", then a date. */
export function timeAgo(iso?: string | Date): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return 'now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** "1,204" style counts, compacting past 10k ("12.4k"). */
export function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return n.toLocaleString();
}
