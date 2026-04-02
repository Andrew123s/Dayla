import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  API_BASE_URL,
  authFetch,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '../services/api';

export type AuthUser = {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  avatar?: string | null;
  bio?: string;
  interests?: string[];
  tripCount?: number;
  postCount?: number;
  friendCount?: number;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const res = await authFetch('/api/auth/me');
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      data?: { user?: AuthUser };
      message?: string;
    };
    if (!res.ok || !json.data?.user) {
      throw new Error(json.message ?? 'Failed to load profile');
    }
    setUser(json.data.user);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getAuthToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        await clearAuthToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      data?: { user?: AuthUser; token?: string };
      message?: string;
    };
    if (!res.ok || !json.data?.token || !json.data?.user) {
      throw new Error(json.message ?? 'Login failed');
    }
    await setAuthToken(json.data.token);
    setUser(json.data.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        requiresVerification?: boolean;
        data?: { user?: AuthUser; token?: string; email?: string };
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? 'Registration failed');
      }
      if (json.requiresVerification) {
        throw new Error(
          json.message ??
            'Check your email to verify your account before logging in.'
        );
      }
      if (json.data?.token && json.data?.user) {
        await setAuthToken(json.data.token);
        setUser(json.data.user);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    await clearAuthToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, loading, login, register, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

