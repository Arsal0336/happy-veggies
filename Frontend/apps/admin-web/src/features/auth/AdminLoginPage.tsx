import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Card, FormField, Input } from '@hv/ui';
import { useFixtures } from '../../shared/api/env';
import { useAdminAuth } from './AdminAuthProvider';

export function AdminLoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch {
      setError('Login failed. Check your credentials.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--hv-space-4, 1rem)',
        background: 'var(--hv-color-bg-muted, #f4f6f8)',
      }}
    >
      <Card padding="lg" style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ marginTop: 0, fontSize: 'var(--hv-text-2xl, 1.5rem)' }}>
          {t('auth.adminLogin', 'Admin sign in')}
        </h1>
        <p style={{ color: 'var(--hv-color-text-muted)', marginTop: 0 }}>
          Happy Veggie admin portal
        </p>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormField label={t('auth.adminEmail', 'Email')} htmlFor="admin-email" required>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="admin@happyveggie.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField label={t('auth.adminPassword', 'Password')} htmlFor="admin-password" required>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
          {error && <Alert variant="error">{error}</Alert>}
          <Button type="submit" variant="primary" loading={isLoading}>
            {t('auth.adminSubmit', 'Sign in')}
          </Button>
        </form>
        <p
          style={{
            marginTop: '1rem',
            fontSize: 'var(--hv-text-xs)',
            color: 'var(--hv-color-text-muted)',
          }}
        >
          MFA / SSO is TBD (GAP-044 / TBD-01) — password login only for now.
        </p>
        {useFixtures() && (
          <p
            style={{
              marginTop: '0.5rem',
              fontSize: 'var(--hv-text-xs)',
              color: 'var(--hv-color-text-muted)',
            }}
          >
            Fixtures: any email + password (≥6 chars), or admin@happyveggie.pk / admin123
          </p>
        )}
      </Card>
    </div>
  );
}
