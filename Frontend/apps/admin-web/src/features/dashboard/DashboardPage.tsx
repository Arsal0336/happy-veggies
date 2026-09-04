import { MetricsCharts, LoadingState, ErrorState } from '@hv/ui';
import { useAdminMetrics } from '../../shared/api/useAdmin';

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminMetrics();

  if (isLoading) return <LoadingState label="Loading metrics…" />;
  if (isError || !data) {
    return <ErrorState title="Could not load metrics" onRetry={() => void refetch()} />;
  }

  const max = Math.max(data.farmers, data.farms, data.plans, data.activeThreads, 1);
  const stats = [
    {
      id: 'farmers',
      label: 'Farmers',
      value: data.farmers,
      barPercent: Math.min(100, (data.farmers / max) * 100),
    },
    {
      id: 'farms',
      label: 'Farms',
      value: data.farms,
      barPercent: Math.min(100, (data.farms / max) * 100),
    },
    {
      id: 'plans',
      label: 'Plans',
      value: data.plans,
      barPercent: Math.min(100, (data.plans / max) * 100),
    },
    {
      id: 'threads',
      label: 'Active threads',
      value: data.activeThreads,
      barPercent: Math.min(100, (data.activeThreads / max) * 100),
    },
  ];

  return (
    <div>
      <p style={{ color: 'var(--hv-color-text-muted)', marginTop: 0 }}>
        Portal overview from live metrics (farmers, farms, plans, active threads).
      </p>
      <MetricsCharts stats={stats} />
    </div>
  );
}
