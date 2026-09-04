import { useMemo, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider, createFarmerI18n } from '@hv/i18n';
import { AuthProvider, getInitialLanguage } from '../features/auth/AuthProvider';
import { NotificationProvider } from '../shared/notifications/NotificationProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const i18n = useMemo(() => createFarmerI18n(getInitialLanguage()), []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
