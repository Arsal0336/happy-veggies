import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

export type DrawerSide = 'start' | 'end';

export type DrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  side?: DrawerSide;
  children?: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  title,
  onClose,
  side = 'end',
  children,
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-neutral-900/40" role="presentation" onClick={onClose} />
      <aside
        className={cn(
          'fixed inset-y-0 z-50 flex w-[min(22rem,92vw)] flex-col bg-surface shadow-lg',
          side === 'start'
            ? 'left-0 rtl:left-auto rtl:right-0'
            : 'right-0 rtl:right-auto rtl:left-0',
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hv-drawer-title"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="hv-drawer-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-lg p-2 text-muted hover:bg-primary-50"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </>
  );
}
