import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminAuthProvider } from '../features/auth/AdminAuthProvider';
import { AdminLoginPage } from '../features/auth/AdminLoginPage';
import { FarmManagePage } from '../features/farms/FarmManagePage';
import { AuditLogPage } from '../features/audit/AuditLogPage';

describe('Admin flow tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('AdminLoginPage accepts any credentials in fixture mode', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText('admin@happyveggie.pk'), 'dev@happyveggie.pk');
    await user.type(screen.getByPlaceholderText('••••••••'), 'any-password');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(localStorage.getItem('hv_admin_token')).toBe('fixture-admin-token');
    });
    expect(screen.queryByText('Login failed. Please check your credentials.')).not.toBeInTheDocument();
  });

  it('AdminLoginPage renders email and password fields', () => {
    render(
      <MemoryRouter>
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByPlaceholderText('admin@happyveggie.pk')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('AdminLoginPage renders HV Admin title', () => {
    render(
      <MemoryRouter>
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('HV Admin')).toBeInTheDocument();
  });

  it('FarmManagePage renders table with farm data', () => {
    render(
      <MemoryRouter>
        <FarmManagePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Farm Management')).toBeInTheDocument();
    expect(screen.getByText('Green Valley Farm')).toBeInTheDocument();
    expect(screen.getByText('Sunrise Fields')).toBeInTheDocument();
  });

  it('FarmManagePage renders table headers', () => {
    render(
      <MemoryRouter>
        <FarmManagePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Farm')).toBeInTheDocument();
    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.getByText('Area')).toBeInTheDocument();
  });

  it('AuditLogPage renders audit entries', () => {
    render(
      <MemoryRouter>
        <AuditLogPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Audit Log')).toBeInTheDocument();
    expect(screen.getByText('farmer.verified')).toBeInTheDocument();
    expect(screen.getByText('seed_data.updated')).toBeInTheDocument();
  });

  it('AuditLogPage renders search input', () => {
    render(
      <MemoryRouter>
        <AuditLogPage />
      </MemoryRouter>,
    );
    expect(screen.getByPlaceholderText('Search actions, actors…')).toBeInTheDocument();
  });
});
