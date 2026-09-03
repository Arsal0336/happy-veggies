import { useQuery } from '@tanstack/react-query';
import { planService } from '../services/planService';

export const usePlan = (farmId: string) =>
  useQuery({ queryKey: ['plan', farmId], queryFn: () => planService.getPlan(farmId), enabled: !!farmId });
