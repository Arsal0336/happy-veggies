import { ClipboardList, MessageSquare, Sprout, Users } from 'lucide-react';
import { LoadingState, ErrorState, StatCard, Page, PageHeader } from '@hv/ui';
import { useAdminMetrics } from '../../shared/api/useAdmin';

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminMetrics();

  if (isLoading) return <LoadingState label="Loading metrics…" />;
  if (isError || !data) {
    return <ErrorState title="Could not load metrics" onRetry={() => void refetch()} />;
  }

  return (
    <Page className="max-w-5xl">
      <PageHeader title="Overview">
        <p className="m-0 text-sm text-muted">
          Live portal metrics across farmers, farms, plans, and assistant threads.
        </p>
      </PageHeader>

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

      <div className="rounded-2xl border border-border bg-primary-50 p-5 shadow-sm">
        <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
          Operations
        </p>
        <p className="m-0 mt-1 font-display text-lg font-semibold tracking-tight">
          Keep rates, farmers, and AI visibility current for demos
        </p>
        <p className="m-0 mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Use the sidebar to review farmers, government rates, and assistant threads. Metrics update
          from the live API as you work.
        </p>
      </div>
    </Page>
  );
}
