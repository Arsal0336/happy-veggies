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
    <div className={cn('hv-state', className)} role="alert">
      <h3 className="hv-state__title">{title}</h3>
      {message && <p className="hv-state__body">{message}</p>}
      <div className="hv-state__actions">
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
