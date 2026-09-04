import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, EmptyState, ErrorState, LoadingState } from '@hv/ui';
import { useRefreshTwin, useTwin } from '../../shared/api/hooks';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

/** Twin weather summary + refresh CTA (GAP-065). */
export function WeatherPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifyError, notify } = useNotifications();
  const { data: twin, isLoading, error, refetch } = useTwin(farmId);
  const refreshTwin = useRefreshTwin(farmId);

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

  const weather = twin?.weather;

  const onRefresh = async () => {
    try {
      await refreshTwin.mutateAsync();
      notify('success', t('twin.refresh'));
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('weather.title')}</h1>
        <div className="hv-row">
          <Button
            size="sm"
            variant="secondary"
            loading={refreshTwin.isPending}
            onClick={() => void onRefresh()}
          >
            {t('weather.refresh')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
            {t('common.back')}
          </Button>
        </div>
      </div>

      {!weather ? (
        <EmptyState
          title={t('weather.empty')}
          description={t('weather.emptyHint')}
          action={
            <Button variant="primary" loading={refreshTwin.isPending} onClick={() => void onRefresh()}>
              {t('weather.refresh')}
            </Button>
          }
        />
      ) : (
        <Card padding="md" className="hv-stack">
          {weather.temperature && (
            <p>
              <strong>{t('weather.temperature')}:</strong>{' '}
              {weather.temperature.value}
              {weather.temperature.unit ? ` ${weather.temperature.unit}` : '°'}
            </p>
          )}
          {weather.forecastTrend && (
            <p>
              <strong>{t('weather.forecast')}:</strong> {weather.forecastTrend}
            </p>
          )}
          {weather.rainProbability != null && (
            <p>
              <strong>{t('weather.rain')}:</strong> {weather.rainProbability}%
            </p>
          )}
          {weather.humidity != null && (
            <p>
              <strong>{t('weather.humidity')}:</strong> {weather.humidity}%
            </p>
          )}
          {weather.providerStatus && (
            <p className="hv-muted hv-hint">
              {t('weather.status')}: {weather.providerStatus}
            </p>
          )}
          {weather.extremeAlerts && weather.extremeAlerts.length > 0 && (
            <ul className="hv-stack">
              {weather.extremeAlerts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
