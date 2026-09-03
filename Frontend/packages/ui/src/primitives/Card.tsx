import { type ReactNode, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  padding = 'md',
  children,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-[var(--hv-radius-lg)] shadow-[var(--hv-shadow-sm)] border border-[var(--hv-color-neutral-200)] ${paddingClasses[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
