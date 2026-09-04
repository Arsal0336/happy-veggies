import { Button } from './Button';
import { cn } from '../utils/cn';

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, pageSize, total, onChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <nav className={cn('hv-pagination', className)} aria-label="Pagination">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="hv-pagination__controls">
        <Button
          variant="secondary"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onChange(safePage - 1)}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <span>
          Page {safePage} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={safePage >= totalPages}
          onClick={() => onChange(safePage + 1)}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
