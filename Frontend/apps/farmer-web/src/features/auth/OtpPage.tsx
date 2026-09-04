import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout, Button, FormField, Input } from '@hv/ui';
import { useAuth } from './AuthProvider';

export function OtpPage() {
  const { t } = useTranslation();
  const { verifyOtp, pendingPhone, isAuthenticated, isNew } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!pendingPhone && !isAuthenticated) {
    return <Navigate to="/auth/phone" replace />;
  }

  if (isAuthenticated && !pendingPhone) {
    return <Navigate to={isNew ? '/auth/profile' : '/'} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError(t('auth.codeRequired'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { isNew } = await verifyOtp(code.trim());
      navigate(isNew ? '/auth/profile' : '/', { replace: true });
    } catch {
      setError(t('auth.verifyFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('common.appName')}
      lead={t('auth.otpSentTo', { phone: pendingPhone })}
      hint={t('auth.demoHint')}
    >
      <form className="hv-stack" onSubmit={(e) => void onSubmit(e)}>
        <FormField htmlFor="otp" label={t('auth.otp')} error={error} required>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </FormField>
        <Button type="submit" variant="primary" loading={loading}>
          {t('auth.verifyOtp')}
        </Button>
        <Button variant="ghost" onClick={() => navigate('/auth/phone')}>
          {t('auth.changePhone')}
        </Button>
      </form>
    </AuthLayout>
  );
}
