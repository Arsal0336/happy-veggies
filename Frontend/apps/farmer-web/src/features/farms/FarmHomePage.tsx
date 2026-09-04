import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertList,
  Badge,
  Button,
  Card,
  ErrorState,
  FarmGraphic,
  FarmGraphicLegend,
  LoadingState,
  Page,
  PageHeader,
  Section,
  StatCard,
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
    return <ErrorState title={t('farms.notFound')} onRetry={() => void refetch()} />;
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
    <Page>
      <PageHeader
        title={farm.name ?? t('common.unnamed')}
        actions={
          <>
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
          </>
        }
      >
        <p className="m-0 text-sm text-muted">
          {farm.regionLabel ?? farm.regionCode} · {farm.lat.toFixed(3)}, {farm.lng.toFixed(3)}
        </p>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t('twin.weather')} value={weather ?? '—'} hint={weatherStatus} />
        <StatCard label={t('twin.water')} value={water ?? '—'} />
        <StatCard
          label={t('green.title')}
          value={twin?.greenSummary?.overallScore ?? '—'}
          hint={soilStatus ? `${t('twin.soil')}: ${soilStatus}` : undefined}
        />
        <StatCard
          label={t('alerts.title')}
          value={unread}
          hint={t('alerts.unreadCount', { count: unread })}
        />
      </div>

      <Button variant="primary" onClick={() => navigate(`/farms/${farmId}/plan`)}>
        {t('plan.generate')}
      </Button>

      <TwinSummaryPanel
        weather={weather}
        water={water}
        greenScore={twin?.greenSummary?.overallScore}
      />

      {alerts && alerts.length > 0 && (
        <Section title={t('alerts.title')}>
          <div className="flex items-center justify-between">
            {unread > 0 && <Badge tone="error">{unread}</Badge>}
            <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}/alerts`)}>
              {t('alerts.viewAll')}
            </Button>
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
        </Section>
      )}

      <Section>
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
      </Section>

      {suggestions?.suggestions?.length ? (
        <Section title={t('suggestions.title')}>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {suggestions.suggestions.map((s) => (
              <li key={s.cropId}>
                <Card padding="sm">
                  <strong>{s.cropName ?? s.cropId}</strong>
                  <p className="m-0 text-sm text-muted">{s.reason}</p>
                  <Badge tone="default">{s.source}</Badge>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <ZoneDrawer
        open={!!selectedZone}
        zone={selectedZone}
        neighbours={neighbours}
        neighbourLabels={neighbourLabels}
        onClose={() => setSelectedZoneId(null)}
      />
    </Page>
  );
}
