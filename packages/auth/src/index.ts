import { TOKEN_KEY } from '@dayla/config';

export interface TokenStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

let _storage: TokenStorage | null = null;

export function initAuth(storage: TokenStorage) {
  _storage = storage;
}

export function getStorage(): TokenStorage {
  if (!_storage) {
    throw new Error('@dayla/auth: call initAuth(storage) before using auth functions');
  }
  return _storage;
}

export async function setAuthToken(token: string): Promise<void> {
  await getStorage().setItem(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await getStorage().getItem(TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await getStorage().removeItem(TOKEN_KEY);
}

export { TOKEN_KEY };
