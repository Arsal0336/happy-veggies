import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertList, Button, EmptyState, ErrorState, LoadingState } from '@hv/ui';
import { useAlerts, useMarkAlertRead } from '../../shared/api/hooks';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

/** Farm-scoped alerts list (GAP-064). */
export function AlertsPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifyError } = useNotifications();
  const { data: alerts, isLoading, error, refetch } = useAlerts(farmId);
  const markRead = useMarkAlertRead(farmId);

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
        <h1 className="hv-page__title">{t('alerts.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      {!alerts?.length ? (
        <EmptyState title={t('alerts.empty')} />
      ) : (
        <AlertList
          markReadLabel={t('alerts.markRead')}
          onMarkRead={(id) => {
            markRead.mutate(id, { onError: (err) => notifyError(err) });
          }}
          alerts={alerts.map((a) => ({
            id: a.id,
            read: a.read,
            severity:
              a.severity === 'critical' || a.severity === 'error'
                ? ('error' as const)
                : a.severity === 'warning'
                  ? ('warning' as const)
                  : ('info' as const),
            title: a.title ?? a.type,
            message: a.message,
          }))}
        />
      )}

      <p>
        <Link to={`/farms/${farmId}`} className="hv-link">
          {t('nav.home')}
        </Link>
      </p>
    </div>
  );
}
