import type { PortfolioResponse } from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';

const fixture: PortfolioResponse = {
  status: 'ok',
  engine: 'pypfopt',
  method: 'fixture',
  farmId: 'farm-1',
  totalAreaAcres: 5,
  disclaimer:
    'Portfolio allocation is a planning aid. Sustainability is one soft factor (FR-117). Not financial advice.',
  allocations: [
    {
      cropId: 'tomato',
      cropName: 'Tomato',
      areaType: 'open_field',
      weight: 0.45,
      allocatedAcres: 2.25,
      suitability: 0.9,
      waterFit: 0.8,
      greenFactor: 0.5,
    },
    {
      cropId: 'onion',
      cropName: 'Onion',
      areaType: 'open_field',
      weight: 0.35,
      allocatedAcres: 1.75,
      suitability: 0.85,
      waterFit: 0.75,
      greenFactor: 0.5,
    },
    {
      cropId: 'spinach',
      cropName: 'Spinach',
      areaType: 'open_field',
      weight: 0.2,
      allocatedAcres: 1,
      suitability: 0.8,
      waterFit: 0.7,
      greenFactor: 0.55,
    },
  ],
  expectedPortfolioReturn: 0.16,
  portfolioVolatility: 0.18,
};

export const portfolioService = {
  async get(farmId: string): Promise<PortfolioResponse> {
    if (useFixtures()) return { ...fixture, farmId };
    return farmerApi.get<PortfolioResponse>(`/farms/${farmId}/portfolio`);
  },
};
