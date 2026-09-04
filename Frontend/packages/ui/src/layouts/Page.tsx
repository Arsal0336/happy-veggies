import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type PageProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function Page({ className, children, ...rest }: PageProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)} {...rest}>
      {children}
    </div>
  );
}

export type SectionProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  children?: ReactNode;
};

export function Section({ title, className, children, ...rest }: SectionProps) {
  return (
    <section className={cn('flex flex-col gap-3', className)} {...rest}>
      {title ? <h2 className="m-0 text-base font-semibold">{title}</h2> : null}
      {children}
    </section>
  );
}
