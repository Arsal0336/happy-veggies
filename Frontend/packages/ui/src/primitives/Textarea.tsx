import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-[5.5rem] w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  );
}
