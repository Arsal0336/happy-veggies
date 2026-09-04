import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type TableProps = HTMLAttributes<HTMLTableElement> & {
  children?: ReactNode;
};

export function Table({ className, children, ...rest }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border">
      <table className={cn('w-full caption-bottom text-sm', className)} {...rest}>
        {children}
      </table>
    </div>
  );
}

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement> & {
  children?: ReactNode;
};

export function TableHead({ className, children, ...rest }: TableHeadProps) {
  return (
    <thead className={cn('bg-primary-50 text-start text-xs uppercase tracking-wide text-muted', className)} {...rest}>
      {children}
    </thead>
  );
}

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement> & {
  children?: ReactNode;
};

export function TableBody({ className, children, ...rest }: TableBodyProps) {
  return (
    <tbody className={cn('divide-y divide-border bg-surface', className)} {...rest}>
      {children}
    </tbody>
  );
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  children?: ReactNode;
};

export function TableRow({ className, children, ...rest }: TableRowProps) {
  return (
    <tr className={cn('transition-colors hover:bg-primary-50/60', className)} {...rest}>
      {children}
    </tr>
  );
}

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> &
  ThHTMLAttributes<HTMLTableCellElement> & {
    as?: 'td' | 'th';
    children?: ReactNode;
  };

export function TableCell({ as = 'td', className, children, ...rest }: TableCellProps) {
  const Comp = as;
  return (
    <Comp className={cn('px-3 py-2.5 text-start', as === 'th' && 'font-semibold', className)} {...rest}>
      {children}
    </Comp>
  );
}
