import type {
  CreateFarmRequest,
  CropZone,
  Farm,
  ProductionArea,
  ProductionAreaTypeCode,
  UpdateFarmRequest,
  ValueUnit,
} from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import {
  delay,
  fixtureAreas,
  fixtureFarms,
  fixtureZones,
  nextId,
  upsertArea,
  upsertFarm,
  upsertZone,
} from '../fixtures';
import { mapCropZone, mapFarm, mapProductionArea } from '../mappers';

export type CreateFarmInput = {
  name?: string;
  lat: number;
  lng: number;
  regionCode: string;
  regionLabel?: string;
  /** Nested area from UI — converted to areaInputValue/Unit for live API */
  area?: ValueUnit;
  areaInputValue?: number;
  areaInputUnit?: string;
  preferredCropId?: string | null;
  preferredCropFreeText?: string | null;
  isNewFarmSetup?: boolean;
  soilType?: Farm['soilType'];
  waterAccess?: boolean;
  waterSource?: Farm['waterSource'];
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
  letAiChooseCrop?: boolean;
};

export type CreateAreaInput = {
  name?: string;
  typeCode: ProductionAreaTypeCode;
  area?: ValueUnit;
  areaInputValue?: number;
  areaInputUnit?: string;
  temperatureC?: number | null;
  humidityPercent?: number | null;
  ventilation?: string | null;
  growingMedium?: string | null;
  structureType?: string | null;
};

export type CreateZoneInput = {
  productionAreaId: string;
  label?: string;
  area?: ValueUnit;
  areaInputValue?: number;
  areaInputUnit?: string;
  cropFreetext?: string;
  cropId?: string;
  seedVarietyId?: string;
  plantingDate?: string;
  neighbourIds?: string[];
  growthStage?: CropZone['growthStage'];
  expectedYieldValue?: number;
  expectedYieldUnit?: string;
  isExperimental?: boolean;
};

function resolveAreaInput(input: {
  area?: ValueUnit;
  areaInputValue?: number;
  areaInputUnit?: string;
}): { areaInputValue: number; areaInputUnit: string } {
  return {
    areaInputValue: input.areaInputValue ?? input.area?.value ?? 1,
    areaInputUnit: input.areaInputUnit ?? input.area?.unit ?? 'acre',
  };
}

function toCreateFarmRequest(input: CreateFarmInput): CreateFarmRequest {
  const { areaInputValue, areaInputUnit } = resolveAreaInput(input);
  return {
    name: input.name ?? null,
    lat: input.lat,
    lng: input.lng,
    regionCode: input.regionCode,
    regionLabel: input.regionLabel ?? input.regionCode,
    areaInputValue,
    areaInputUnit,
    preferredCropId: input.preferredCropId ?? null,
    preferredCropFreeText: input.preferredCropFreeText ?? null,
    isNewFarmSetup: input.isNewFarmSetup ?? true,
    soilType: input.soilType ?? null,
    waterAccess: input.waterAccess ?? null,
    waterSource: input.waterSource ?? null,
    budgetAmount: input.budgetAmount ?? null,
    budgetCurrency: input.budgetCurrency ?? null,
    letAiChooseCrop: input.letAiChooseCrop ?? false,
  };
}

function toUpdateFarmRequest(patch: Partial<CreateFarmInput>): UpdateFarmRequest {
  const body: UpdateFarmRequest = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.lat !== undefined) body.lat = patch.lat;
  if (patch.lng !== undefined) body.lng = patch.lng;
  if (patch.regionCode !== undefined) body.regionCode = patch.regionCode;
  if (patch.regionLabel !== undefined) body.regionLabel = patch.regionLabel;
  if (
    patch.areaInputValue !== undefined ||
    patch.areaInputUnit !== undefined ||
    patch.area !== undefined
  ) {
    const resolved = resolveAreaInput(patch);
    if (patch.areaInputValue !== undefined || patch.area !== undefined) {
      body.areaInputValue = resolved.areaInputValue;
    }
    if (patch.areaInputUnit !== undefined || patch.area !== undefined) {
      body.areaInputUnit = resolved.areaInputUnit;
    }
  }
  if (patch.preferredCropId !== undefined) {
    body.preferredCropId = patch.preferredCropId;
  }
  if (patch.preferredCropFreeText !== undefined) {
    body.preferredCropFreeText = patch.preferredCropFreeText;
  }
  if (patch.soilType !== undefined) body.soilType = patch.soilType;
  if (patch.waterAccess !== undefined) body.waterAccess = patch.waterAccess;
  if (patch.waterSource !== undefined) body.waterSource = patch.waterSource;
  if (patch.budgetAmount !== undefined) body.budgetAmount = patch.budgetAmount;
  if (patch.budgetCurrency !== undefined) {
    body.budgetCurrency = patch.budgetCurrency;
  }
  if (patch.letAiChooseCrop !== undefined) {
    body.letAiChooseCrop = patch.letAiChooseCrop;
  }
  return body;
}

