import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type TableProps = HTMLAttributes<HTMLTableElement> & {
  children?: ReactNode;
};

export function Table({ className, children, ...rest }: TableProps) {
  return (
    <div className="hv-table-wrap">
      <table className={cn('hv-table', className)} {...rest}>
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
    <thead className={className} {...rest}>
      {children}
    </thead>
  );
}

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement> & {
  children?: ReactNode;
};

export function TableBody({ className, children, ...rest }: TableBodyProps) {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  children?: ReactNode;
};

export function TableRow({ className, children, ...rest }: TableRowProps) {
  return (
    <tr className={className} {...rest}>
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
    <Comp className={className} {...rest}>
      {children}
    </Comp>
  );
}
