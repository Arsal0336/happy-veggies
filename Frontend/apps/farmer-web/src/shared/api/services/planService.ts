import type { Language, PlanDetail, PlanDto } from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import { delay, fixturePlans, nextId, setPlan, fixturePlanHistory } from '../fixtures';
import { mapPlanDetailToPlanDto, PLAN_ADVISORY_DISCLAIMER } from '../mappers';

export const planService = {
  /** Latest plan from GET /plan/history (no standalone GET /plan). */
  async getPlan(farmId: string): Promise<PlanDto | null> {
    if (useFixtures()) {
      await delay();
      return fixturePlans[farmId] ?? null;
    }
    try {
      const history = await farmerApi.get<PlanDetail[]>(
        `/farms/${farmId}/plan/history`,
      );
      if (!history?.length) return null;
      const latest = [...history].sort(
        (a, b) =>
          b.version - a.version ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0]!;
      return mapPlanDetailToPlanDto(latest);
    } catch {
      return null;
    }
  },

  async generatePlan(farmId: string, language: Language = 'en'): Promise<PlanDto> {
    if (useFixtures()) {
      await delay(400);
      const existing = fixturePlans[farmId];
      const plan: PlanDto = {
        id: existing?.id ?? nextId('plan'),
        farmId,
        version: (existing?.version ?? 0) + 1,
        language,
        createdAt: new Date().toISOString(),
        disclaimer: PLAN_ADVISORY_DISCLAIMER,
        sections: [
          {
            key: 'overview',
            title: language === 'ur' ? 'موسمی جائزہ' : 'Season overview',
            body:
              language === 'ur'
                ? 'فکسچر منصوبہ — آبپاشی اور فصل کی دیکھ بھال پر توجہ دیں۔'
                : 'Fixture plan — focus on irrigation cadence and crop care.',
          },
          {
            key: 'actions',
            title: language === 'ur' ? 'اقدامات' : 'Actions',
            body:
              language === 'ur'
                ? 'ہفتہ وار کیڑوں کا معائنہ کریں اور مٹی کی نمی چیک کریں۔'
                : 'Scout pests weekly and check soil moisture.',
          },
        ],
      };
      setPlan(farmId, plan);
      return plan;
    }
    const detail = await farmerApi.post<PlanDetail>(`/farms/${farmId}/plan`, {
      language,
    });
    return mapPlanDetailToPlanDto(detail);
  },

  async listHistory(farmId: string): Promise<PlanDto[]> {
    if (useFixtures()) {
      await delay();
      const current = fixturePlans[farmId];
      const prior = fixturePlanHistory[farmId] ?? [];
      return current ? [current, ...prior.filter((p) => p.id !== current.id)] : [...prior];
    }
    const history = await farmerApi.get<PlanDetail[]>(
      `/farms/${farmId}/plan/history`,
    );
    return (history ?? []).map(mapPlanDetailToPlanDto);
  },
};
