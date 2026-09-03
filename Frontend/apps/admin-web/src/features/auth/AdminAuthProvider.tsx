import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AdminLoginResponse } from '@hv/api-types';
import { adminApi } from '../../shared/api/adminApiInstance';

export function isAdminFixtureMode(): boolean {
  const fixturesFlag = import.meta.env.VITE_USE_FIXTURES;
  if (fixturesFlag === 'true') return true;
  if (fixturesFlag === 'false') return false;
  return !import.meta.env.VITE_API_BASE_URL;
}

interface AdminAuthState {
  admin: AdminLoginResponse['admin'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AdminAuthContextValue extends AdminAuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const TOKEN_KEY = 'hv_admin_token';
const ADMIN_KEY = 'hv_admin_data';

function getStoredAuth(): AdminAuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const adminJson = localStorage.getItem(ADMIN_KEY);
    if (token && adminJson) {
      return {
        admin: JSON.parse(adminJson),
        token,
        isAuthenticated: true,
        isLoading: false,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { admin: null, token: null, isAuthenticated: false, isLoading: false };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>(getStoredAuth);

  const login = useCallback(async (email: string, _password: string): Promise<void> => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      let admin: AdminLoginResponse['admin'];
      let token: string;

      if (isAdminFixtureMode()) {
        await delay(500);
        admin = { id: 'admin-001', email, roles: ['admin'] };
        token = 'fixture-admin-token';
      } else {
        const data = await adminApi.post<AdminLoginResponse>('/admin/auth/login', {
          email,
          password: _password,
        });
        admin = data.admin;
        token = data.sessionToken;
      }

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
      setState({ admin, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setState({ admin: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AdminAuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within <AdminAuthProvider>');
  return ctx;
}
