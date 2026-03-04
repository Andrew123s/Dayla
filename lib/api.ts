export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'dayla_auth_token';

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Authenticated fetch wrapper.
 * Adds Authorization header from stored token and sets credentials: 'include'.
 */
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
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
