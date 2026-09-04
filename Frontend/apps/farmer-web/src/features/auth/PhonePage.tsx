import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, FormField, Input } from '@hv/ui';
import type { Language } from '@hv/api-types';
import { useAuth } from './AuthProvider';

export function PhonePage() {
  const { t, i18n } = useTranslation();
  const { requestOtp } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError(t('auth.phoneRequired'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestOtp(phone.trim(), (i18n.language as Language) || 'en');
      navigate('/auth/otp');
    } catch {
      setError(t('auth.otpFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hv-page hv-page--auth">
      <Card className="hv-auth-card" padding="lg">
        <h1 className="hv-page__title">{t('common.appName')}</h1>
        <p className="hv-page__lead">{t('auth.subtitle')}</p>
        <form className="hv-stack" onSubmit={(e) => void onSubmit(e)}>
          <FormField htmlFor="phone" label={t('auth.phone')} error={error} required>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder={t('auth.phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FormField>
          <Button type="submit" variant="primary" loading={loading}>
            {t('auth.sendOtp')}
          </Button>
        </form>
        <p className="hv-muted hv-hint">{t('auth.demoHint')}</p>
      </Card>
    </div>
  );
}
