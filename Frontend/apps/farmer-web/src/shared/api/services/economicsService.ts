import type {
  FarmEconomicSnapshot,
  FarmEconomicsResponse,
} from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import { delay, fixtureEconomics } from '../fixtures';

export const ECONOMICS_HISTORICAL_DISCLAIMER =
  'Government rates are historical reference only — not a price guarantee or market forecast.';

function normalizeSnapshots(
  raw: FarmEconomicSnapshot[] | FarmEconomicsResponse | null | undefined,
): FarmEconomicsResponse {
  if (!raw) {
    return { snapshots: [], disclaimer: ECONOMICS_HISTORICAL_DISCLAIMER };
  }
  if (Array.isArray(raw)) {
    return {
      snapshots: raw.map((s) => ({
        ...s,
        label: s.label ?? 'historical_reference',
      })),
      disclaimer: ECONOMICS_HISTORICAL_DISCLAIMER,
    };
  }
  return {
    snapshots: (raw.snapshots ?? []).map((s) => ({
      ...s,
      label: s.label ?? 'historical_reference',
    })),
    disclaimer: raw.disclaimer || ECONOMICS_HISTORICAL_DISCLAIMER,
  };
}

export const economicsService = {
  async getFarmEconomics(farmId: string): Promise<FarmEconomicsResponse> {
    if (useFixtures()) {
      await delay();
      return normalizeSnapshots(fixtureEconomics[farmId] ?? []);
    }
    const res = await farmerApi.get<
      FarmEconomicSnapshot[] | FarmEconomicsResponse
    >(`/farms/${farmId}/economics`);
    return normalizeSnapshots(res);
  },
};
