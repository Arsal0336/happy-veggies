import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlertList } from '@hv/ui';
import { fixtureAlerts } from '@hv/api-types';

describe('AlertList', () => {
  it('renders empty state', () => {
    render(<AlertList alerts={[]} />);
    expect(screen.getByText('No alerts')).toBeInTheDocument();
  });

  it('renders alert messages', () => {
    render(<AlertList alerts={fixtureAlerts} />);
    expect(screen.getByText(/Aphid detection/)).toBeInTheDocument();
    expect(screen.getByText(/Rain expected/)).toBeInTheDocument();
  });

  it('fires onMarkRead callback', () => {
    const handler = vi.fn();
    render(<AlertList alerts={fixtureAlerts} onMarkRead={handler} />);
    const btn = screen.getByText('Mark read');
    btn.click();
    expect(handler).toHaveBeenCalledWith('alert-001');
  });

  it('does not show Mark read for already-read alerts', () => {
    render(<AlertList alerts={fixtureAlerts} onMarkRead={vi.fn()} />);
    const buttons = screen.getAllByText('Mark read');
    // Only alert-001 is unread
    expect(buttons).toHaveLength(1);
  });
});
