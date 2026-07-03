/**
 * Piko feature — public entry point.
 *
 * Import the whole feature from a single place:
 *   import { Piko, createApiDataSource } from '@/src/features/piko';
 *
 * Everything Piko needs (UI, pages, data, types, data sources) lives inside this
 * folder, so it can be dropped into the host app as one self-contained module.
 */
export { Piko } from './Piko';
export type { PikoProps } from './Piko';
export { createLocalDataSource, createApiDataSource } from './dataSource';
export type { PikoDataSource, Fetcher } from './dataSource';
export { pikoRoutes } from './data';
// Reusable route preview for embedding outside the Piko page (e.g. chat cards).
export { RouteShareCard } from './components/RouteShareCard';
// Admin moderation queue (Phase 4) — the host decides who can open it.
export { ModerationPage } from './pages/ModerationPage';
export type { ModerationItem } from './pages/ModerationPage';
export type { Route, PikoTab, RouteFilter, NewRouteInput, PikoPlan, RouteComment, GroupMember, GroupTask } from './types';
