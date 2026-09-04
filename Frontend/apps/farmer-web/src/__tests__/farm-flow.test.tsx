import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider, createFarmerI18n } from '@hv/i18n';
import { AuthProvider } from '../features/auth/AuthProvider';
import { NotificationProvider } from '../shared/notifications/NotificationProvider';
import { AppRouter } from '../app/AppRouter';
import { clearAuthSession } from '../shared/api/authStorage';

function TestProviders({
  children,
  initialEntries = ['/auth/phone'],
}: {
  children: ReactNode;
  initialEntries?: string[];
}) {
  const i18n = useMemo(() => createFarmerI18n('en'), []);
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 0 } },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <NotificationProvider>
            <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
          </NotificationProvider>
        </AuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

describe('farm-flow: OTP login → farms (fixtures)', () => {
  beforeEach(() => {
    clearAuthSession();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('logs in with mock OTP and shows farm list', async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AppRouter />
      </TestProviders>,
    );

    const phone = await screen.findByLabelText(/phone number/i);
    await user.clear(phone);
    await user.type(phone, '3001234567');
    await user.click(screen.getByRole('button', { name: /send otp/i }));

    const otp = await screen.findByLabelText(/verification code/i);
    await user.type(otp, '1234');
    await user.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my farms/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/Green Valley Farm/i)).toBeInTheDocument();
    expect(screen.getByText(/Sunrise Fields/i)).toBeInTheDocument();
  });
});
