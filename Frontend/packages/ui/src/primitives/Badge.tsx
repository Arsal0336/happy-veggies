import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children?: ReactNode;
};

export function Badge({ tone = 'default', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn('hv-badge', tone !== 'default' && `hv-badge--${tone}`, className)}
      {...rest}
    >
      {children}
    </span>
  );
}
