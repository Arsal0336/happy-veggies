import { useQuery } from '@tanstack/react-query';
import { twinService } from '../services/twinService';

export const useTwin = (farmId: string) =>
  useQuery({ queryKey: ['twin', farmId], queryFn: () => twinService.getTwin(farmId), enabled: !!farmId });
