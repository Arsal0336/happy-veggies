import type { ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children?: ReactNode;
};

export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}
