import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GreenScoreMeter } from '@hv/ui';
import { fixtureGreenScore } from '@hv/api-types';

describe('GreenScoreMeter', () => {
  it('renders the overall score', () => {
    render(<GreenScoreMeter score={fixtureGreenScore} />);
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('renders dimension breakdowns', () => {
    render(<GreenScoreMeter score={fixtureGreenScore} />);
    expect(screen.getByText('soil health')).toBeInTheDocument();
    expect(screen.getByText('water efficiency')).toBeInTheDocument();
    expect(screen.getByText('biodiversity')).toBeInTheDocument();
  });

  it('renders recalculate button when callback provided', () => {
    const handler = vi.fn();
    render(<GreenScoreMeter score={fixtureGreenScore} onRecalculate={handler} />);
    const btn = screen.getByText('Recalculate');
    expect(btn).toBeInTheDocument();
    btn.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('renders disclaimer', () => {
    render(<GreenScoreMeter score={fixtureGreenScore} />);
    expect(screen.getByText(/guidance only/)).toBeInTheDocument();
  });
});
