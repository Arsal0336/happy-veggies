import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/AuthProvider';
import { NotificationProvider } from '../shared/notifications/NotificationProvider';
import { AppRouter } from './AppRouter';
import '@hv/i18n';
import { initDirection } from '@hv/i18n';
import type { ReactNode } from 'react';

// Set document direction on startup
initDirection();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children?: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          {children ?? <AppRouter />}
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
