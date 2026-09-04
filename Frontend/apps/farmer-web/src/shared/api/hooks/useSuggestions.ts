import { useQuery } from '@tanstack/react-query';
import { suggestionService } from '../services/suggestionService';

export function useSuggestions(farmId: string | undefined) {
  return useQuery({
    queryKey: ['suggestions', farmId],
    queryFn: () => suggestionService.listSuggestions(farmId!),
    enabled: !!farmId,
  });
}

export function useSeedSuggestions(
  farmId: string | undefined,
  cropId: string | undefined,
) {
  return useQuery({
    queryKey: ['seed-suggestions', farmId, cropId],
    queryFn: () => suggestionService.listSeedSuggestions(farmId!, cropId!),
    enabled: !!farmId && !!cropId?.trim(),
  });
}
