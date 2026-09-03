import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Toast } from '@hv/ui';
import type { ApiError } from '@hv/api-types';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastEntry {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface NotificationContextValue {
  notify: (variant: ToastVariant, message: string) => void;
  notifyError: (error: ApiError) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const MAX_TOASTS = 3;

function mapApiError(error: ApiError): string {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return error.errors?.length
        ? error.errors.map((e) => `${e.field}: ${e.message}`).join('; ')
        : error.message;
    case 'RATE_LIMITED':
      return error.retryAfter
        ? `Too many requests. Try again in ${Math.ceil(error.retryAfter)} seconds.`
        : 'Too many requests. Please try again later.';
    case 'PROVIDER_UNAVAILABLE':
      return 'Service is temporarily down. Please try again shortly.';
    case 'GENERATION_FAILED':
      return 'Generation failed. Please try again.';
    default:
      return error.message;
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((variant: ToastVariant, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { id, variant, message }]);
  }, []);

  const notifyError = useCallback(
    (error: ApiError) => {
      notify('error', mapApiError(error));
    },
    [notify],
  );

  return (
    <NotificationContext.Provider value={{ notify, notifyError }}>
      {children}
      <div
        className="fixed top-4 right-4 flex flex-col gap-2"
        style={{ zIndex: 'var(--hv-z-toast, 500)' }}
      >
        {toasts.map((t) => (
          <Toast key={t.id} variant={t.variant} message={t.message} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within <NotificationProvider>');
  return ctx;
}
