import type { CropCycleDto, RecordActualsRequest } from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import { delay } from '../fixtures';

const fixtureCycles: CropCycleDto[] = [];

export const cropCycleService = {
  async list(farmId: string): Promise<CropCycleDto[]> {
    if (useFixtures()) {
      await delay();
      return fixtureCycles.filter((c) => c.id.startsWith(farmId) || true);
    }
    return farmerApi.get<CropCycleDto[]>(`/farms/${farmId}/crop-cycles`);
  },

  async recordActuals(
    farmId: string,
    cycleId: string,
    body: RecordActualsRequest,
  ): Promise<CropCycleDto> {
    if (useFixtures()) {
      await delay();
      const cycle = fixtureCycles.find((c) => c.id === cycleId);
      if (!cycle) throw new Error('Crop cycle not found');
      if (body.actualYield != null) {
        cycle.actualYield = body.actualYield;
        cycle.actualYieldUnit = body.actualYieldUnit ?? cycle.actualYieldUnit;
        cycle.delta =
          cycle.predictedYield != null
            ? body.actualYield - cycle.predictedYield
            : null;
      }
      if (body.notes != null) cycle.notes = body.notes;
      if (body.endedAt != null) cycle.endedAt = body.endedAt;
      cycle.updatedAt = new Date().toISOString();
      return { ...cycle };
    }
    return farmerApi.post<CropCycleDto>(
      `/farms/${farmId}/crop-cycles/${cycleId}/actuals`,
      body,
    );
  },
};
