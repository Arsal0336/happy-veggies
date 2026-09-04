import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...rest }: TextareaProps) {
  return <textarea className={cn('hv-textarea', className)} {...rest} />;
}
