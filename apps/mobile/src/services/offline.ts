import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_QUEUE_KEY = 'sync_queue';
const CACHE_PREFIX = 'cache_';

const DEFAULT_MAX_AGE_MS = 5 * 60 * 1000;

type CachedEnvelope = {
  timestamp: number;
  data: unknown;
};

export type SyncQueueAction = {
  method: string;
  path: string;
  body?: unknown;
};

function cacheStorageKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * Stores JSON-serializable data with a server-style cache key and timestamp.
 */
export async function cacheApiResponse(
  key: string,
  data: unknown
): Promise<void> {
  const envelope: CachedEnvelope = {
    timestamp: Date.now(),
    data,
  };
  await AsyncStorage.setItem(
    cacheStorageKey(key),
    JSON.stringify(envelope)
  );
}

/**
 * Returns cached payload if present and fresher than `maxAgeMs` (default 5 minutes).
 */
export async function getCachedResponse<T>(
  key: string,
  maxAgeMs: number = DEFAULT_MAX_AGE_MS
): Promise<T | null> {
  const raw = await AsyncStorage.getItem(cacheStorageKey(key));
  if (!raw) return null;

  let envelope: CachedEnvelope;
  try {
    envelope = JSON.parse(raw) as CachedEnvelope;
  } catch {
    return null;
  }

  if (
    typeof envelope.timestamp !== 'number' ||
    Date.now() - envelope.timestamp > maxAgeMs
  ) {
    return null;
  }

  return envelope.data as T;
}

async function readSyncQueue(): Promise<SyncQueueAction[]> {
  const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SyncQueueAction[]) : [];
  } catch {
    return [];
  }
}

async function writeSyncQueue(queue: SyncQueueAction[]): Promise<void> {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Appends a pending API call to the offline sync queue.
 */
export async function addToSyncQueue(
  action: SyncQueueAction
): Promise<void> {
  const queue = await readSyncQueue();
  queue.push(action);
  await writeSyncQueue(queue);
}

/**
 * Replays queued requests via `authFetchFn`. Successful items are removed; failures remain.
 */
export async function processSyncQueue(
  authFetchFn: (path: string, opts: RequestInit) => Promise<Response>
): Promise<void> {
  let queue = await readSyncQueue();
  if (queue.length === 0) return;

  const remaining: SyncQueueAction[] = [];

  for (const action of queue) {
    try {
      const init: RequestInit = {
        method: action.method,
      };
      if (action.body !== undefined) {
        init.body = JSON.stringify(action.body);
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        init.headers = headers;
      }

      const res = await authFetchFn(action.path, init);
      if (!res.ok) {
        remaining.push(action);
      }
    } catch {
      remaining.push(action);
    }
  }

  await writeSyncQueue(remaining);
}

export async function getSyncQueueLength(): Promise<number> {
  const queue = await readSyncQueue();
  return queue.length;
}

/**
 * Removes every AsyncStorage key prefixed with `cache_`.
 */
export async function clearCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
  if (cacheKeys.length > 0) {
    await AsyncStorage.multiRemove(cacheKeys);
  }
}
