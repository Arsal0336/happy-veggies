import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { LoadingState } from '@hv/ui';
import { useAuth } from '../features/auth/AuthProvider';
import { getFarmerProfile, getStoredLanguage, getToken } from '../shared/api/authStorage';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const token = getToken();
  const farmer = getFarmerProfile();
  const hasSession = isAuthenticated || !!(token && farmer);

  if (token && !farmer) {
    return <LoadingState />;
  }

  if (!hasSession) {
    const to = getStoredLanguage() ? '/auth/phone' : '/lang';
    return <Navigate to={to} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
