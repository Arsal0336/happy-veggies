import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children?: ReactNode;
};

export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <select className={cn('hv-select', className)} {...rest}>
      {children}
    </select>
  );
}
