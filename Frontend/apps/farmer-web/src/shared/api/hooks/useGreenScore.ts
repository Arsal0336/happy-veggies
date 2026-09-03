import { useQuery } from '@tanstack/react-query';
import { greenService } from '../services/greenService';

export const useGreenScore = (farmId: string) =>
  useQuery({ queryKey: ['greenScore', farmId], queryFn: () => greenService.getGreenScore(farmId), enabled: !!farmId });
