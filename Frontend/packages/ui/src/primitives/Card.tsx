import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type CardPadding = 'sm' | 'md' | 'lg';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: CardPadding;
  children?: ReactNode;
};

const pad: Record<CardPadding, string> = {
  sm: 'p-3.5',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ padding = 'md', className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface text-foreground shadow-sm',
        pad[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
