import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ErrorState,
  FarmGraphic,
  FarmGraphicLegend,
  LoadingState,
  type ProductionAreaType,
} from '@hv/ui';
import type { ProductionAreaTypeCode } from '@hv/api-types';
import { useFarm, useTwin } from '../../shared/api/hooks';
import { ZoneDrawer } from '../cropZones/ZoneDrawer';

function toGraphicType(code: ProductionAreaTypeCode | string): ProductionAreaType {
  if (code === 'tunnel_polyhouse') return 'tunnel';
  if (code === 'other_protected') return 'shed';
  return code as ProductionAreaType;
}

/** Full-screen farm graphic with zone drawer (GAP-062). */
export function FarmGraphicPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: farm, isLoading: farmLoading, error, refetch } = useFarm(farmId);
  const { data: twin, isLoading: twinLoading } = useTwin(farmId);
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
  if (error || !farm) {
    return <ErrorState title={t('farms.notFound')} onRetry={() => void refetch()} />;
  }

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('graphic.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      <p className="hv-muted hv-hint">
        {farm.lat.toFixed(4)}, {farm.lng.toFixed(4)} — {t('graphic.coordsOnly')}
      </p>

      <section className="hv-section">
        <FarmGraphic
          farmName={farm.name ?? t('common.unnamed')}
          regionLabel={farm.regionLabel ?? farm.regionCode}
          coordsLabel={`${farm.lat.toFixed(4)}, ${farm.lng.toFixed(4)}`}
          weatherLabel={
            twin?.weather?.temperature
              ? `${twin.weather.temperature.value}° ${twin.weather.forecastTrend ?? ''}`.trim()
              : twin?.weather?.providerStatus ?? undefined
          }
          waterLabel={
            twin?.water?.reliability ??
            (twin?.water?.sourceCount != null ? `${twin.water.sourceCount}` : undefined)
          }
          greenScore={twin?.greenSummary?.overallScore}
          selectedId={selectedZoneId ?? undefined}
          areas={(twin?.areas ?? []).map((a) => ({
            id: a.id,
            name: a.name ?? t('common.unnamed'),
            type: toGraphicType(a.typeCode),
            relativeSize: a.area?.value ?? a.areaInputValue ?? 1,
            unitLabel: a.area?.unit ?? a.areaInputUnit ?? undefined,
          }))}
          zones={(twin?.zones ?? []).map((z) => ({
            id: z.id,
            areaId: z.productionAreaId,
            cropName: z.cropFreetext ?? z.label ?? '',
            stage: z.growthStage ?? '',
            isExperimental: z.isExperimental,
          }))}
          neighbourEdges={(twin?.neighbourEdges ?? []).map((e) => ({
            fromZoneId: e.zoneAId,
            toZoneId: e.zoneBId,
            relation: e.relation ?? e.adjacencyType ?? 'adjacent',
          }))}
          emptyAction={
            <Button variant="primary" onClick={() => navigate(`/farms/${farmId}/areas`)}>
              {t('areas.add')}
            </Button>
          }
          onSelectZone={(zoneId) => setSelectedZoneId(zoneId)}
        />
        <FarmGraphicLegend />
      </section>

      <p>
        <Link to={`/farms/${farmId}/areas`} className="hv-link">
          {t('nav.areas')}
        </Link>
      </p>

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
