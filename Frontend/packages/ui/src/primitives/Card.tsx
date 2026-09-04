import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type CardPadding = 'sm' | 'md' | 'lg';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: CardPadding;
  children?: ReactNode;
};

export function Card({ padding = 'md', className, children, ...rest }: CardProps) {
  return (
    <div className={cn('hv-card', `hv-card--pad-${padding}`, className)} {...rest}>
      {children}
    </div>
  );
}
