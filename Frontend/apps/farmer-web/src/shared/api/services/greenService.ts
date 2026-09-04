import type { GreenScore, GreenScoreResult, GreenTipResult } from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import { delay, fixtureGreenScores } from '../fixtures';
import { GREEN_NON_CERT_DISCLAIMER, mapGreenScoreResult } from '../mappers';

export const greenService = {
  async getGreenScore(farmId: string): Promise<GreenScore> {
    if (useFixtures()) {
      await delay();
      const score = fixtureGreenScores[farmId];
      if (score) return score;
      return {
        farmId,
        overallScore: 50,
        maxScore: 100,
        dimensions: {},
        computedAt: new Date().toISOString(),
        nonCertificationDisclaimer: GREEN_NON_CERT_DISCLAIMER,
      };
    }
    const result = await farmerApi.get<GreenScoreResult>(
      `/farms/${farmId}/green-score`,
    );
    return mapGreenScoreResult(farmId, result);
  },

  async recalculate(farmId: string): Promise<GreenScore> {
    if (useFixtures()) {
      return this.getGreenScore(farmId);
    }
    const result = await farmerApi.post<GreenScoreResult>(
      `/farms/${farmId}/green-score/recalculate`,
    );
    return mapGreenScoreResult(farmId, result);
  },

  async getTips(farmId: string): Promise<GreenTipResult> {
    if (useFixtures()) {
      await delay();
      const score = await this.getGreenScore(farmId);
      return {
        score: score.overallScore,
        maxScore: score.maxScore ?? 100,
        tips: 'Fixture tips — improve data completeness for a higher guidance score.',
        factors: score.explanations ?? [],
      };
    }
    return farmerApi.get<GreenTipResult>(`/farms/${farmId}/green-tips`);
  },
};
