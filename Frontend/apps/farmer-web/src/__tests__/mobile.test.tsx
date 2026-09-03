import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { i18n } from '@hv/i18n';
import { AuthProvider } from '../features/auth/AuthProvider';

// Mock hooks to return fixture data
vi.mock('../shared/api/hooks', () => ({
  useFarms: () => ({ data: [], isLoading: false, error: null }),
  useTwin: () => ({ data: null }),
  useAlerts: () => ({ data: [] }),
  useSuggestions: () => ({ data: [] }),
}));

// Lazy import so mocks are active
const { DashboardPage } = await import('../features/dashboard/DashboardPage');

describe('Mobile viewport — DashboardPage', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth });
  });

  it('renders DashboardPage at 375px without errors', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <I18nextProvider i18n={i18n}>
            <AuthProvider>
              <DashboardPage />
            </AuthProvider>
          </I18nextProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('No alerts')).toBeInTheDocument();
  });
});
