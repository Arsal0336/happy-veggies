import { MetricsCharts, LoadingState, ErrorState } from '@hv/ui';
import { useAdminAnalytics } from '../../shared/api/useAdmin';

export function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useAdminAnalytics();

  if (isLoading) return <LoadingState label="Loading analytics…" />;
  if (isError || !data) {
    return <ErrorState title="Could not load analytics" onRetry={() => void refetch()} />;
  }

  return (
    <div>
      <p style={{ color: 'var(--hv-color-text-muted)', marginTop: 0 }}>
        Live portal analytics including LLM usage and estimated cost (USD).
      </p>
      <MetricsCharts stats={data} />
    </div>
  );
}
