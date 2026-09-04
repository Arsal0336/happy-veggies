import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '../primitives/Table';
import { EmptyState } from '../primitives/EmptyState';
import { cn } from '../utils/cn';

export type AuditLogRow = {
  id: string;
  who: string;
  what: string;
  when: string;
};

export type AuditLogTableProps = {
  rows: AuditLogRow[];
  className?: string;
};

export function AuditLogTable({ rows, className }: AuditLogTableProps) {
  if (rows.length === 0) {
    return <EmptyState title="No audit entries" className={className} />;
  }

  return (
    <div className={cn(className)}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell as="th">Who</TableCell>
            <TableCell as="th">What</TableCell>
            <TableCell as="th">When</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.who}</TableCell>
              <TableCell>{row.what}</TableCell>
              <TableCell>{row.when}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
