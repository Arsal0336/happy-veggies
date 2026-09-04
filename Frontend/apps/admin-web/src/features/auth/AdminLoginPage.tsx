import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, AuthLayout, Button, FormField, Input } from '@hv/ui';
import { useAdminAuth } from './AdminAuthProvider';

const DEMO_EMAIL = 'admin@happyveggie.pk';
const DEMO_PASSWORD = 'HappyVeggie!2026';

export function AdminLoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError(t('auth.adminRequired', 'Email and password are required'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.adminPasswordShort', 'Password must be at least 6 characters'));
      return;
    }
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch {
      setError(t('auth.adminFailed', 'Login failed. Check your credentials.'));
    }
  };

  return (
    <AuthLayout
      title={t('auth.adminLogin', 'Admin sign in')}
      lead="Happy Veggie admin portal"
      hint={t('auth.adminDemoHint', `Demo: ${DEMO_EMAIL} / ${DEMO_PASSWORD}. MFA / SSO is TBD (GAP-044).`)}
    >
      <form className="hv-stack" onSubmit={onSubmit}>
        <FormField label={t('auth.adminEmail', 'Email')} htmlFor="admin-email" required>
          <Input
            id="admin-email"
            type="email"
            autoComplete="username"
            placeholder={DEMO_EMAIL}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label={t('auth.adminPassword', 'Password')} htmlFor="admin-password" required>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="submit" variant="primary" loading={isLoading}>
          {t('auth.adminSubmit', 'Sign in')}
        </Button>
      </form>
    </AuthLayout>
  );
}
