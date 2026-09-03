import { useEffect, useRef } from 'react';

export interface ToastProps {
  variant: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
  autoClose?: number;
}

const variantStyles: Record<ToastProps['variant'], { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-[var(--hv-color-success-50,#f0fdf4)]',
    border: 'border-[var(--hv-color-success-500)]',
    icon: 'text-[var(--hv-color-success-500)]',
  },
  error: {
    bg: 'bg-[var(--hv-color-danger-50,#fef2f2)]',
    border: 'border-[var(--hv-color-danger-500)]',
    icon: 'text-[var(--hv-color-danger-500)]',
  },
  info: {
    bg: 'bg-[var(--hv-color-info-50,#eff6ff)]',
    border: 'border-[var(--hv-color-info-500)]',
    icon: 'text-[var(--hv-color-info-500)]',
  },
  warning: {
    bg: 'bg-[var(--hv-color-warning-50,#fffbeb)]',
    border: 'border-[var(--hv-color-warning-500)]',
    icon: 'text-[var(--hv-color-warning-500)]',
  },
};

const icons: Record<ToastProps['variant'], string> = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

export function Toast({ variant, message, onClose, autoClose = 5000 }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (autoClose <= 0) return;
    timerRef.current = setTimeout(onClose, autoClose);
    return () => clearTimeout(timerRef.current);
  }, [autoClose, onClose]);

  const style = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3 rounded-[var(--hv-radius-md)] border ${style.bg} ${style.border} shadow-[var(--hv-shadow-md)] min-w-[280px] max-w-[400px] animate-[slideIn_0.2s_ease-out]`}
    >
      <svg className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icons[variant]} />
      </svg>
      <p className="flex-1 text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-800)]">{message}</p>
      <button
        onClick={onClose}
        className="shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4 text-[var(--hv-color-neutral-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
