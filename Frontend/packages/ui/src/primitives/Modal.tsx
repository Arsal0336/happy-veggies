import { useEffect, type ReactNode } from 'react';
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
      className="hv-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn('hv-modal', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hv-modal-title"
      >
        <div className="hv-modal__header">
          <h2 id="hv-modal-title" className="hv-modal__title">
            {title}
          </h2>
          <button type="button" className="hv-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
