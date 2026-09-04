import { useQuery } from '@tanstack/react-query';
import { economicsService } from '../services/economicsService';

export function useEconomics(farmId: string | undefined) {
  return useQuery({
    queryKey: ['economics', farmId],
    queryFn: () => economicsService.getFarmEconomics(farmId!),
    enabled: !!farmId,
  });
}
