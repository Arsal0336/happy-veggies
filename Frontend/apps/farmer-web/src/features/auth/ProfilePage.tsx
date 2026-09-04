import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, FormField, Input } from '@hv/ui';
import type { Language } from '@hv/api-types';
import { useAuth } from './AuthProvider';

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isNew, completeProfile, farmer } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(farmer?.name ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) return <Navigate to="/auth/phone" replace />;
  if (!isNew && farmer?.name) return <Navigate to="/" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('auth.nameRequired'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await completeProfile(name.trim(), (i18n.language as Language) || 'en');
      navigate('/', { replace: true });
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hv-page hv-page--auth">
      <Card className="hv-auth-card" padding="lg">
        <h1 className="hv-page__title">{t('auth.profile')}</h1>
        <form className="hv-stack" onSubmit={(e) => void onSubmit(e)}>
          <FormField htmlFor="name" label={t('auth.profileName')} error={error} required>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </FormField>
          <Button type="submit" variant="primary" loading={loading}>
            {t('common.continue')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
