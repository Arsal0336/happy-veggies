import type {
  CropSuggestionDto,
  SeedVarietySuggestionDto,
  SuggestionsResponse,
} from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import { delay, fixtureSuggestions } from '../fixtures';
import { mapCropSuggestions } from '../mappers';

const fixtureSeedVarieties: Record<string, SeedVarietySuggestionDto[]> = {
  tomato: [
    {
      id: 'var-tomato-roma',
      nameEn: 'Roma VF',
      nameUr: 'روما وی ایف',
      varietyType: 'Hybrid',
      riskBand: 'Low',
      maturityDays: 75,
      soilNotes: 'Well-drained loam',
      waterNotes: 'Regular drip',
    },
    {
      id: 'var-tomato-cherry',
      nameEn: 'Cherry Sweet',
      nameUr: 'چیری سویٹ',
      varietyType: 'OpenPollinated',
      riskBand: 'Medium',
      maturityDays: 65,
    },
  ],
  wheat: [
    {
      id: 'var-wheat-local',
      nameEn: 'Local wheat',
      nameUr: 'مقامی گندم',
      varietyType: 'OpenPollinated',
      riskBand: 'Low',
      maturityDays: 120,
    },
  ],
};

export const suggestionService = {
  async listSuggestions(farmId: string): Promise<SuggestionsResponse> {
    if (useFixtures()) {
      await delay();
      return { suggestions: fixtureSuggestions };
    }
    const items = await farmerApi.get<CropSuggestionDto[]>(
      `/farms/${farmId}/suggestions`,
    );
    return { suggestions: mapCropSuggestions(items ?? []) };
  },

  async listSeedSuggestions(
    farmId: string,
    cropId: string,
  ): Promise<SeedVarietySuggestionDto[]> {
    if (!cropId.trim()) return [];
    if (useFixtures()) {
      await delay();
      const key = cropId.toLowerCase();
      return (
        fixtureSeedVarieties[key] ??
        fixtureSeedVarieties.tomato!.map((v) => ({
          ...v,
          id: `var-${key}-${v.id}`,
          nameEn: `${cropId} variety`,
        }))
      );
    }
    return (
      (await farmerApi.get<SeedVarietySuggestionDto[]>(
        `/farms/${farmId}/seed-suggestions/${encodeURIComponent(cropId)}`,
      )) ?? []
    );
  },
};
