import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';
import { Badge, Button, EmptyState, EntityCard, ErrorState, LoadingState, Page, PageHeader } from '@hv/ui';
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
    <Page>
      <PageHeader
        title={t('farms.title')}
        actions={
          <Button variant="primary" size="sm" onClick={() => navigate('/farms/new')}>
            {t('farms.add')}
          </Button>
        }
      />

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
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {farms.map((farm) => {
            const unread = unreadByFarm[farm.id] ?? 0;
            return (
              <li key={farm.id}>
                <EntityCard
                  title={farm.name ?? t('common.unnamed')}
                  subtitle={
                    farm.area
                      ? `${farm.regionLabel ?? farm.regionCode} — ${farm.area.value} ${farm.area.unit}`
                      : (farm.regionLabel ?? farm.regionCode)
                  }
                  meta={`${farm.lat.toFixed(3)}, ${farm.lng.toFixed(3)}`}
                  trailing={
                    unread > 0 ? (
                      <Badge tone="error" aria-label={t('alerts.unreadCount', { count: unread })}>
                        {unread}
                      </Badge>
                    ) : null
                  }
                  onClick={() => navigate(`/farms/${farm.id}`)}
                >
                  <div className="flex gap-3">
                    <Link
                      to={`/farms/${farm.id}`}
                      className="text-sm text-primary-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('farms.open')}
                    </Link>
                    {unread > 0 && (
                      <Link
                        to={`/farms/${farm.id}/alerts`}
                        className="text-sm text-primary-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('alerts.title')}
                      </Link>
                    )}
                  </div>
                </EntityCard>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
