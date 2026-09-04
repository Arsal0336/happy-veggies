import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
