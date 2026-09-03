import { type ReactNode, useEffect, useCallback } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--hv-z-modal)] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-[var(--hv-radius-lg)] shadow-[var(--hv-shadow-lg)] flex flex-col max-h-[90vh]`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--hv-color-neutral-200)]">
            <h2 className="text-[var(--hv-text-lg)] font-semibold text-[var(--hv-color-neutral-900)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[var(--hv-color-neutral-100)] transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--hv-color-neutral-200)] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
