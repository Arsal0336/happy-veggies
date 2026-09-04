import { useEffect, type ReactNode } from 'react';
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
      <div className="hv-drawer-overlay" role="presentation" onClick={onClose} />
      <aside
        className={cn('hv-drawer', `hv-drawer--${side}`, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hv-drawer-title"
      >
        <div className="hv-drawer__header">
          <h2 id="hv-drawer-title" className="hv-drawer__title">
            {title}
          </h2>
          <button type="button" className="hv-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="hv-drawer__body">{children}</div>
      </aside>
    </>
  );
}
