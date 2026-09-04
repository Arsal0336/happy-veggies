import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={cn('hv-btn', `hv-btn--${variant}`, `hv-btn--${size}`, className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...rest}
    >
      {loading && <span className="hv-btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
