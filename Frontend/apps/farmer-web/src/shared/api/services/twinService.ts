import type { FarmTwinDto, TwinDto } from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import { buildTwin, delay } from '../fixtures';
import { mapFarmTwin } from '../mappers';

export const twinService = {
  async getTwin(farmId: string): Promise<TwinDto> {
    if (useFixtures()) {
      await delay();
      const twin = buildTwin(farmId);
      if (!twin) throw new Error('Twin not found');
      return twin;
    }
    const dto = await farmerApi.get<FarmTwinDto>(`/farms/${farmId}/twin`);
    return mapFarmTwin(dto);
  },

  async refreshTwin(farmId: string): Promise<TwinDto> {
    if (useFixtures()) {
      await delay();
      const twin = buildTwin(farmId);
      if (!twin) throw new Error('Twin not found');
      return twin;
    }
    const dto = await farmerApi.post<FarmTwinDto>(`/farms/${farmId}/twin/refresh`);
    return mapFarmTwin(dto);
  },
};
