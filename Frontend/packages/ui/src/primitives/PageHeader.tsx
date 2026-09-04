import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type PageHeaderProps = {
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PageHeader({ title, actions, children, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="m-0 font-display text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}
