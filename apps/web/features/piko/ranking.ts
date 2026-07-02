import { Route } from './types';

export interface GroupFit {
  route: Route;
  /** 0–100 group-fit score; higher = better group pick. */
  score: number;
}

/**
 * Group-aware ranking. Blends the factors a group actually weighs when choosing
 * a shared route:
 *   • community support  — the collaborative vote score (normalised)
 *   • eco friendliness   — Piko's eco-aware boost (low-impact / transit-friendly)
 *   • weather suitability — proxy for the group's trip-date conditions
 *   • accessibility      — a stand-in for group fitness / transport reach
 *
 * The top result is the collaborative "Selected Route". As votes change the
 * ranking (and the selection) updates live. In Dayla this is where real
 * group-date weather, average fitness and transport availability slot in.
 */
export function rankForGroup(routes: Route[]): GroupFit[] {
  const maxVotes = Math.max(1, ...routes.map((r) => Math.abs(r.voteScore ?? 0)));
  return routes
    .map((r) => {
      const vote = ((r.voteScore ?? 0) / maxVotes) * 40; // up to ±40 from the group
      const eco = (r.ecoScore / 100) * 25;
      const weather = ((r.weatherScore ?? 70) / 100) * 20;
      const access = (r.accessibilityScore / 100) * 15;
      return { route: r, score: Math.max(0, Math.round(vote + eco + weather + access)) };
    })
    .sort((a, b) => b.score - a.score || (b.route.voteScore ?? 0) - (a.route.voteScore ?? 0));
}
