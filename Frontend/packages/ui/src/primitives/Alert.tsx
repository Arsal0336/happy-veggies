import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

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
    <div className={cn('hv-alert', `hv-alert--${variant}`, className)} role={role} {...rest}>
      <div>
        {title && <p className="hv-alert__title">{title}</p>}
        {children}
      </div>
    </div>
  );
}
