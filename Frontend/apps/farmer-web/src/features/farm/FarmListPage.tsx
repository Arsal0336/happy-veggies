import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, Button, EmptyState, Spinner, ErrorState } from '@hv/ui';
import { useFarms } from '../../shared/api/hooks';

export function FarmListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: farms, isLoading, error } = useFarms();

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (error) return <ErrorState error={error instanceof Error ? error : String(error)} />;

  if (!farms || farms.length === 0) {
    return (
      <EmptyState
        title={t('farm.noFarms')}
        description={t('farm.createFirst')}
        action={{ label: t('farm.addFarm'), onClick: () => navigate('/farms/new') }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--hv-text-lg)] font-bold">{t('farm.myFarms')}</h1>
        <Button variant="primary" size="sm" onClick={() => navigate('/farms/new')}>
          {t('farm.addFarm')}
        </Button>
      </div>

      {farms.map((farm) => (
        <Card
          key={farm.id}
          padding="md"
          className="cursor-pointer hover:shadow-[var(--hv-shadow-md)] transition-shadow"
          onClick={() => navigate(`/farms/${farm.id}`)}
        >
          <h3 className="font-semibold text-[var(--hv-color-neutral-900)]">
            {farm.name ?? t('farm.unnamed')}
          </h3>
          <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)] mt-1">
            {farm.regionLabel} — {farm.areaInput.value} {farm.areaInput.unit}
          </p>
        </Card>
      ))}
    </div>
  );
}
