import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FarmGraphic } from '@hv/ui';
import { fixtureProductionAreas, fixtureCropZones } from '@hv/api-types';

describe('FarmGraphic', () => {
  it('renders empty state when no areas/zones', () => {
    render(<FarmGraphic areas={[]} zones={[]} />);
    expect(screen.getByText('No crop zones')).toBeInTheDocument();
  });

  it('renders populated state with areas and zones', () => {
    render(
      <FarmGraphic
        areas={fixtureProductionAreas}
        zones={fixtureCropZones}
      />,
    );
    expect(screen.getByText(/3 areas/)).toBeInTheDocument();
    expect(screen.getByText(/2 zones/)).toBeInTheDocument();
  });

  it('renders zone labels inside SVG', () => {
    render(
      <FarmGraphic
        areas={fixtureProductionAreas}
        zones={fixtureCropZones}
      />,
    );
    expect(screen.getByText('Tomato Section')).toBeInTheDocument();
    expect(screen.getByText('Wheat Strip')).toBeInTheDocument();
  });

  it('fires onZoneClick when a zone is clicked', () => {
    const handler = vi.fn();
    render(
      <FarmGraphic
        areas={fixtureProductionAreas}
        zones={fixtureCropZones}
        onZoneClick={handler}
      />,
    );
    fireEvent.click(screen.getByText('Tomato Section').closest('g')!);
    expect(handler).toHaveBeenCalledWith('zone-001');
  });
});
