import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export type DropdownMenuItem = {
  id: string;
  label: string;
  onSelect: () => void;
  danger?: boolean;
};

export type DropdownMenuProps = {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: 'start' | 'end';
  className?: string;
};

export function DropdownMenu({ trigger, items, align = 'end', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <ul
          className={cn(
            'absolute z-30 mt-1 min-w-[10rem] rounded-lg border border-border bg-surface p-1 shadow-md',
            align === 'end' ? 'right-0 rtl:left-0 rtl:right-auto' : 'left-0 rtl:left-auto rtl:right-0',
          )}
          role="menu"
        >
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="menuitem"
                className={cn(
                  'flex w-full rounded-md px-3 py-2 text-start text-sm hover:bg-primary-50',
                  item.danger && 'text-error hover:bg-[var(--hv-color-error-bg)]',
                )}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
