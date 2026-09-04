import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const variants: Record<AlertVariant, string> = {
  info: 'border-info bg-[var(--hv-color-info-bg)] text-info',
  success: 'border-success bg-[var(--hv-color-success-bg)] text-success',
  warning: 'border-warning bg-[var(--hv-color-warning-bg)] text-warning',
  error: 'border-error bg-[var(--hv-color-error-bg)] text-error',
};

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
};

export function Alert({
  variant = 'info',
  title,
  className,
  children,
  role = 'alert',
  ...rest
}: AlertProps) {
  return (
    <div
      className={cn('rounded-xl border p-3 text-sm', variants[variant], className)}
      role={role}
      {...rest}
    >
      {title && <p className="font-semibold">{title}</p>}
      {children}
    </div>
  );
}
