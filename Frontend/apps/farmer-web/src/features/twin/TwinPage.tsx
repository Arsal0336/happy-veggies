import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button, FarmGraphic, FarmGraphicLegend, Spinner, ErrorState } from '@hv/ui';
import { useTwin } from '../../shared/api/hooks';

export function TwinPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!farmId) return <ErrorState error="No farm selected" onRetry={() => navigate('/farms')} />;

  const { data: twin, isLoading, error } = useTwin(farmId);

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (error) return <ErrorState error={error instanceof Error ? error : String(error)} />;
  if (!twin) return <ErrorState error="Twin data not available" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--hv-text-lg)] font-bold">{t('twin.title')}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      {/* Weather */}
      {twin.weather && (
        <Card padding="md">
          <h2 className="font-semibold mb-2">{t('twin.weather')}</h2>
          <div className="flex gap-4 text-[var(--hv-text-sm)]">
            {twin.weather.temperature && (
              <span>{twin.weather.temperature.value}{twin.weather.temperature.unit}</span>
            )}
            {twin.weather.humidity != null && (
              <span>{twin.weather.humidity}% humidity</span>
            )}
            {twin.weather.rainProbability != null && (
              <span>{twin.weather.rainProbability}% rain</span>
            )}
          </div>
        </Card>
      )}

      {/* Production Areas */}
      <div>
        <h2 className="font-semibold mb-2">{t('twin.productionAreas')}</h2>

        <Card padding="md">
          <FarmGraphic
            areas={twin.areas}
            zones={twin.zones}
            neighbourEdges={twin.neighbourEdges}
          />
        </Card>

        <div className="mt-3">
          <FarmGraphicLegend areas={twin.areas} />
        </div>
      </div>

      {/* Soil */}
      {twin.soil && (
        <Card padding="md">
          <h2 className="font-semibold mb-2">{t('twin.soil')}</h2>
          <div className="text-[var(--hv-text-sm)] flex flex-col gap-1">
            {twin.soil.type && <p>Type: {twin.soil.type}</p>}
            {twin.soil.ph && <p>pH: {twin.soil.ph.value}</p>}
            {twin.soil.organicMatter && <p>Organic matter: {twin.soil.organicMatter.value}{twin.soil.organicMatter.unit}</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
