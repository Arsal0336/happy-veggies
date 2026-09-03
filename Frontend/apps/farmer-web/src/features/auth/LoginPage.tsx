import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthProvider';
import { Button, Input, FormField, Card } from '@hv/ui';

export function LoginPage() {
  const { t } = useTranslation();
  const { requestOtp, login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    if (!phone.trim()) {
      setError(t('auth.phoneRequired'));
      return;
    }
    setError('');
    try {
      await requestOtp(phone);
      setStep('code');
    } catch {
      setError(t('auth.otpFailed'));
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError(t('auth.codeRequired'));
      return;
    }
    setError('');
    try {
      await login(phone, code);
      navigate('/dashboard', { replace: true });
    } catch {
      setError(t('auth.verifyFailed'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card padding="lg" className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--hv-color-primary-600)]">
            {t('common.appName')}
          </h1>
          <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)] mt-1">
            {t('auth.subtitle')}
          </p>
        </div>

        {step === 'phone' ? (
          <div className="flex flex-col gap-4">
            <FormField label={t('auth.phone')} error={error}>
              <Input
                type="tel"
                placeholder="+92-300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={error}
              />
            </FormField>
            <Button variant="primary" onClick={handleRequestOtp} loading={isLoading}>
              {t('auth.sendOtp')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-600)]">
              {t('auth.otpSentTo', { phone })}
            </p>
            <FormField label={t('auth.otpCode')} error={error}>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={error}
              />
            </FormField>
            <Button variant="primary" onClick={handleVerify} loading={isLoading}>
              {t('auth.verify')}
            </Button>
            <button
              onClick={() => setStep('phone')}
              className="text-[var(--hv-text-sm)] text-[var(--hv-color-primary-500)] hover:underline"
            >
              {t('auth.changePhone')}
            </button>
          </div>
        )}

        {/* Dev-only quick login hint */}
        <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-400)] mt-4 text-center">
          Dev mode: enter any phone + any code to login with fixtures
        </p>
      </Card>
    </div>
  );
}
