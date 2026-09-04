import { useState } from 'react';
import {
  PlanReviewPane,
  LoadingState,
  ErrorState,
  Badge,
  Card,
  EmptyState,
  Button,
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
    const note =
      window.prompt(`Optional note for "${action}"`, '') ?? undefined;
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
    <div
      style={{
        display: 'grid',
        gap: '1.25rem',
        gridTemplateColumns: 'minmax(220px, 280px) 1fr',
      }}
    >
      <Card padding="md">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 'var(--hv-text-lg)' }}>Plans</h2>
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
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {data.map((plan) => (
              <li key={plan.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(plan.id)}
                  style={{
                    width: '100%',
                    textAlign: 'start',
                    padding: '0.75rem',
                    border:
                      selected?.id === plan.id
                        ? '1px solid var(--hv-color-primary, #2d6a4f)'
                        : '1px solid transparent',
                    background:
                      selected?.id === plan.id
                        ? 'var(--hv-color-primary-soft, #d8f3dc)'
                        : 'transparent',
                    borderRadius: 'var(--hv-radius-md, 8px)',
                    cursor: 'pointer',
                    marginBottom: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <strong style={{ fontSize: 'var(--hv-text-sm)' }}>{plan.title}</strong>
                    {plan.flagged && <Badge tone="warning">Flagged</Badge>}
                  </div>
                  <span
                    style={{
                      fontSize: 'var(--hv-text-xs)',
                      color: 'var(--hv-color-text-muted)',
                    }}
                  >
                    {plan.farmerName}
                    {plan.reviewStatus && plan.reviewStatus !== 'none'
                      ? ` · ${plan.reviewStatus}`
                      : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {selected ? (
        <>
          {actionError && (
            <p style={{ color: 'var(--hv-color-error, #b00020)', gridColumn: '2' }}>
              {actionError}
            </p>
          )}
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
        </>
      ) : (
        <p>No plans to review.</p>
      )}
    </div>
  );
}
