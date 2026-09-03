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
    <div className="flex items-center justify-center min-h-screen px-6 py-10 sm:px-8">
      <Card padding="none" className="w-full max-w-md shadow-[var(--hv-shadow-md)]">
        <div className="px-8 py-10 sm:px-10 sm:py-12">
        <div className="text-center mb-10">
          <h1 className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-primary-600)]">
            {t('common.appName')}
          </h1>
          <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)] mt-3 leading-relaxed">
            {t('auth.subtitle')}
          </p>
        </div>

        {step === 'phone' ? (
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleRequestOtp();
            }}
          >
            <FormField htmlFor="farmer-phone" label={t('auth.phone')} error={error}>
              <Input
                id="farmer-phone"
                type="tel"
                autoComplete="tel"
                placeholder={t('auth.phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={error}
              />
            </FormField>
            <Button variant="primary" type="submit" className="w-full" loading={isLoading}>
              {t('auth.sendOtp')}
            </Button>
          </form>
        ) : (
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-600)]">
              {t('auth.otpSentTo', { phone })}
            </p>
            <FormField htmlFor="farmer-otp" label={t('auth.otpCode')} error={error}>
              <Input
                id="farmer-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={error}
              />
            </FormField>
            <Button variant="primary" type="submit" className="w-full" loading={isLoading}>
              {t('auth.verify')}
            </Button>
            <button
              type="button"
              onClick={() => {
                setError('');
                setStep('phone');
              }}
              className="min-h-11 inline-flex items-center justify-center text-[var(--hv-text-sm)] text-[var(--hv-color-primary-600)] hover:underline"
            >
              {t('auth.changePhone')}
            </button>
          </form>
        )}

        <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-400)] mt-8 pt-5 border-t border-[var(--hv-color-neutral-100)] text-center leading-relaxed">
          {t('auth.demoHint')}
        </p>
        </div>
      </Card>
    </div>
  );
}
