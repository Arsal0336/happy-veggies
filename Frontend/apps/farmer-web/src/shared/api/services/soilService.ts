import type { SoilProfileRecord, UpsertSoilProfileRequest } from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import {
  delay,
  fixtureSoilProfiles,
  nextId,
  upsertFixtureSoilProfile,
} from '../fixtures';

export const soilService = {
  async list(farmId: string): Promise<SoilProfileRecord[]> {
    if (useFixtures()) {
      await delay();
      return fixtureSoilProfiles.filter((s) => s.farmId === farmId && !s.isDeleted);
    }
    const res = await farmerApi.get<SoilProfileRecord[]>(
      `/farms/${farmId}/soil-profiles`,
    );
    return res ?? [];
  },

  async upsert(
    farmId: string,
    input: UpsertSoilProfileRequest,
  ): Promise<SoilProfileRecord> {
    if (useFixtures()) {
      await delay();
      const now = new Date().toISOString();
      const existing = input.id
        ? fixtureSoilProfiles.find((s) => s.id === input.id && s.farmId === farmId)
        : undefined;
      const record: SoilProfileRecord = {
        id: existing?.id ?? nextId('soil'),
        farmId,
        productionAreaId: input.productionAreaId ?? existing?.productionAreaId ?? null,
        soilType: input.soilType ?? existing?.soilType ?? null,
        soilTypeProvenance:
          input.provenance ?? existing?.soilTypeProvenance ?? 'farmer_provided',
        texture: input.texture ?? existing?.texture ?? null,
        phValue: input.phValue ?? existing?.phValue ?? null,
        phValueProvenance:
          input.provenance ?? existing?.phValueProvenance ?? 'farmer_provided',
        organicMatterValue:
          input.organicMatterValue ?? existing?.organicMatterValue ?? null,
        nitrogenValue: input.nitrogenValue ?? existing?.nitrogenValue ?? null,
        phosphorusValue: input.phosphorusValue ?? existing?.phosphorusValue ?? null,
        potassiumValue: input.potassiumValue ?? existing?.potassiumValue ?? null,
        farmerNotes: input.farmerNotes ?? existing?.farmerNotes ?? null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      upsertFixtureSoilProfile(record);
      return record;
    }
    return farmerApi.put<SoilProfileRecord>(
      `/farms/${farmId}/soil-profiles`,
      input,
    );
  },
};
