import { cn } from '../utils/cn';
import { Skeleton } from './Skeleton';

export type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = 'Loading…', className }: LoadingStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center gap-3 py-10 text-sm text-muted', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Skeleton width="3rem" height="3rem" className="rounded-full" />
      <p>{label}</p>
    </div>
  );
}
