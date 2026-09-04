import { LoadingState, ErrorState, StatCard } from '@hv/ui';
import { useAdminMetrics } from '../../shared/api/useAdmin';

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminMetrics();

  if (isLoading) return <LoadingState label="Loading metrics…" />;
  if (isError || !data) {
    return <ErrorState title="Could not load metrics" onRetry={() => void refetch()} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-sm text-muted">
        Portal overview from live metrics (farmers, farms, plans, active threads).
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Farmers" value={data.farmers} />
        <StatCard label="Farms" value={data.farms} />
        <StatCard label="Plans" value={data.plans} />
        <StatCard label="Active threads" value={data.activeThreads} />
      </div>
    </div>
  );
}
