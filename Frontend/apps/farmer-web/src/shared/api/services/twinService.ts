import { farmerApi } from '../apiInstance';
import { fixtureTwin } from '@hv/api-types';
import type { TwinSummary } from '@hv/api-types';

const USE_FIXTURES = !import.meta.env.VITE_API_BASE_URL;

export const twinService = {
  getTwin: async (farmId: string): Promise<TwinSummary> => {
    if (USE_FIXTURES) return fixtureTwin;
    return farmerApi.get<TwinSummary>(`/farms/${farmId}/twin`);
  },
};