export const farmService = {
  async listFarms(): Promise<Farm[]> {
    if (useFixtures()) {
      await delay();
      return fixtureFarms.filter((f) => !f.isDeleted).map(mapFarm);
    }
    const res = await farmerApi.get<Farm[]>('/farms');
    return (res ?? []).map(mapFarm);
  },

  async getFarm(farmId: string): Promise<Farm> {
    if (useFixtures()) {
      await delay();
      const farm = fixtureFarms.find((f) => f.id === farmId && !f.isDeleted);
      if (!farm) throw new Error('Farm not found');
      return mapFarm(farm);
    }
    return mapFarm(await farmerApi.get<Farm>(`/farms/${farmId}`));
  },

  async createFarm(input: CreateFarmInput): Promise<Farm> {
    const { areaInputValue, areaInputUnit } = resolveAreaInput(input);
    if (useFixtures()) {
      await delay();
      const now = new Date().toISOString();
      const farm: Farm = {
        id: nextId('farm'),
        farmerId: 'farmer-001',
        name: input.name ?? null,
        lat: input.lat,
        lng: input.lng,
        regionCode: input.regionCode,
        regionLabel: input.regionLabel ?? input.regionCode,
        areaInputValue,
        areaInputUnit,
        area: { value: areaInputValue, unit: areaInputUnit },
        soilType: input.soilType ?? null,
        waterAccess: input.waterAccess ?? null,
        waterSource: input.waterSource ?? null,
        isNewFarmSetup: input.isNewFarmSetup ?? true,
        letAiChooseCrop: input.letAiChooseCrop ?? false,
        preferredCropId: input.preferredCropId ?? null,
        preferredCropFreeText: input.preferredCropFreeText ?? null,
        createdAt: now,
        updatedAt: now,
      };
      upsertFarm(farm);
      return mapFarm(farm);
    }
    return mapFarm(
      await farmerApi.post<Farm>('/farms', toCreateFarmRequest(input)),
    );
  },

  async updateFarm(farmId: string, patch: Partial<CreateFarmInput>): Promise<Farm> {
    if (useFixtures()) {
      await delay();
      const existing = fixtureFarms.find((f) => f.id === farmId);
      if (!existing) throw new Error('Farm not found');
      const resolved =
        patch.area || patch.areaInputValue !== undefined || patch.areaInputUnit
          ? resolveAreaInput({ ...existing, ...patch })
          : {
              areaInputValue: existing.areaInputValue,
              areaInputUnit: existing.areaInputUnit,
            };
      const updated: Farm = {
        ...existing,
        ...patch,
        name: patch.name !== undefined ? patch.name : existing.name,
        areaInputValue: resolved.areaInputValue,
        areaInputUnit: resolved.areaInputUnit,
        area: {
          value: resolved.areaInputValue,
          unit: resolved.areaInputUnit,
        },
        updatedAt: new Date().toISOString(),
      };
      upsertFarm(updated);
      return mapFarm(updated);
    }
    return mapFarm(
      await farmerApi.patch<Farm>(`/farms/${farmId}`, toUpdateFarmRequest(patch)),
    );
  },

  /** Soft-delete farm (cascades areas + zones on backend). */
  async deleteFarm(farmId: string): Promise<void> {
    if (useFixtures()) {
      await delay();
      const existing = fixtureFarms.find((f) => f.id === farmId);
      if (existing) upsertFarm({ ...existing, isDeleted: true });
      fixtureAreas
        .filter((a) => a.farmId === farmId)
        .forEach((a) => upsertArea({ ...a, isDeleted: true }));
      fixtureZones
        .filter((z) => z.farmId === farmId)
        .forEach((z) => upsertZone({ ...z, isDeleted: true }));
      return;
    }
    await farmerApi.delete<void>(`/farms/${farmId}`);
  },

  async listAreas(farmId: string): Promise<ProductionArea[]> {
    if (useFixtures()) {
      await delay();
      return fixtureAreas
        .filter((a) => a.farmId === farmId && !a.isDeleted)
        .map((a) => mapProductionArea(a, farmId));
    }
    const res = await farmerApi.get<
      Array<Omit<ProductionArea, 'area'> & Partial<Pick<ProductionArea, 'area'>>>
    >(`/farms/${farmId}/production-areas`);
    return (res ?? []).map((a) => mapProductionArea(a, farmId));
  },

  async createArea(farmId: string, input: CreateAreaInput): Promise<ProductionArea> {
    const { areaInputValue, areaInputUnit } = resolveAreaInput(input);
    if (useFixtures()) {
      await delay();
      const area: ProductionArea = {
        id: nextId('area'),
        farmId,
        name: input.name ?? '',
        typeCode: input.typeCode,
        typeLabel: input.typeCode,
        areaInputValue,
        areaInputUnit,
        area: { value: areaInputValue, unit: areaInputUnit },
        createdAt: new Date().toISOString(),
      };
      upsertArea(area);
      return mapProductionArea(area, farmId);
    }
    const res = await farmerApi.post<
      Omit<ProductionArea, 'area'> & Partial<Pick<ProductionArea, 'area'>>
    >(`/farms/${farmId}/production-areas`, {
      typeCode: input.typeCode,
      name: input.name,
      areaInputValue,
      areaInputUnit,
      temperatureC: input.temperatureC,
      humidityPercent: input.humidityPercent,
      ventilation: input.ventilation,
      growingMedium: input.growingMedium,
      structureType: input.structureType,
    });
    return mapProductionArea(res, farmId);
  },

  async updateArea(
    farmId: string,
    areaId: string,
    patch: Partial<CreateAreaInput>,
  ): Promise<ProductionArea> {
    if (useFixtures()) {
      await delay();
      const existing = fixtureAreas.find((a) => a.id === areaId && a.farmId === farmId);
      if (!existing) throw new Error('Area not found');
      const resolved =
        patch.area || patch.areaInputValue !== undefined || patch.areaInputUnit
          ? resolveAreaInput({ ...existing, ...patch })
          : {
              areaInputValue: existing.areaInputValue,
              areaInputUnit: existing.areaInputUnit,
            };
      const updated: ProductionArea = {
        ...existing,
        ...patch,
        areaInputValue: resolved.areaInputValue,
        areaInputUnit: resolved.areaInputUnit,
        area: { value: resolved.areaInputValue, unit: resolved.areaInputUnit },
      };
      upsertArea(updated);
      return mapProductionArea(updated, farmId);
    }
    const body: Record<string, unknown> = {};
    if (patch.name !== undefined) body.name = patch.name;
    if (
      patch.area ||
      patch.areaInputValue !== undefined ||
      patch.areaInputUnit !== undefined
    ) {
      const resolved = resolveAreaInput(patch);
      body.areaInputValue = resolved.areaInputValue;
      body.areaInputUnit = resolved.areaInputUnit;
    }
    if (patch.temperatureC !== undefined) body.temperatureC = patch.temperatureC;
    if (patch.humidityPercent !== undefined) {
      body.humidityPercent = patch.humidityPercent;
    }
    if (patch.ventilation !== undefined) body.ventilation = patch.ventilation;
    if (patch.growingMedium !== undefined) body.growingMedium = patch.growingMedium;
    if (patch.structureType !== undefined) body.structureType = patch.structureType;

    const res = await farmerApi.patch<
      Omit<ProductionArea, 'area'> & Partial<Pick<ProductionArea, 'area'>>
    >(`/farms/${farmId}/production-areas/${areaId}`, body);
    return mapProductionArea(res, farmId);
  },

  async deleteArea(farmId: string, areaId: string): Promise<void> {
    if (useFixtures()) {
      await delay();
      const existing = fixtureAreas.find((a) => a.id === areaId && a.farmId === farmId);
      if (existing) upsertArea({ ...existing, isDeleted: true });
      fixtureZones
        .filter((z) => z.farmId === farmId && z.productionAreaId === areaId)
        .forEach((z) => upsertZone({ ...z, isDeleted: true }));
      return;
    }
    await farmerApi.delete<void>(`/farms/${farmId}/production-areas/${areaId}`);
  },

  async listZones(farmId: string, areaId?: string): Promise<CropZone[]> {
    if (useFixtures()) {
      await delay();
      return fixtureZones
        .filter(
          (z) =>
            z.farmId === farmId &&
            !z.isDeleted &&
            (areaId ? z.productionAreaId === areaId : true),
        )
        .map((z) => mapCropZone(z, farmId));
    }

    if (areaId) {
      const res = await farmerApi.get<
        Array<Omit<CropZone, 'area'> & Partial<Pick<CropZone, 'area'>>>
      >(`/farms/${farmId}/production-areas/${areaId}/zones`);
      return (res ?? []).map((z) => mapCropZone(z, farmId));
    }

    // No farm-wide zones endpoint — fan out via production areas.
    const areas = await this.listAreas(farmId);
    const nested = await Promise.all(
      areas.map((a) =>
        farmerApi.get<
          Array<Omit<CropZone, 'area'> & Partial<Pick<CropZone, 'area'>>>
        >(`/farms/${farmId}/production-areas/${a.id}/zones`),
      ),
    );
    return nested.flat().map((z) => mapCropZone(z, farmId));
  },

  async createZone(farmId: string, input: CreateZoneInput): Promise<CropZone> {
    const { areaInputValue, areaInputUnit } = resolveAreaInput(input);
    if (useFixtures()) {
      await delay();
      const zone: CropZone = {
        id: nextId('zone'),
        farmId,
        productionAreaId: input.productionAreaId,
        label: input.label ?? '',
        areaInputValue,
        areaInputUnit,
        area: { value: areaInputValue, unit: areaInputUnit },
        cropFreetext: input.cropFreetext ?? null,
        cropId: input.cropId ?? null,
        seedVarietyId: input.seedVarietyId ?? null,
        plantingDate: input.plantingDate ?? null,
        neighbourIds: input.neighbourIds ?? [],
        growthStage: input.growthStage ?? 'pre_planting',
        expectedYieldValue: input.expectedYieldValue ?? null,
        expectedYieldUnit: input.expectedYieldUnit ?? null,
        isExperimental: input.isExperimental ?? false,
        createdAt: new Date().toISOString(),
      };
      upsertZone(zone);
      return mapCropZone(zone, farmId);
    }
    const res = await farmerApi.post<
      Omit<CropZone, 'area'> & Partial<Pick<CropZone, 'area'>>
    >(`/farms/${farmId}/production-areas/${input.productionAreaId}/zones`, {
      label: input.label,
      areaInputValue,
      areaInputUnit,
      cropId: input.cropId,
      cropFreetext: input.cropFreetext,
      seedVarietyId: input.seedVarietyId,
      plantingDate: input.plantingDate,
      growthStage: input.growthStage,
      expectedYieldValue: input.expectedYieldValue,
      expectedYieldUnit: input.expectedYieldUnit,
      isExperimental: input.isExperimental ?? false,
    });
    return mapCropZone(res, farmId);
  },

  async updateZone(
    farmId: string,
    areaId: string,
    zoneId: string,
    patch: Partial<CreateZoneInput>,
  ): Promise<CropZone> {
    if (useFixtures()) {
      await delay();
      const existing = fixtureZones.find(
        (z) => z.id === zoneId && z.farmId === farmId,
      );
      if (!existing) throw new Error('Zone not found');
      const resolved =
        patch.area || patch.areaInputValue !== undefined || patch.areaInputUnit
          ? resolveAreaInput({ ...existing, ...patch })
          : {
              areaInputValue: existing.areaInputValue,
              areaInputUnit: existing.areaInputUnit,
            };
      const updated: CropZone = {
        ...existing,
        ...patch,
        areaInputValue: resolved.areaInputValue,
        areaInputUnit: resolved.areaInputUnit,
        area: { value: resolved.areaInputValue, unit: resolved.areaInputUnit },
      };
      upsertZone(updated);
      return mapCropZone(updated, farmId);
    }
    const body: Record<string, unknown> = {};
    if (patch.label !== undefined) body.label = patch.label;
    if (
      patch.area ||
      patch.areaInputValue !== undefined ||
      patch.areaInputUnit !== undefined
    ) {
      const resolved = resolveAreaInput(patch);
      body.areaInputValue = resolved.areaInputValue;
      body.areaInputUnit = resolved.areaInputUnit;
    }
    if (patch.cropId !== undefined) body.cropId = patch.cropId;
    if (patch.cropFreetext !== undefined) body.cropFreetext = patch.cropFreetext;
    if (patch.seedVarietyId !== undefined) body.seedVarietyId = patch.seedVarietyId;
    if (patch.plantingDate !== undefined) body.plantingDate = patch.plantingDate;
    if (patch.growthStage !== undefined) body.growthStage = patch.growthStage;
    if (patch.expectedYieldValue !== undefined) {
      body.expectedYieldValue = patch.expectedYieldValue;
    }
    if (patch.expectedYieldUnit !== undefined) {
      body.expectedYieldUnit = patch.expectedYieldUnit;
    }

    const res = await farmerApi.patch<
      Omit<CropZone, 'area'> & Partial<Pick<CropZone, 'area'>>
    >(`/farms/${farmId}/production-areas/${areaId}/zones/${zoneId}`, body);
    return mapCropZone(res, farmId);
  },

  async deleteZone(farmId: string, areaId: string, zoneId: string): Promise<void> {
    if (useFixtures()) {
      await delay();
      const existing = fixtureZones.find((z) => z.id === zoneId && z.farmId === farmId);
      if (existing) upsertZone({ ...existing, isDeleted: true });
      return;
    }
    await farmerApi.delete<void>(
      `/farms/${farmId}/production-areas/${areaId}/zones/${zoneId}`,
    );
  },
};
