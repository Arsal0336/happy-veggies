import { LoaderCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = 'Loading…', className }: LoadingStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center gap-3 py-14 text-sm text-muted', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
      </span>
      <p className="m-0 font-medium">{label}</p>
    </div>
  );
}
