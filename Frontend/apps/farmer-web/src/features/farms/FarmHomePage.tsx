import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  CloudSun,
  Droplets,
  Leaf,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
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
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              {t('twin.refresh')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}/edit`)}>
              {t('common.edit')}
            </Button>
          </>
        }
      >
        <p className="m-0 text-sm text-muted">
          {farm.regionLabel ?? farm.regionCode} · {farm.lat.toFixed(3)}, {farm.lng.toFixed(3)}
        </p>
      </PageHeader>

      <Card
        padding="md"
        className="border-primary-700 bg-gradient-to-br from-primary-600 to-primary-800 text-primary-foreground shadow-md"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-100">
              Next action
            </p>
            <p className="m-0 mt-1 font-display text-lg font-bold tracking-tight">
              {t('plan.generate')}
            </p>
            <p className="m-0 mt-1 text-sm text-primary-100">
              AI plan grounded in your twin, weather, and water.
            </p>
          </div>
          <Button
            variant="secondary"
            className="shrink-0 border-0 bg-white text-primary-800 hover:bg-primary-50"
            onClick={() => navigate(`/farms/${farmId}/plan`)}
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {t('plan.generate')}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={t('twin.weather')}
          value={weather ?? '—'}
          hint={weatherStatus}
          icon={<CloudSun className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label={t('twin.water')}
          value={water ?? '—'}
          icon={<Droplets className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label={t('green.title')}
          value={twin?.greenSummary?.overallScore ?? '—'}
          hint={soilStatus ? `${t('twin.soil')}: ${soilStatus}` : undefined}
          icon={<Leaf className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label={t('alerts.title')}
          value={unread}
          hint={t('alerts.unreadCount', { count: unread })}
          icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
        />
      </div>

      <TwinSummaryPanel
        weather={weather}
        water={water}
        greenScore={twin?.greenSummary?.overallScore}
      />

      {alerts && alerts.length > 0 && (
        <Section title={t('alerts.title')}>
          <div className="flex items-center justify-between">
            {unread > 0 ? <Badge tone="error">{unread} unread</Badge> : <span />}
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

      <Section title={t('nav.graphic')}>
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
                <Card padding="sm" className="transition hover:border-primary-200 hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="font-display text-base">{s.cropName ?? s.cropId}</strong>
                    <Badge tone="primary">{s.source}</Badge>
                  </div>
                  <p className="m-0 mt-1 text-sm leading-relaxed text-muted">{s.reason}</p>
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
