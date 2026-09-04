import type { InputHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = 'text', ...rest }: InputProps) {
  return <input type={type} className={cn('hv-input', className)} {...rest} />;
}
