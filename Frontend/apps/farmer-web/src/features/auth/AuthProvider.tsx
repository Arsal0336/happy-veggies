import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FarmerSummary, Language } from '@hv/api-types';
import { authService } from '../../shared/api/services';
import { useFixtures } from '../../shared/api/env';
import {
  clearAuthSession,
  clearPendingOtp,
  getFarmerProfile,
  getPendingOtp,
  getStoredLanguage,
  getToken,
  setFarmerProfile,
  setPendingOtp,
  setStoredLanguage,
  setToken,
} from '../../shared/api/authStorage';

export type AuthState = {
  farmer: FarmerSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isNew: boolean;
};

export type AuthContextValue = AuthState & {
  requestOtp: (phone: string, language?: Language) => Promise<string>;
  verifyOtp: (code: string) => Promise<{ isNew: boolean }>;
  completeProfile: (name: string, language: Language) => Promise<void>;
  logout: () => void;
  setLanguagePreference: (language: Language) => void;
  pendingPhone: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitial(): AuthState & { isNew: boolean } {
  const token = getToken();
  const farmer = getFarmerProfile();
  return {
    token,
    farmer,
    isAuthenticated: !!(token && farmer),
    isNew: false,
  };
}

/** Read JWT exp (ms) without verification — skip non-JWT fixture tokens. */
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readInitial);
  const [pendingPhone, setPendingPhone] = useState<string | null>(
    () => getPendingOtp()?.phone ?? null,
  );

  const requestOtp = useCallback(async (phone: string, language: Language = 'en') => {
    const res = await authService.requestOtp(phone, language);
    setPendingOtp(phone, res.requestId);
    setPendingPhone(phone);
    return res.requestId;
  }, []);

  const verifyOtp = useCallback(async (code: string) => {
    const pending = getPendingOtp();
    if (!pending) throw new Error('No pending OTP request');
    const res = await authService.verifyOtp(pending.phone, code, pending.requestId);
    setToken(res.sessionToken);
    setFarmerProfile(res.farmer);
    if (res.farmer.language) setStoredLanguage(res.farmer.language);
    clearPendingOtp();
    setPendingPhone(null);
    setState({
      token: res.sessionToken,
      farmer: res.farmer,
      isAuthenticated: true,
      isNew: res.isNew,
    });
    return { isNew: res.isNew };
  }, []);

  const completeProfile = useCallback(async (name: string, language: Language) => {
    const res = await authService.updateProfile({ name, language });
    setFarmerProfile(res.farmer);
    setStoredLanguage(language);
    setState((s) => ({
      ...s,
      farmer: res.farmer,
      isNew: false,
    }));
  }, []);

  const logout = useCallback(() => {
    void authService.logout();
    clearAuthSession();
    setPendingPhone(null);
    setState({
      token: null,
      farmer: null,
      isAuthenticated: false,
      isNew: false,
    });
  }, []);

  const setLanguagePreference = useCallback((language: Language) => {
    setStoredLanguage(language);
    setState((s) =>
      s.farmer
        ? { ...s, farmer: { ...s.farmer, language } }
        : s,
    );
  }, []);

  // Proactive refresh ~60s before JWT expiry (GAP-010 interim).
  useEffect(() => {
    if (!state.token || useFixtures()) return;
    const expMs = readJwtExpiryMs(state.token);
    if (!expMs) return;
    const delayMs = Math.max(expMs - Date.now() - 60_000, 5_000);
    const id = window.setTimeout(() => {
      void authService
        .refreshSession()
        .then((res) => {
          setToken(res.sessionToken);
          setState((s) => ({ ...s, token: res.sessionToken }));
        })
        .catch(() => {
          /* 401 handler clears session */
        });
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [state.token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      requestOtp,
      verifyOtp,
      completeProfile,
      logout,
      setLanguagePreference,
      pendingPhone,
    }),
    [
      state,
      requestOtp,
      verifyOtp,
      completeProfile,
      logout,
      setLanguagePreference,
      pendingPhone,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getInitialLanguage(): Language {
  return getStoredLanguage() ?? 'en';
}
