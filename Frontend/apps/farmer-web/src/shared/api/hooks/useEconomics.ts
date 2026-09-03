import { useQuery } from '@tanstack/react-query';
import { economicsService } from '../services/economicsService';

export const useEconomics = (farmId: string) =>
  useQuery({ queryKey: ['economics', farmId], queryFn: () => economicsService.getEconomics(farmId), enabled: !!farmId });
