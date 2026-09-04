import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type ToasterProps = {
  children: ReactNode;
  className?: string;
};

export function Toaster({ children, className }: ToasterProps) {
  return (
    <div
      className={cn(
        'fixed top-4 z-[100] flex max-w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 [inset-inline-end:1rem]',
        className,
      )}
      aria-live="polite"
    >
      {children}
    </div>
  );
}
