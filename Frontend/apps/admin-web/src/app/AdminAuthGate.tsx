import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '@hv/ui';
import { useAdminAuth } from '../features/auth/AdminAuthProvider';

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState label="Checking session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
