import { useState } from 'react';
import {
  PlanReviewPane,
  LoadingState,
  ErrorState,
  Badge,
  Card,
  EmptyState,
  Button,
  Page,
  cn,
} from '@hv/ui';
import { useAdminPlans, useReviewAdminPlan } from '../../shared/api/useAdmin';
import type { PlanReviewAction } from '../../shared/types';
import { useAdminToast } from '../../shared/ui/AdminToast';

export function PlanReviewPage() {
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const { data, isLoading, isError, refetch } = useAdminPlans(flaggedOnly);
  const review = useReviewAdminPlan();
  const { showSuccess, showError } = useAdminToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Loading plans…" />;
  if (isError || !data) {
    return <ErrorState title="Could not load plans" onRetry={() => void refetch()} />;
  }

  const selected = data.find((p) => p.id === (selectedId ?? data[0]?.id)) ?? data[0];

  const onReview = async (action: PlanReviewAction) => {
    if (!selected) return;
    setActionError(null);
    const note = window.prompt(`Optional note for "${action}"`, '') ?? undefined;
    try {
      await review.mutateAsync({
        planId: selected.id,
        action,
        note: note?.trim() || undefined,
      });
      showSuccess(`Plan ${action} saved`);
    } catch {
      setActionError('Review action failed.');
      showError('Review action failed');
    }
  };

  return (
    <Page className="max-w-6xl gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Card padding="md" className="h-fit">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="m-0 font-display text-lg font-semibold tracking-tight">Plans</h2>
            <Button
              size="sm"
              variant={flaggedOnly ? 'primary' : 'secondary'}
              onClick={() => setFlaggedOnly((v) => !v)}
            >
              {flaggedOnly ? 'Flagged only' : 'All plans'}
            </Button>
          </div>
          {data.length === 0 ? (
            <EmptyState
              title="No plans"
              description={
                flaggedOnly
                  ? 'No flagged plans match the filter.'
                  : 'No farm plans returned by the admin API.'
              }
            />
          ) : (
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {data.map((plan) => {
                const active = selected?.id === plan.id;
                return (
                  <li key={plan.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(plan.id)}
                      className={cn(
                        'w-full rounded-xl border px-3 py-2.5 text-start transition',
                        active
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-transparent hover:border-border hover:bg-surface',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-semibold">{plan.title}</strong>
                        {plan.flagged ? <Badge tone="warning">Flagged</Badge> : null}
                      </div>
                      <span className="mt-0.5 block text-xs text-muted">
                        {plan.farmerName}
                        {plan.reviewStatus && plan.reviewStatus !== 'none'
                          ? ` · ${plan.reviewStatus}`
                          : ''}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="min-w-0">
          {actionError ? <p className="mb-3 text-sm text-error">{actionError}</p> : null}
          {selected ? (
            <PlanReviewPane
              planTitle={selected.title}
              flagged={selected.flagged}
              reviewStatus={selected.reviewStatus}
              sections={
                selected.sections.length > 0
                  ? selected.sections
                  : [
                      {
                        id: 'meta',
                        title: 'Metadata',
                        body: `Farm ${selected.farmId} · Farmer ${selected.farmerId} · v${selected.version ?? '?'}`,
                      },
                    ]
              }
              actionsDisabled={review.isPending}
              onReviewAction={(action) => void onReview(action)}
            />
          ) : (
            <Card padding="md">
              <p className="m-0 text-sm text-muted">No plans to review.</p>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}
