import { cn } from '../utils/cn';

export type GreenScoreMeterProps = {
  score: number;
  disclaimer?: string;
  className?: string;
};

const DEFAULT_DISCLAIMER =
  'This green score is a guidance indicator only and is not a certification.';

export function GreenScoreMeter({
  score,
  disclaimer = DEFAULT_DISCLAIMER,
  className,
}: GreenScoreMeterProps) {
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div className={cn('hv-green-meter', className)} role="group" aria-label="Green score">
      <div className="hv-green-meter__score" aria-live="polite">
        {Math.round(clamped)}
      </div>
      <div
        className="hv-green-meter__track"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label="Green score meter"
      >
        <div className="hv-green-meter__fill" style={{ width: `${clamped}%` }} />
      </div>
      <p className="hv-green-meter__disclaimer">{disclaimer}</p>
    </div>
  );
}
