import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, FormField, Input } from '@hv/ui';
import { useAuth } from './AuthProvider';

export function OtpPage() {
  const { t } = useTranslation();
  const { verifyOtp, pendingPhone, isAuthenticated, isNew } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // After verify, pending OTP is cleared — don't bounce authenticated users back to phone.
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
    <div className="hv-page hv-page--auth">
      <Card className="hv-auth-card" padding="lg">
        <h1 className="hv-page__title">{t('common.appName')}</h1>
        <p className="hv-page__lead">{t('auth.otpSentTo', { phone: pendingPhone })}</p>
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
        <p className="hv-muted hv-hint">{t('auth.demoHint')}</p>
      </Card>
    </div>
  );
}
