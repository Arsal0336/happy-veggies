import { type ReactNode } from 'react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const variantClasses: Record<string, string> = {
  info: 'bg-[var(--hv-color-info-50)] border-[var(--hv-color-info-500)] text-[var(--hv-color-info-700)]',
  success: 'bg-[var(--hv-color-success-50)] border-[var(--hv-color-success-500)] text-[var(--hv-color-success-700)]',
  warning: 'bg-[var(--hv-color-warning-50)] border-[var(--hv-color-warning-500)] text-[var(--hv-color-warning-700)]',
  danger: 'bg-[var(--hv-color-danger-50)] border-[var(--hv-color-danger-500)] text-[var(--hv-color-danger-700)]',
};

export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-[var(--hv-radius-md)] border-s-4 ${variantClasses[variant]} ${className}`}
    >
      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="text-[var(--hv-text-sm)]">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
