import type { ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-error bg-[var(--hv-color-error-bg)] px-6 py-8 text-center',
        className,
      )}
      role="alert"
    >
      <h3 className="text-lg font-semibold text-error">{title}</h3>
      {message && <p className="max-w-sm text-sm text-muted">{message}</p>}
      <div className="mt-2 flex gap-2">
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}
