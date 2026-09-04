import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

export type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
};

export function Modal({ open, title, onClose, children, className }: ModalProps) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'w-full max-w-lg rounded-xl border border-border bg-surface p-4 shadow-lg',
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hv-modal-title"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="hv-modal-title" className="text-lg font-semibold">
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
        <div>{children}</div>
      </div>
    </div>
  );
}
