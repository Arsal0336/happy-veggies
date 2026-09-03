import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Alert, Spinner, ErrorState, PlanSectionList, Card } from '@hv/ui';
import { usePlan, useEconomics } from '../../shared/api/hooks';
import { planService } from '../../shared/api/services';
import type { FarmPlan, PlanContent } from '@hv/api-types';
import { fixturePlan, fixturePlanContent } from '@hv/api-types';

export function PlanPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<PlanContent | null>(null);

  if (!farmId) return <ErrorState error="No farm selected" onRetry={() => navigate('/farms')} />;

  const { data: plan, isLoading: planLoading, error: planError, refetch } = usePlan(farmId);
  const { data: economics } = useEconomics(farmId);

  // Fixture plan history
  const planHistory: FarmPlan[] = [
    fixturePlan,
    {
      ...fixturePlan,
      id: 'plan-000',
      version: 0,
      content: { ...fixturePlanContent, planVersion: '0.9', generatedAt: '2025-03-01T08:00:00Z' },
      createdAt: '2025-03-01T08:00:00Z',
    },
  ];

  const activePlan = generatedPlan ?? plan?.content;
  const isStale = activePlan && activePlan.language !== i18n.language;

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await planService.generatePlan(farmId);
      setGeneratedPlan(response.plan);
      await refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Spinner size="lg" />
        <p className="text-[var(--hv-text-lg)] font-semibold">{t('plan.generating', 'Generating your plan…')}</p>
        <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)]">
          {t('plan.generatingHint', 'This may take a moment. We are analyzing your farm data.')}
        </p>
      </div>
    );
  }

  if (planLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (planError) return <ErrorState error={planError instanceof Error ? planError : String(planError)} />;
  if (!activePlan) return <ErrorState error="Plan not available" />;

  const riskBadgeVariant = (risk?: string): 'success' | 'warning' | 'danger' => {
    if (risk === 'low') return 'success';
    if (risk === 'medium') return 'warning';
    return 'danger';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--hv-text-lg)] font-bold">{t('plan.title')}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      {/* Regenerate banner */}
      {isStale && (
        <Alert variant="warning">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[var(--hv-text-sm)] flex-1 min-w-0">
              {t('plan.staleNotice', 'Plan language differs from your current language. Regenerate for an updated plan.')}
            </p>
            <Button variant="primary" size="sm" onClick={handleRegenerate} className="shrink-0 self-start sm:self-auto">
              {t('plan.regenerate', 'Regenerate')}
            </Button>
          </div>
        </Alert>
      )}

      {!isStale && (
        <Button variant="outline" size="sm" onClick={handleRegenerate}>
          {t('plan.regenerate', 'Regenerate Plan')}
        </Button>
      )}

      {/* Plan content via domain component */}
      <PlanSectionList plan={activePlan} />

      {/* Economics */}
      {economics && (
        <Card padding="md">
          <h2 className="font-semibold mb-2">Economics</h2>
          <div className="flex flex-col gap-2 text-[var(--hv-text-sm)]">
            <div>
              <span className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Expected yield:</span>{' '}
              {economics.expectedYield.value} {economics.expectedYield.unit}{' '}
              {economics.expectedYield.confidence ? `(${economics.expectedYield.confidence})` : null}
            </div>
            <div>
              <span className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Reference rate:</span>{' '}
              {economics.governmentReferenceRate.amount} {economics.governmentReferenceRate.currency} /{' '}
              {economics.governmentReferenceRate.unit} ({economics.governmentReferenceRate.periodLabel})
            </div>
            <div>
              <span className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Reference gross value:</span>{' '}
              {economics.referenceGrossValue.amount} {economics.referenceGrossValue.currency}
            </div>
            {economics.riskBand && (
              <Badge variant={riskBadgeVariant(economics.riskBand)}>
                Risk: {economics.riskBand}
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Plan history */}
      <Card padding="md">
        <h2 className="font-semibold mb-3">{t('plan.history', 'Plan History')}</h2>
        <div className="flex flex-col gap-2">
          {planHistory.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between border-b border-[var(--hv-color-neutral-100)] pb-2 last:border-0"
            >
              <div>
                <p className="text-[var(--hv-text-sm)] font-medium">v{p.version} — {p.content.planVersion}</p>
                <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="neutral" size="sm">{p.language}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
