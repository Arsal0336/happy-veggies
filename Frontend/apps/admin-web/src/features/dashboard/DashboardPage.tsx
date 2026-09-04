import { ClipboardList, MessageSquare, Sprout, Users } from 'lucide-react';
import { LoadingState, ErrorState, StatCard, Page } from '@hv/ui';
import { useAdminMetrics } from '../../shared/api/useAdmin';

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminMetrics();

  if (isLoading) return <LoadingState label="Loading metrics…" />;
  if (isError || !data) {
    return <ErrorState title="Could not load metrics" onRetry={() => void refetch()} />;
  }

  return (
    <Page className="max-w-5xl gap-6">
      <p className="m-0 max-w-2xl text-sm leading-relaxed text-muted">
        Live portal metrics across farmers, farms, plans, and assistant threads.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Farmers"
          value={data.farmers}
          icon={<Users className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Farms"
          value={data.farms}
          icon={<Sprout className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Plans"
          value={data.plans}
          icon={<ClipboardList className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Active threads"
          value={data.activeThreads}
          icon={<MessageSquare className="h-4 w-4" aria-hidden />}
        />
      </div>

      <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
        <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
          Operations
        </p>
        <p className="m-0 mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
          Keep rates, farmers, and AI visibility current
        </p>
        <p className="m-0 mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Review farmers, government rates, and assistant quality from the sidebar. Metrics refresh
          from the live API as you work.
        </p>
      </div>
    </Page>
  );
}
