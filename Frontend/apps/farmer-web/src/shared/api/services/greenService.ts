import { farmerApi } from '../apiInstance';
import { fixtureGreenScore } from '@hv/api-types';
import type { GreenFarmScore } from '@hv/api-types';

const USE_FIXTURES = !import.meta.env.VITE_API_BASE_URL;

export const greenService = {
  getGreenScore: async (farmId: string): Promise<GreenFarmScore> => {
    if (USE_FIXTURES) return fixtureGreenScore;
    return farmerApi.get<GreenFarmScore>(`/farms/${farmId}/green-score`);
  },
};
