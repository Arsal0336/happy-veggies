import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from '../primitives/Card';
import { cn } from '../utils/cn';

export type EntityCardProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
};

export function EntityCard({
  title,
  subtitle,
  meta,
  trailing,
  children,
  className,
  onClick,
  onKeyDown,
  ...rest
}: EntityCardProps) {
  const interactive = !!onClick;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (interactive && e.key === 'Enter') onClick?.(e as never);
  };

  return (
    <Card
      padding="md"
      role={interactive ? 'link' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        interactive &&
          'cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        className,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 font-display text-lg font-semibold tracking-tight">{title}</h2>
          {subtitle ? <p className="m-0 mt-1 text-sm text-muted">{subtitle}</p> : null}
          {meta ? <p className="m-0 mt-1 text-xs text-muted">{meta}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {trailing}
          {interactive ? (
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </Card>
  );
}
