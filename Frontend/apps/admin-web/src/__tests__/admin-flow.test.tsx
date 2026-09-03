import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminAuthProvider } from '../features/auth/AdminAuthProvider';
import { AdminLoginPage } from '../features/auth/AdminLoginPage';
import { FarmManagePage } from '../features/farms/FarmManagePage';
import { AuditLogPage } from '../features/audit/AuditLogPage';

describe('Admin flow tests', () => {
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
