import { useCallback, useEffect, useState } from 'react';

import { API_BASE_URL } from '../services/api';
import { getSyncQueueLength } from '../services/offline';

const POLL_INTERVAL_MS = 30_000;
const CONNECTIVITY_TIMEOUT_MS = 8_000;

const HEALTH_PATH = '/api/climatiq/validate';

/**
 * Tracks approximate online/offline state (via API health fetch) and pending sync queue size.
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshStatus = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONNECTIVITY_TIMEOUT_MS
    );
    try {
      const res = await fetch(`${API_BASE_URL}${HEALTH_PATH}`, {
        method: 'GET',
        signal: controller.signal,
      });
      setIsOnline(res.ok);
    } catch {
      setIsOnline(false);
    } finally {
      clearTimeout(timeoutId);
    }

    try {
      const n = await getSyncQueueLength();
      setPendingCount(n);
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
    const id = setInterval(() => {
      void refreshStatus();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshStatus]);

  return {
    isOnline,
    pendingCount,
    refreshStatus,
  };
}
