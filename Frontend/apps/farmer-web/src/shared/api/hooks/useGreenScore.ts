import { useQuery } from '@tanstack/react-query';
import { greenService } from '../services/greenService';

export function useGreenScore(farmId: string | undefined) {
  return useQuery({
    queryKey: ['green', farmId],
    queryFn: () => greenService.getGreenScore(farmId!),
    enabled: !!farmId,
  });
}
