import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '@hv/i18n';
import { NewFarmPage } from '../features/farm/NewFarmPage';

// Mock farmService to avoid actual API calls
vi.mock('../shared/api/services', () => ({
  farmService: {
    createFarm: vi.fn().mockResolvedValue({}),
  },
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <NewFarmPage />
      </I18nextProvider>
    </MemoryRouter>,
  );

describe('NewFarmPage wizard flow', () => {
  it('renders the first step (Location)', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Location' })).toBeInTheDocument();
  });

  it('navigates through steps via Next button', async () => {
    const user = userEvent.setup();
    renderPage();

    // Step 1 → 2
    await user.click(screen.getByText('Next'));
    // The heading inside the Card should say "Region"
    expect(screen.getByRole('heading', { name: 'Region' })).toBeInTheDocument();

    // Step 2 → 3
    await user.click(screen.getByText('Next'));
    expect(screen.getByRole('heading', { name: 'Area' })).toBeInTheDocument();
  });

  it('reaches the confirm step', async () => {
    const user = userEvent.setup();
    renderPage();

    // Click Next 6 times to reach Confirm (step 7)
    for (let i = 0; i < 6; i++) {
      await user.click(screen.getByText('Next'));
    }
    expect(screen.getByText(/\(unnamed\)/)).toBeInTheDocument();
  });
});
