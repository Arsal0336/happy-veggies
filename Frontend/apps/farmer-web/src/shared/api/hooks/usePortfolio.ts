import { useQuery } from '@tanstack/react-query';
import { portfolioService } from '../services/portfolioService';

export function usePortfolio(farmId: string | undefined) {
  return useQuery({
    queryKey: ['portfolio', farmId],
    queryFn: () => portfolioService.get(farmId!),
    enabled: !!farmId,
    retry: false,
  });
}
