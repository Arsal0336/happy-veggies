import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Alert, Toaster } from '@hv/ui';

type AdminToastContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

/** Lightweight success/error banner for admin mutations (GAP-066). */
export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<'success' | 'error'>('success');

  const showSuccess = useCallback((msg: string) => {
    setVariant('success');
    setMessage(msg);
    window.setTimeout(() => setMessage(null), 3200);
  }, []);

  const showError = useCallback((msg: string) => {
    setVariant('error');
    setMessage(msg);
    window.setTimeout(() => setMessage(null), 4200);
  }, []);

  const value = useMemo(
    () => ({ showSuccess, showError }),
    [showSuccess, showError],
  );

  return (
    <AdminToastContext.Provider value={value}>
      {message && (
        <Toaster>
          <Alert variant={variant} title={message} />
        </Toaster>
      )}
      {children}
    </AdminToastContext.Provider>
  );
}

export function useAdminToast(): AdminToastContextValue {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    return {
      showSuccess: (msg) => window.alert(msg),
      showError: (msg) => window.alert(msg),
    };
  }
  return ctx;
}
