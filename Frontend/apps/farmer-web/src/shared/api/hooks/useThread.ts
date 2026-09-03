import { useQuery } from '@tanstack/react-query';
import { assistantService } from '../services/assistantService';

export const useThread = (farmId: string) =>
  useQuery({ queryKey: ['thread', farmId], queryFn: () => assistantService.getThread(farmId), enabled: !!farmId });
