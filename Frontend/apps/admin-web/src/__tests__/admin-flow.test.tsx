import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProviders } from '../app/AppProviders';
import { AdminApp } from '../app/AdminApp';

describe('admin-flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logs in and lands on the dashboard', async () => {
    const user = userEvent.setup();

    render(
      <AppProviders>
        <AdminApp />
      </AppProviders>,
    );

    expect(await screen.findByRole('heading', { name: /admin sign in/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email/i), 'admin@happyveggie.pk');
    await user.type(screen.getByLabelText(/password/i), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('hv_admin_token')).toBe('fixture-admin-token');
    });

    expect(await screen.findByText('1284')).toBeInTheDocument();
    expect(screen.getByText('Active threads')).toBeInTheDocument();
  });
});
