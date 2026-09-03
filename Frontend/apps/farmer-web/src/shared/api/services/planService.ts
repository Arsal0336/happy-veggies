import { farmerApi } from '../apiInstance';
import { fixturePlan } from '@hv/api-types';
import type { FarmPlan, PlanGenerateResponse } from '@hv/api-types';

const USE_FIXTURES = !import.meta.env.VITE_API_BASE_URL;

export const planService = {
  getPlan: async (farmId: string): Promise<FarmPlan> => {
    if (USE_FIXTURES) return fixturePlan;
    return farmerApi.get<FarmPlan>(`/farms/${farmId}/plan`);
  },

  generatePlan: async (farmId: string): Promise<PlanGenerateResponse> => {
    if (USE_FIXTURES) return { planId: fixturePlan.id, plan: fixturePlan.content };
    return farmerApi.post<PlanGenerateResponse>(`/farms/${farmId}/plan/generate`);
  },
};
