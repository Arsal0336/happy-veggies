import type {
  CreateWaterSourceRequest,
  UpdateWaterSourceRequest,
  WaterSource,
} from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import {
  delay,
  fixtureWaterSources,
  nextId,
  removeFixtureWaterSource,
  upsertFixtureWaterSource,
} from '../fixtures';

export const waterService = {
  async list(farmId: string): Promise<WaterSource[]> {
    if (useFixtures()) {
      await delay();
      return fixtureWaterSources.filter((w) => w.farmId === farmId && !w.isDeleted);
    }
    const res = await farmerApi.get<WaterSource[]>(`/farms/${farmId}/water-sources`);
    return res ?? [];
  },

  async create(farmId: string, input: CreateWaterSourceRequest): Promise<WaterSource> {
    if (useFixtures()) {
      await delay();
      const now = new Date().toISOString();
      const source: WaterSource = {
        id: nextId('ws'),
        farmId,
        type: input.type,
        seasonalAvailability: input.seasonalAvailability ?? null,
        capacityEstimateValue: input.capacityEstimateValue ?? null,
        capacityEstimateUnit: input.capacityEstimateUnit ?? null,
        capacityEstimate:
          input.capacityEstimateValue != null
            ? {
                value: input.capacityEstimateValue,
                unit: input.capacityEstimateUnit ?? 'm3',
              }
            : undefined,
        irrigationMethod: input.irrigationMethod ?? null,
        reliabilityValue: input.reliabilityValue ?? null,
        reliability: 'reliable',
        provenance: (input.provenance as WaterSource['provenance']) ?? 'farmer_provided',
        createdAt: now,
        updatedAt: now,
      };
      upsertFixtureWaterSource(source);
      return source;
    }
    return farmerApi.post<WaterSource>(`/farms/${farmId}/water-sources`, input);
  },

  async update(
    farmId: string,
    sourceId: string,
    patch: UpdateWaterSourceRequest,
  ): Promise<WaterSource> {
    if (useFixtures()) {
      await delay();
      const existing = fixtureWaterSources.find(
        (w) => w.id === sourceId && w.farmId === farmId,
      );
      if (!existing) throw new Error('Water source not found');
      const updated: WaterSource = {
        ...existing,
        type: patch.type ?? existing.type,
        seasonalAvailability:
          patch.seasonalAvailability !== undefined
            ? patch.seasonalAvailability
            : existing.seasonalAvailability,
        capacityEstimateValue:
          patch.capacityEstimateValue !== undefined
            ? patch.capacityEstimateValue
            : existing.capacityEstimateValue,
        capacityEstimateUnit:
          patch.capacityEstimateUnit !== undefined
            ? patch.capacityEstimateUnit
            : existing.capacityEstimateUnit,
        irrigationMethod:
          patch.irrigationMethod !== undefined
            ? patch.irrigationMethod
            : existing.irrigationMethod,
        reliabilityValue:
          patch.reliabilityValue !== undefined
            ? patch.reliabilityValue
            : existing.reliabilityValue,
        provenance:
          (patch.provenance as WaterSource['provenance']) ?? existing.provenance,
        updatedAt: new Date().toISOString(),
      };
      upsertFixtureWaterSource(updated);
      return updated;
    }
    return farmerApi.patch<WaterSource>(
      `/farms/${farmId}/water-sources/${sourceId}`,
      patch,
    );
  },

  async remove(farmId: string, sourceId: string): Promise<void> {
    if (useFixtures()) {
      await delay();
      removeFixtureWaterSource(farmId, sourceId);
      return;
    }
    await farmerApi.delete<void>(`/farms/${farmId}/water-sources/${sourceId}`);
  },
};
