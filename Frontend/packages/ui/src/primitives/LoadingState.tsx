import { cn } from '../utils/cn';
import { Skeleton } from './Skeleton';

export type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = 'Loading…', className }: LoadingStateProps) {
  return (
    <div className={cn('hv-state', className)} role="status" aria-live="polite" aria-busy="true">
      <Skeleton width="3rem" height="3rem" style={{ borderRadius: '50%' }} />
      <p className="hv-state__body">{label}</p>
    </div>
  );
}
