import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '../primitives/Table';
import { EmptyState } from '../primitives/EmptyState';
import { cn } from '../utils/cn';

export type FarmerRow = {
  id: string;
  phone: string;
  name: string;
};

export type FarmersTableProps = {
  rows: FarmerRow[];
  onRowClick?: (id: string) => void;
  className?: string;
};

export function FarmersTable({ rows, onRowClick, className }: FarmersTableProps) {
  if (rows.length === 0) {
    return <EmptyState title="No farmers" description="No farmer records match." className={className} />;
  }

  return (
    <div className={cn(className)}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell as="th">Name</TableCell>
            <TableCell as="th">Phone</TableCell>
            <TableCell as="th">ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={onRowClick ? 'hv-clickable-row' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={() => onRowClick?.(row.id)}
              onKeyDown={(e) => {
                if (!onRowClick) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRowClick(row.id);
                }
              }}
            >
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>{row.id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
