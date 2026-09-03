import type { PlanContent } from '@hv/api-types';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Alert } from '../primitives/Alert';

export interface PlanSectionListProps {
  plan: PlanContent;
  className?: string;
}

const suitabilityVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  high: 'success',
  medium: 'warning',
  low: 'danger',
};

export function PlanSectionList({ plan, className = '' }: PlanSectionListProps) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Recommended Crops */}
      <Card padding="md">
        <h3 className="font-semibold text-[var(--hv-text-lg)] mb-3">Recommended Crops</h3>
        <ul className="flex flex-col gap-2">
          {plan.recommendedCrops.map((crop) => (
            <li key={crop.cropId} className="flex items-center justify-between">
              <span className="text-[var(--hv-text-base)]">{crop.name}</span>
              <Badge variant={suitabilityVariant[crop.suitability] ?? 'neutral'} size="sm">
                {crop.suitability}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>

      {/* Calendar */}
      <Card padding="md">
        <h3 className="font-semibold text-[var(--hv-text-lg)] mb-3">Calendar</h3>
        <div className="flex flex-col gap-3 border-s-2 border-[var(--hv-color-primary-300)] ps-4">
          {plan.calendar.map((stage, i) => (
            <div key={i}>
              <p className="font-medium text-[var(--hv-text-base)]">{stage.stage}</p>
              <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)]">{stage.timing}</p>
              <ul className="list-disc list-inside text-[var(--hv-text-sm)] mt-1">
                {stage.actions.map((action, j) => (
                  <li key={j}>{action}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Input Guidance */}
      <Card padding="md">
        <h3 className="font-semibold text-[var(--hv-text-lg)] mb-3">Input Guidance</h3>
        <p className="text-[var(--hv-text-sm)] mb-1"><strong>Water:</strong> {plan.inputGuidance.water}</p>
        <p className="text-[var(--hv-text-sm)]"><strong>Fertilizer:</strong> {plan.inputGuidance.fertilizer}</p>
        {plan.inputGuidance.otherInputs?.map((input, i) => (
          <p key={i} className="text-[var(--hv-text-sm)] mt-1">{input}</p>
        ))}
      </Card>

      {/* Yield Prediction */}
      {plan.yieldPrediction && (
        <Card padding="md">
          <h3 className="font-semibold text-[var(--hv-text-lg)] mb-3">Yield Prediction</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--hv-text-base)]">{plan.yieldPrediction.estimate}</span>
            <Badge
              variant={plan.yieldPrediction.confidence === 'high' ? 'success' : plan.yieldPrediction.confidence === 'medium' ? 'warning' : 'danger'}
              size="sm"
            >
              {plan.yieldPrediction.confidence} confidence
            </Badge>
          </div>
          {plan.yieldPrediction.assumptions.length > 0 && (
            <ul className="list-disc list-inside text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)]">
              {plan.yieldPrediction.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Disclaimer */}
      <Alert variant="info">{plan.disclaimer}</Alert>
    </div>
  );
}
