import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, EmptyState, ErrorState, LoadingState } from '@hv/ui';
import { useEconomics } from '../../shared/api/hooks';

export function EconomicsPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useEconomics(farmId);

  if (isLoading) return <LoadingState label={t('common.loading')} />;
  if (error) {
    return (
      <ErrorState
        title={t('common.error')}
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  const snapshots = data?.snapshots ?? [];

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('economics.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      <p className="hv-muted hv-hint">{data?.disclaimer ?? t('economics.disclaimer')}</p>

      {!snapshots.length ? (
        <EmptyState title={t('economics.empty')} />
      ) : (
        <ul className="hv-stack">
          {snapshots.map((s) => (
            <li key={`${s.cropId}-${s.period}`}>
              <Card padding="md">
                <strong>{s.cropId}</strong>
                <p>
                  {t('economics.yield')}: {s.expectedYield} {s.yieldUnit}
                </p>
                <p>
                  {t('economics.rate')}: {s.ratePerUnit} {s.currency}/{s.yieldUnit} (
                  {s.period})
                </p>
                <p>
                  {t('economics.gross')}: {s.referenceGrossValue} {s.currency}
                </p>
                <span className="hv-badge-inline">
                  {s.label ?? 'historical_reference'}
                </span>
                {s.sourceLabel ? (
                  <p className="hv-muted">{s.sourceLabel}</p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
