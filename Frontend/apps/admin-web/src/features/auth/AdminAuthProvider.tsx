import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AdminUser } from '@hv/api-types';
import {
  clearAdminToken,
  getAdminToken,
  getStoredAdminUserJson,
  setAdminToken,
  setStoredAdminUserJson,
} from '../../shared/api/authStorage';
import {
  loginAdmin,
  logoutAdmin,
  refreshAdminSession,
} from '../../shared/api/adminService';
import { useFixtures } from '../../shared/api/env';

type AdminAuthContextValue = {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function readInitialAuth(): { admin: AdminUser | null; token: string | null } {
  const token = getAdminToken();
  const raw = getStoredAdminUserJson();
  if (!token || !raw) return { admin: null, token: null };
  try {
    return { admin: JSON.parse(raw) as AdminUser, token };
  } catch {
    clearAdminToken();
    return { admin: null, token: null };
  }
}

function readJwtExpiryMs(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/')),
    ) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const initial = readInitialAuth();
  const [admin, setAdmin] = useState<AdminUser | null>(initial.admin);
  const [token, setToken] = useState<string | null>(initial.token);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginAdmin({ email, password });
      setAdminToken(res.sessionToken);
      setStoredAdminUserJson(JSON.stringify(res.admin));
      setAdmin(res.admin);
      setToken(res.sessionToken);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    void logoutAdmin();
    clearAdminToken();
    setAdmin(null);
    setToken(null);
  }, []);

  useEffect(() => {
    if (!token || useFixtures()) return;
    const expMs = readJwtExpiryMs(token);
    if (!expMs) return;
    const delayMs = Math.max(expMs - Date.now() - 60_000, 5_000);
    const id = window.setTimeout(() => {
      void refreshAdminSession()
        .then((res) => {
          setAdminToken(res.sessionToken);
          setToken(res.sessionToken);
        })
        .catch(() => {
          /* 401 handler clears session */
        });
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [token]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      token,
      isAuthenticated: !!token && !!admin,
      isLoading,
      login,
      logout,
    }),
    [admin, token, isLoading, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return ctx;
}
