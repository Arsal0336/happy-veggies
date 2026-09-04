import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type ListRowProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
};

export function ListRow({ title, subtitle, trailing, className, ...rest }: ListRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3',
        className,
      )}
      {...rest}
    >
      <div className="min-w-0">
        <div className="truncate font-medium">{title}</div>
        {subtitle ? <div className="truncate text-sm text-muted">{subtitle}</div> : null}
      </div>
      {trailing}
    </div>
  );
}
