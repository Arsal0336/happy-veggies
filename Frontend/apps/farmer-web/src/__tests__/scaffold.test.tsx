import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProviders } from '../app/AppProviders';
import { AppRouter } from '../app/AppRouter';
import { clearAuthSession } from '../shared/api/authStorage';

describe('farmer-web app shell', () => {
  beforeEach(() => {
    clearAuthSession();
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/lang');
  });

  it('renders language chooser with brand', async () => {
    render(
      <AppProviders>
        <AppRouter />
      </AppProviders>,
    );

    expect(await screen.findByRole('heading', { name: /Happy Veggie|ہیپی ویجی/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /english|انگریزی/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /urdu|اردو/i })).toBeInTheDocument();
  });
});
