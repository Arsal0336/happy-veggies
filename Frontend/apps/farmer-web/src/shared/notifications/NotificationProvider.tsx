import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { ApiError } from '@hv/api-types';
import { Alert, Button, Toaster } from '@hv/ui';
import { useTranslation } from 'react-i18next';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type ToastEntry = {
  id: string;
  variant: ToastVariant;
  message: string;
  retryable?: boolean;
  onRetry?: () => void;
};

type NotificationContextValue = {
  notify: (variant: ToastVariant, message: string) => void;
  notifyError: (error: unknown, onRetry?: () => void) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const MAX_TOASTS = 3;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback((variant: ToastVariant, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { id, variant, message }]);
  }, []);

  const notifyError = useCallback(
    (error: unknown, onRetry?: () => void) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      if (error instanceof ApiError) {
        setToasts((prev) => [
          ...prev.slice(-(MAX_TOASTS - 1)),
          {
            id,
            variant: 'error',
            message: error.message,
            retryable: error.retryable,
            onRetry,
          },
        ]);
        return;
      }
      const message = error instanceof Error ? error.message : t('common.error');
      setToasts((prev) => [
        ...prev.slice(-(MAX_TOASTS - 1)),
        { id, variant: 'error', message, onRetry },
      ]);
    },
    [t],
  );

  return (
    <NotificationContext.Provider value={{ notify, notifyError }}>
      {children}
      <Toaster>
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            variant={toast.variant === 'info' ? 'info' : toast.variant}
            title={toast.message}
            className="hv-toast"
          >
            <div className="hv-toast__actions">
              {toast.retryable && toast.onRetry && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    toast.onRetry?.();
                    removeToast(toast.id);
                  }}
                >
                  {t('common.retry')}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => removeToast(toast.id)}>
                {t('common.close')}
              </Button>
            </div>
          </Alert>
        ))}
      </Toaster>
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
