import { farmerApi } from '../apiInstance';
import { fixtureFarms, fixtureProductionAreas, fixtureCropZones } from '@hv/api-types';
import type { Farm, ProductionArea, CropZone, CreateFarmPayload } from '@hv/api-types';

const USE_FIXTURES = !import.meta.env.VITE_API_BASE_URL;

export const farmService = {
  listFarms: async (): Promise<Farm[]> => {
    if (USE_FIXTURES) return fixtureFarms;
    const res = await farmerApi.get<{ items: Farm[] }>('/farms');
    return res.items;
  },

  getFarm: async (farmId: string): Promise<Farm | undefined> => {
    if (USE_FIXTURES) return fixtureFarms.find((f) => f.id === farmId);
    return farmerApi.get<Farm>(`/farms/${farmId}`);
  },

  createFarm: async (payload: CreateFarmPayload): Promise<Farm> => {
    if (USE_FIXTURES) {
      const now = new Date().toISOString();
      return {
        id: `farm-${Date.now()}`,
        farmerId: 'farmer-001',
        lat: payload.lat,
        lng: payload.lng,
        regionCode: payload.regionCode,
        regionLabel: payload.regionCode,
        areaAcres: payload.areaAcres,
        areaInput: payload.areaInput,
        preferredCropId: payload.preferredCropId ?? undefined,
        preferredCropFreetext: payload.preferredCropFreetext ?? undefined,
        isNewFarmSetup: payload.isNewFarmSetup,
        soilType: payload.soilType,
        waterAccess: payload.waterAccess,
        waterSource: payload.waterSource,
        createdAt: now,
        updatedAt: now,
      };
    }
    return farmerApi.post<Farm>('/farms', payload);
  },

  listAreas: async (farmId: string): Promise<ProductionArea[]> => {
    if (USE_FIXTURES) return fixtureProductionAreas.filter((a) => a.farmId === farmId);
    const res = await farmerApi.get<{ items: ProductionArea[] }>(`/farms/${farmId}/production-areas`);
    return res.items;
  },

  listZones: async (farmId: string): Promise<CropZone[]> => {
    if (USE_FIXTURES) return fixtureCropZones.filter((z) => z.farmId === farmId);
    const res = await farmerApi.get<{ items: CropZone[] }>(`/farms/${farmId}/crop-zones`);
    return res.items;
  },
};
