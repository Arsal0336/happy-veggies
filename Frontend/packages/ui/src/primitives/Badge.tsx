import { type ReactNode, type HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  default: 'bg-[var(--hv-color-primary-100)] text-[var(--hv-color-primary-800)]',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-[var(--hv-color-neutral-100)] text-[var(--hv-color-neutral-600)]',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-1.5 py-0.5 text-[var(--hv-text-xs)]',
  md: 'px-2.5 py-1 text-[var(--hv-text-sm)]',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-[var(--hv-radius-full)] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
