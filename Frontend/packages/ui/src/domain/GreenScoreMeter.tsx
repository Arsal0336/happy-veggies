import type { GreenFarmScore } from '@hv/api-types';
import { Alert } from '../primitives/Alert';
import { Button } from '../primitives/Button';

export interface GreenScoreMeterProps {
  score: GreenFarmScore;
  onRecalculate?: () => void;
  className?: string;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreColor(value: number): string {
  if (value >= 70) return 'var(--hv-color-success-500)';
  if (value >= 40) return 'var(--hv-color-warning-500)';
  return 'var(--hv-color-danger-500)';
}

export function GreenScoreMeter({ score, onRecalculate, className = '' }: GreenScoreMeterProps) {
  const offset = CIRCUMFERENCE - (score.overallScore / 100) * CIRCUMFERENCE;

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* Circular score */}
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--hv-color-neutral-200)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={scoreColor(score.overallScore)}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[var(--hv-text-2xl)] font-bold">{score.overallScore}</span>
          <span className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">/100</span>
        </div>
      </div>

      {/* Dimension breakdown */}
      <div className="w-full flex flex-col gap-4">
        {Object.entries(score.dimensions).map(([key, dim]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[var(--hv-text-sm)] font-medium capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="flex items-center gap-1 text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
                {score.measuredVsEstimated[key] === 'measured' ? '📏 Measured' : '📐 Estimated'}
                <span className="font-medium">{dim.score}/100</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--hv-color-neutral-200)]">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${dim.score}%`, backgroundColor: scoreColor(dim.score) }}
              />
            </div>
            {dim.explanation && (
              <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)] mt-1">{dim.explanation}</p>
            )}
          </div>
        ))}
      </div>

      {onRecalculate && (
        <Button variant="outline" size="sm" onClick={onRecalculate}>
          Recalculate
        </Button>
      )}

      <Alert variant="info">{score.nonCertificationDisclaimer}</Alert>
    </div>
  );
}
