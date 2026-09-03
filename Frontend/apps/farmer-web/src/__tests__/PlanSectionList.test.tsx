import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlanSectionList } from '@hv/ui';
import { fixturePlanContent } from '@hv/api-types';

describe('PlanSectionList', () => {
  it('renders recommended crops', () => {
    render(<PlanSectionList plan={fixturePlanContent} />);
    expect(screen.getByText('Basil')).toBeInTheDocument();
    expect(screen.getByText('Onion')).toBeInTheDocument();
  });

  it('renders calendar stages', () => {
    render(<PlanSectionList plan={fixturePlanContent} />);
    expect(screen.getByText('Soil Prep')).toBeInTheDocument();
    expect(screen.getByText('Harvest')).toBeInTheDocument();
  });

  it('renders input guidance', () => {
    render(<PlanSectionList plan={fixturePlanContent} />);
    expect(screen.getByText(/Drip irrigation/)).toBeInTheDocument();
  });

  it('renders yield prediction', () => {
    render(<PlanSectionList plan={fixturePlanContent} />);
    expect(screen.getByText('800 kg per kanal')).toBeInTheDocument();
    expect(screen.getByText(/high confidence/)).toBeInTheDocument();
  });

  it('renders disclaimer', () => {
    render(<PlanSectionList plan={fixturePlanContent} />);
    expect(screen.getByText(/AI-assisted guidance/)).toBeInTheDocument();
  });
});
