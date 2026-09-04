import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, ErrorState, LoadingState } from '@hv/ui';
import { usePortfolio } from '../../shared/api/hooks';

export function PortfolioPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = usePortfolio(farmId);

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

  const allocations = data?.allocations ?? [];
  const isOk = data?.status === 'ok' && allocations.length > 0;

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('portfolio.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      {!isOk && (
        <EmptyState
          title={t('portfolio.blocked')}
          description={data?.reason ?? t('portfolio.reason')}
        />
      )}

      {isOk && (
        <>
          <p className="hv-muted">
            {t('portfolio.method')}: {data.method} · {data.engine} · {data.totalAreaAcres} acres
          </p>
          <ul className="hv-list">
            {allocations.map((row) => (
              <li key={row.cropId} className="hv-list__item">
                <strong>{row.cropName}</strong>
                <span>
                  {(row.weight * 100).toFixed(1)}% · {row.allocatedAcres} acres
                </span>
                {row.areaType ? <span className="hv-muted">{row.areaType}</span> : null}
              </li>
            ))}
          </ul>
          <p className="hv-disclaimer">{data.disclaimer}</p>
        </>
      )}
    </div>
  );
}
