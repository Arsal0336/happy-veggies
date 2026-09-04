import { cn } from '../utils/cn';

export type StepperProps = {
  current: number;
  total: number;
  className?: string;
};

export function Stepper({ current, total, className }: StepperProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);
  const pct = (safeCurrent / safeTotal) * 100;

  return (
    <div
      className={cn('h-1.5 overflow-hidden rounded-full bg-neutral-200', className)}
      role="progressbar"
      aria-valuenow={safeCurrent}
      aria-valuemin={1}
      aria-valuemax={safeTotal}
    >
      <div
        className="h-full rounded-full bg-primary-600 transition-[width] duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
