import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { Spinner } from '@hv/ui';
import type { ReactNode } from 'react';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
