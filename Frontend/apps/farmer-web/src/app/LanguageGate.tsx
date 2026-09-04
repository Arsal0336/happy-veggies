import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredLanguage } from '../shared/api/authStorage';

export function LanguageGate({ children }: { children: ReactNode }) {
  if (!getStoredLanguage()) {
    return <Navigate to="/lang" replace />;
  }

  return <>{children}</>;
}
