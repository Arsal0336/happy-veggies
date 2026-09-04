import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo, type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider, createFarmerI18n } from '@hv/i18n';
import { NotificationProvider } from '../shared/notifications/NotificationProvider';
import { NewFarmPage } from '../features/farms/NewFarmPage';

function Providers({ children }: { children: ReactNode }) {
  const i18n = useMemo(() => createFarmerI18n('en'), []);
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <NotificationProvider>
          <MemoryRouter initialEntries={['/farms/new']}>
            <Routes>
              <Route path="/farms/new" element={children} />
            </Routes>
          </MemoryRouter>
        </NotificationProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

describe('farm setup wizard', () => {
  it('asks questions step by step before finishing', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <NewFarmPage />
      </Providers>,
    );

    expect(await screen.findByText(/let's set up your farm/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^start$/i }));

    expect(await screen.findByText(/what is your farm called/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/farm name/i), 'Demo Farm');
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByText(/where is your farm/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByText(/which region/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByText(/how large is your farm/i)).toBeInTheDocument();
  });
});
