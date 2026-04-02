import { getApiBaseUrl } from '@dayla/config';
import { getAuthToken } from '@dayla/auth';

export function apiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export { getApiBaseUrl } from '@dayla/config';
export { getAuthToken, setAuthToken, clearAuthToken } from '@dayla/auth';
