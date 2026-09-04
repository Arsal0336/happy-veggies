import type { PortfolioBlockedResponse } from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import { delay } from '../fixtures';

export const portfolioService = {
  async get(farmId: string): Promise<PortfolioBlockedResponse> {
    if (useFixtures()) {
      await delay();
      return {
        status: 'blocked',
        reason: 'GAP-054 algorithm TBD (GAP-003 TBD-11)',
      };
    }
    return farmerApi.get<PortfolioBlockedResponse>(`/farms/${farmId}/portfolio`);
  },
};
