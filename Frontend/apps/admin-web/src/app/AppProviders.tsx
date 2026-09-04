import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { createAdminI18n } from '@hv/i18n';
import { AdminAuthProvider } from '../features/auth';
import { AdminToastProvider } from '../shared/ui/AdminToast';

const i18n = createAdminI18n('en');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <AdminToastProvider>{children}</AdminToastProvider>
        </AdminAuthProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
