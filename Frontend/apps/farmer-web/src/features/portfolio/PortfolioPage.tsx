import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, ErrorState, LoadingState } from '@hv/ui';
import { usePortfolio } from '../../shared/api/hooks';

/** GAP-054 — portfolio optimizer blocked until TBD-11 algorithm decision. */
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

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('portfolio.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>
      <EmptyState
        title={t('portfolio.blocked')}
        description={data?.reason ?? t('portfolio.reason')}
      />
    </div>
  );
}
