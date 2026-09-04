import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createFarmerI18n } from '@hv/i18n';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthProvider';
import { NotificationProvider } from '../shared/notifications/NotificationProvider';
import { FarmListPage } from '../features/farms/FarmListPage';
import { setFarmerProfile, setToken, clearAuthSession } from '../shared/api/authStorage';
import { fixtureFarmer } from '../shared/api/fixtures';

describe('RTL / Urdu layout', () => {
  beforeEach(() => {
    clearAuthSession();
    setToken('fixture-token');
    setFarmerProfile(fixtureFarmer);
  });

  it('sets document dir=rtl when language is ur', async () => {
    const i18n = createFarmerI18n('ur');
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={qc}>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <NotificationProvider>
              <MemoryRouter initialEntries={['/']}>
                <Routes>
                  <Route path="/" element={<FarmListPage />} />
                </Routes>
              </MemoryRouter>
            </NotificationProvider>
          </AuthProvider>
        </I18nextProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ur');
    });

    expect(await screen.findByText(/میرے فارم/i)).toBeInTheDocument();
  });
});
