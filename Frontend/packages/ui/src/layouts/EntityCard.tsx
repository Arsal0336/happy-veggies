import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
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
      className={cn(interactive && 'cursor-pointer transition-shadow hover:shadow-md', className)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-base font-semibold">{title}</h2>
          {subtitle ? <p className="m-0 mt-1 text-sm text-muted">{subtitle}</p> : null}
          {meta ? <p className="m-0 mt-1 text-xs text-muted">{meta}</p> : null}
        </div>
        {trailing}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </Card>
  );
}
