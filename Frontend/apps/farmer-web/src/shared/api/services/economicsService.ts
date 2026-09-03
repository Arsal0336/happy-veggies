import { farmerApi } from '../apiInstance';
import { fixtureEconomics } from '@hv/api-types';
import type { EconomicSnapshot } from '@hv/api-types';

const USE_FIXTURES = !import.meta.env.VITE_API_BASE_URL;

export const economicsService = {
  getEconomics: async (farmId: string): Promise<EconomicSnapshot> => {
    if (USE_FIXTURES) return fixtureEconomics;
    return farmerApi.get<EconomicSnapshot>(`/farms/${farmId}/economics`);
  },
};
