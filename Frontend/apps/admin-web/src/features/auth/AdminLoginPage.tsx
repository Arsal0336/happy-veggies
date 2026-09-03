import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { Button, Input, FormField, Card } from '@hv/ui';

export function AdminLoginPage() {
  const { login, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card padding="lg" className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--hv-color-primary-600)]">
            HV Admin
          </h1>
          <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)] mt-1">
            Sign in to admin portal
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <FormField label="Email" error={error && email.trim() === '' ? 'Email is required' : undefined}>
            <Input
              type="email"
              placeholder="admin@happyveggie.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>

          <FormField label="Password" error={error && password.trim() === '' ? 'Password is required' : undefined}>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>

          {error && (
            <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-error-600)]">
              {error}
            </p>
          )}

          <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
            Sign In
          </Button>
        </div>

        <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-400)] mt-4 text-center">
          Dev mode: enter any email + password
        </p>
      </Card>
    </div>
  );
}
