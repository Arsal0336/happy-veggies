import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

const tones: Record<BadgeTone, string> = {
  default: 'bg-neutral-100 text-neutral-700',
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-[var(--hv-color-success-bg)] text-success',
  warning: 'bg-[var(--hv-color-warning-bg)] text-warning',
  error: 'bg-[var(--hv-color-error-bg)] text-error',
  info: 'bg-[var(--hv-color-info-bg)] text-info',
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children?: ReactNode;
};

export function Badge({ tone = 'default', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
