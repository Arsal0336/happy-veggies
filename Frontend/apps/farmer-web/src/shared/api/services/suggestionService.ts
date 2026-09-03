import { farmerApi } from '../apiInstance';
import { fixtureSuggestions } from '@hv/api-types';
import type { CropSuggestion } from '@hv/api-types';

const USE_FIXTURES = !import.meta.env.VITE_API_BASE_URL;

export const suggestionService = {
  getSuggestions: async (): Promise<CropSuggestion[]> => {
    if (USE_FIXTURES) return fixtureSuggestions;
    const res = await farmerApi.get<{ suggestions: CropSuggestion[] }>('/suggestions');
    return res.suggestions;
  },
};
