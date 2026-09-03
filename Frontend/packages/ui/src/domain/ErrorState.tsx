import { type ReactNode } from 'react';
import { Button } from '../primitives/Button';
import type { ApiError } from '@hv/api-types';

export interface ErrorStateProps {
  error: ApiError | Error | string;
  onRetry?: () => void;
  children?: ReactNode;
  className?: string;
}

export function ErrorState({
  error,
  onRetry,
  children,
  className = '',
}: ErrorStateProps) {
  const isApiError = typeof error === 'object' && error !== null && 'code' in error;
  const message =
    typeof error === 'string'
      ? error
      : isApiError
        ? (error as ApiError).message
        : (error as Error).message;
  const retryable = isApiError ? (error as ApiError).retryable : false;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4 text-[var(--hv-color-danger-500)]">
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-[var(--hv-text-lg)] font-semibold text-[var(--hv-color-neutral-700)] mb-1">
        Something went wrong
      </h3>
      <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)] max-w-sm mb-4">
        {message}
      </p>
      {isApiError && (error as ApiError).code && (
        <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-400)] mb-4">
          Error code: {(error as ApiError).code}
        </p>
      )}
      <div className="flex gap-3">
        {(retryable || onRetry) && (
          <Button variant="primary" onClick={onRetry}>
            Try again
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
