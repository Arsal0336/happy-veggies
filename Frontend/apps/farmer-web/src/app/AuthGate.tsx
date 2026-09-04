import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import { getToken } from '../shared/api/authStorage';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  // Token is written synchronously on verify; React state may lag one frame.
  const hasSession = isAuthenticated || !!getToken();

  if (!hasSession) {
    return <Navigate to="/auth/phone" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
