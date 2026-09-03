import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { i18n } from '@hv/i18n';
import { AuthProvider } from '../features/auth/AuthProvider';

// Set Urdu / RTL
i18n.changeLanguage('ur');

// Mock hooks
vi.mock('../shared/api/hooks', async () => {
  const { fixtureFarms, fixtureTwin, fixtureAlerts, fixtureSuggestions, fixturePlanContent, fixtureEconomics } =
    await import('@hv/api-types');
  return {
    useFarms: () => ({ data: fixtureFarms, isLoading: false, error: null }),
    useFarm: () => ({ data: fixtureFarms[0], isLoading: false, error: null }),
    useTwin: () => ({ data: fixtureTwin }),
    useAlerts: () => ({ data: fixtureAlerts }),
    useSuggestions: () => ({ data: fixtureSuggestions }),
    useAreas: () => ({ data: fixtureTwin.areas }),
    useZones: () => ({ data: fixtureTwin.zones }),
    usePlan: () => ({ data: { content: fixturePlanContent }, isLoading: false, error: null, refetch: vi.fn() }),
    useEconomics: () => ({ data: fixtureEconomics }),
  };
});

vi.mock('../shared/api/services', () => ({
  farmService: { createFarm: vi.fn() },
  planService: { generatePlan: vi.fn() },
}));

const { DashboardPage } = await import('../features/dashboard/DashboardPage');
const { PlanPage } = await import('../features/plan/PlanPage');

const qc = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const RTLWrapper = ({ children }: { children: React.ReactNode }) => (
  <div dir="rtl" lang="ur">
    <QueryClientProvider client={qc()}>
      <MemoryRouter initialEntries={['/plan/farm-001']}>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>{children}</AuthProvider>
        </I18nextProvider>
      </MemoryRouter>
    </QueryClientProvider>
  </div>
);

describe('RTL snapshot tests (Urdu)', () => {
  it('DashboardPage snapshot', () => {
    const { container } = render(<DashboardPage />, { wrapper: RTLWrapper });
    expect(container).toMatchSnapshot();
  });

  it('PlanPage snapshot', () => {
    const { container } = render(<PlanPage />, { wrapper: RTLWrapper });
    expect(container).toMatchSnapshot();
  });
});
