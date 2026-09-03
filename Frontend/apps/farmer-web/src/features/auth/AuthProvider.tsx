import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Farmer } from '@hv/api-types';
import { authService } from '../../shared/api/services';

export interface AuthState {
  farmer: Farmer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (phone: string, code: string) => Promise<void>;
  requestOtp: (phone: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'hv_farmer_token';
const FARMER_KEY = 'hv_farmer_data';

function getStoredAuth(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const farmerJson = localStorage.getItem(FARMER_KEY);
    if (token && farmerJson) {
      return {
        farmer: JSON.parse(farmerJson),
        token,
        isAuthenticated: true,
        isLoading: false,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { farmer: null, token: null, isAuthenticated: false, isLoading: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getStoredAuth);

  const requestOtp = useCallback(async (phone: string): Promise<string> => {
    const response = await authService.requestOtp(phone);
    return response.requestId;
  }, []);

  const login = useCallback(async (phone: string, code: string): Promise<void> => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const response = await authService.verifyOtp(phone, code);
      const farmer = { ...response.farmer, phone };
      localStorage.setItem(TOKEN_KEY, response.sessionToken);
      localStorage.setItem(FARMER_KEY, JSON.stringify(farmer));
      setState({
        farmer,
        token: response.sessionToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(FARMER_KEY);
    setState({ farmer: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, requestOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
