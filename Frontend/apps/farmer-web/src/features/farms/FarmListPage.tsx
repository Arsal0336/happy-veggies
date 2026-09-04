import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import { Button, Card, EmptyState, ErrorState, LoadingState } from '@hv/ui';
import { useFarms } from '../../shared/api/hooks';
import { alertService } from '../../shared/api/services/alertService';

export function FarmListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: farms, isLoading, error, refetch } = useFarms();

  const alertQueries = useQueries({
    queries: (farms ?? []).map((farm) => ({
      queryKey: ['alerts', farm.id] as const,
      queryFn: () => alertService.listAlerts(farm.id),
      enabled: !!farms?.length,
    })),
  });

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

  const unreadByFarm = (farms ?? []).reduce<Record<string, number>>((acc, farm, i) => {
    const alerts = alertQueries[i]?.data ?? [];
    acc[farm.id] = alerts.filter((a) => !a.read).length;
    return acc;
  }, {});

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('farms.title')}</h1>
        <Button variant="primary" size="sm" onClick={() => navigate('/farms/new')}>
          {t('farms.add')}
        </Button>
      </div>

      {!farms?.length ? (
        <EmptyState
          title={t('farms.empty')}
          description={t('farms.emptyHint')}
          action={
            <Button variant="primary" onClick={() => navigate('/farms/new')}>
              {t('farms.startSetup')}
            </Button>
          }
        />
      ) : (
        <ul className="hv-farm-list">
          {farms.map((farm) => {
            const unread = unreadByFarm[farm.id] ?? 0;
            return (
              <li key={farm.id}>
                <Card
                  className="hv-farm-card"
                  padding="md"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/farms/${farm.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/farms/${farm.id}`);
                  }}
                >
                  <div className="hv-row hv-row--between">
                    <h2 className="hv-farm-card__title">
                      {farm.name ?? t('common.unnamed')}
                    </h2>
                    {unread > 0 && (
                      <Link
                        to={`/farms/${farm.id}/alerts`}
                        className="hv-alert-badge"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={t('alerts.unreadCount', { count: unread })}
                      >
                        {unread}
                      </Link>
                    )}
                  </div>
                  <p className="hv-muted">
                    {farm.regionLabel ?? farm.regionCode}
                    {farm.area
                      ? ` — ${farm.area.value} ${farm.area.unit}`
                      : ''}
                  </p>
                  <p className="hv-muted hv-text-sm">
                    {farm.lat.toFixed(3)}, {farm.lng.toFixed(3)}
                  </p>
                  <div className="hv-row" style={{ gap: '0.75rem' }}>
                    <Link
                      to={`/farms/${farm.id}`}
                      className="hv-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('farms.open')}
                    </Link>
                    {unread > 0 && (
                      <Link
                        to={`/farms/${farm.id}/alerts`}
                        className="hv-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('alerts.title')}
                      </Link>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
