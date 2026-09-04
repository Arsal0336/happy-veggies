import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertList,
  Button,
  Card,
  ErrorState,
  FarmGraphic,
  FarmGraphicLegend,
  LoadingState,
  TwinSummaryPanel,
  type ProductionAreaType,
} from '@hv/ui';
import type { ProductionAreaTypeCode } from '@hv/api-types';
import {
  useAlerts,
  useFarm,
  useMarkAlertRead,
  useRefreshTwin,
  useSuggestions,
  useTwin,
} from '../../shared/api/hooks';
import { useNotifications } from '../../shared/notifications/NotificationProvider';
import { ZoneDrawer } from '../cropZones/ZoneDrawer';

function toGraphicType(code: ProductionAreaTypeCode | string): ProductionAreaType {
  if (code === 'tunnel_polyhouse') return 'tunnel';
  if (code === 'other_protected') return 'shed';
  return code as ProductionAreaType;
}

export function FarmHomePage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifyError, notify } = useNotifications();
  const { data: farm, isLoading: farmLoading, error: farmError, refetch } = useFarm(farmId);
  const { data: twin, isLoading: twinLoading } = useTwin(farmId);
  const refreshTwin = useRefreshTwin(farmId);
  const { data: suggestions } = useSuggestions(farmId);
  const { data: alerts } = useAlerts(farmId);
  const markRead = useMarkAlertRead(farmId);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const selectedZone = useMemo(
    () => (twin?.zones ?? []).find((z) => z.id === selectedZoneId) ?? null,
    [twin?.zones, selectedZoneId],
  );

  const neighbourLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const z of twin?.zones ?? []) {
      map[z.id] = z.cropFreetext ?? z.label ?? z.id;
    }
    return map;
  }, [twin?.zones]);

  const neighbours = useMemo(() => {
    if (!selectedZoneId) return [];
    return (twin?.neighbourEdges ?? []).filter(
      (e) => e.zoneAId === selectedZoneId || e.zoneBId === selectedZoneId,
    );
  }, [twin?.neighbourEdges, selectedZoneId]);

  if (farmLoading || twinLoading) return <LoadingState label={t('common.loading')} />;
  if (farmError || !farm) {
    return (
      <ErrorState title={t('farms.notFound')} onRetry={() => void refetch()} />
    );
  }

  const weatherStatus = twin?.weather?.providerStatus;
  const soilStatus = twin?.soil?.providerStatus;
  const weather = twin?.weather?.temperature
    ? `${twin.weather.temperature.value}° ${twin.weather.forecastTrend ?? ''}`
    : weatherStatus
      ? `${t('twin.weather')}: ${weatherStatus}`
      : undefined;
  const water = twin?.water?.reliability
    ? `${twin.water.reliability}${twin.water.irrigationMethod ? ` · ${twin.water.irrigationMethod}` : ''}`
    : twin?.water?.sourceCount != null
      ? `${twin.water.sourceCount} ${t('twin.water').toLowerCase()}`
      : undefined;

  const unread = (alerts ?? []).filter((a) => !a.read).length;

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
        <h1 className="hv-page__title">{farm.name ?? t('common.unnamed')}</h1>
        <div className="hv-row">
          <Button
            size="sm"
            variant="secondary"
            loading={refreshTwin.isPending}
            onClick={() => void onRefresh()}
          >
            {t('twin.refresh')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/farms/${farmId}/edit`)}>
            {t('common.edit')}
          </Button>
        </div>
      </div>

      <p className="hv-muted">
        {farm.regionLabel ?? farm.regionCode} · {farm.lat.toFixed(3)}, {farm.lng.toFixed(3)}
      </p>

      {(weatherStatus || soilStatus) && (
        <p className="hv-muted hv-hint">
          {weatherStatus ? `${t('twin.weather')}: ${weatherStatus}` : null}
          {weatherStatus && soilStatus ? ' · ' : null}
          {soilStatus
            ? `${t('twin.soil')}: ${soilStatus}`
            : twin?.soil?.profileCount != null
              ? `${t('twin.soil')}: ${twin.soil.profileCount} profiles`
              : null}
        </p>
      )}

      {alerts && alerts.length > 0 && (
        <section className="hv-section">
          <div className="hv-row hv-row--between">
            <h2 className="hv-section-title">
              {t('alerts.title')}
              {unread > 0 && (
                <span
                  className="hv-alert-badge"
                  aria-label={t('alerts.unreadCount', { count: unread })}
                >
                  {unread}
                </span>
              )}
            </h2>
            <Link to={`/farms/${farmId}/alerts`} className="hv-link">
              {t('alerts.viewAll')}
            </Link>
          </div>
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
        </section>
      )}

      <TwinSummaryPanel
        weather={weather}
        water={water}
        greenScore={twin?.greenSummary?.overallScore}
      />

      <section className="hv-section">
        <FarmGraphic
          farmName={farm.name ?? t('common.unnamed')}
          selectedId={selectedZoneId ?? undefined}
          areas={(twin?.areas ?? []).map((a) => ({
            id: a.id,
            name: a.name,
            type: toGraphicType(a.typeCode),
            relativeSize: a.area.value,
          }))}
          zones={(twin?.zones ?? []).map((z) => ({
            id: z.id,
            areaId: z.productionAreaId,
            cropName: z.cropFreetext ?? z.label ?? '',
            stage: z.growthStage ?? '',
          }))}
          neighbourEdges={(twin?.neighbourEdges ?? []).map((e) => ({
            fromZoneId: e.zoneAId,
            toZoneId: e.zoneBId,
            relation: e.relation,
          }))}
          emptyAction={
            <Button variant="primary" onClick={() => navigate(`/farms/${farmId}/areas`)}>
              {t('areas.add')}
            </Button>
          }
          onSelectArea={() => navigate(`/farms/${farmId}/areas`)}
          onSelectZone={(zoneId) => setSelectedZoneId(zoneId)}
        />
        <FarmGraphicLegend />
      </section>

      <nav className="hv-quick-links">
        <Link to={`/farms/${farmId}/graphic`}>{t('nav.graphic')}</Link>
        <Link to={`/farms/${farmId}/areas`}>{t('nav.areas')}</Link>
        <Link to={`/farms/${farmId}/water`}>{t('nav.water')}</Link>
        <Link to={`/farms/${farmId}/soil`}>{t('nav.soil')}</Link>
        <Link to={`/farms/${farmId}/weather`}>{t('nav.weather')}</Link>
        <Link to={`/farms/${farmId}/economics`}>{t('nav.economics')}</Link>
        <Link to={`/farms/${farmId}/plan`}>{t('nav.plan')}</Link>
        <Link to={`/farms/${farmId}/alerts`}>{t('nav.alerts')}</Link>
        <Link to={`/farms/${farmId}/assistant`}>{t('nav.assistant')}</Link>
        <Link to={`/farms/${farmId}/green`}>{t('nav.green')}</Link>
        <Link to={`/farms/${farmId}/experimental`}>{t('nav.experimental')}</Link>
        <Link to={`/farms/${farmId}/history`}>{t('nav.history')}</Link>
        <Link to={`/farms/${farmId}/portfolio`}>{t('nav.portfolio')}</Link>
      </nav>

      {suggestions?.suggestions?.length ? (
        <section className="hv-section">
          <h2 className="hv-section-title">{t('suggestions.title')}</h2>
          <ul className="hv-stack">
            {suggestions.suggestions.map((s) => (
              <li key={s.cropId}>
                <Card padding="sm">
                  <strong>{s.cropName ?? s.cropId}</strong>
                  <p className="hv-muted">{s.reason}</p>
                  <span className="hv-badge-inline">{s.source}</span>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ZoneDrawer
        open={!!selectedZone}
        zone={selectedZone}
        neighbours={neighbours}
        neighbourLabels={neighbourLabels}
        onClose={() => setSelectedZoneId(null)}
      />
    </div>
  );
}
