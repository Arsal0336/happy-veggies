import {
  Card,
  LoadingState,
  ErrorState,
  Badge,
  Button,
  EmptyState,
} from '@hv/ui';
import { useAdminFlags, useToggleAdminFlag } from '../../shared/api/useAdmin';
import { isUnavailable } from '../../shared/types';
import { useAdminToast } from '../../shared/ui/AdminToast';

export function FeatureFlagsPage() {
  const { data, isLoading, isError, refetch } = useAdminFlags();
  const toggle = useToggleAdminFlag();
  const { showSuccess, showError } = useAdminToast();

  if (isLoading) return <LoadingState label="Loading flags…" />;
  if (isError) {
    return <ErrorState title="Could not load flags" onRetry={() => void refetch()} />;
  }
  if (!data || isUnavailable(data)) {
    return (
      <EmptyState
        title="Not available on this backend"
        description="Feature flags are not exposed by the current admin API."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ marginTop: 0, color: 'var(--hv-color-text-muted)' }}>
        Toggle platform flags (OTP mock, weather/soil enrichment, LLM live).
      </p>
      {data.map((flag) => (
        <Card key={flag.key} padding="md">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <strong>{flag.key}</strong>
                <Badge tone={flag.enabled ? 'success' : 'default'}>
                  {flag.enabled ? 'On' : 'Off'}
                </Badge>
              </div>
              {flag.description && (
                <p
                  style={{
                    margin: '0.35rem 0 0',
                    fontSize: 'var(--hv-text-sm)',
                    color: 'var(--hv-color-text-muted)',
                  }}
                >
                  {flag.description}
                </p>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              loading={toggle.isPending && toggle.variables?.key === flag.key}
              onClick={() =>
                toggle.mutate(
                  { key: flag.key, enabled: !flag.enabled },
                  {
                    onSuccess: () =>
                      showSuccess(
                        `${flag.key} ${flag.enabled ? 'disabled' : 'enabled'}`,
                      ),
                    onError: () => showError('Could not toggle flag'),
                  },
                )
              }
            >
              {flag.enabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
