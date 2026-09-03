import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Spinner, ErrorState, GreenScoreMeter } from '@hv/ui';
import { useGreenScore } from '../../shared/api/hooks';

export function GreenFarmPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isRecalculating, setIsRecalculating] = useState(false);

  if (!farmId) return <ErrorState error="No farm selected" onRetry={() => navigate('/farms')} />;

  const { data: score, isLoading, error, refetch } = useGreenScore(farmId);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await new Promise((r) => setTimeout(r, 1200));
    await refetch();
    setIsRecalculating(false);
  };

  if (isLoading || isRecalculating) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        {isRecalculating && (
          <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)]">
            {t('greenFarm.recalculating', 'Recalculating your green score…')}
          </p>
        )}
      </div>
    );
  }

  if (error) return <ErrorState error={error instanceof Error ? error : String(error)} />;
  if (!score) return <ErrorState error="Green score not available" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--hv-text-lg)] font-bold">{t('greenFarm.title')}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      <GreenScoreMeter score={score} onRecalculate={handleRecalculate} />

      {/* Prominent non-certification disclaimer */}
      <div className="rounded-lg border-2 border-[var(--hv-color-warning-300)] bg-[var(--hv-color-warning-50)] p-4 text-center">
        <p className="text-[var(--hv-text-sm)] font-semibold text-[var(--hv-color-warning-700)]">
          ⚠️ {score.nonCertificationDisclaimer}
        </p>
      </div>
    </div>
  );
}
