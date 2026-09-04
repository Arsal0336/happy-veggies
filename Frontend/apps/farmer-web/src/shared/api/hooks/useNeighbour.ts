import { useQuery } from '@tanstack/react-query';
import { neighbourService } from '../services/neighbourService';

export function useNeighbourWarnings(farmId: string | undefined) {
  return useQuery({
    queryKey: ['neighbour-warnings', farmId],
    queryFn: () => neighbourService.listWarnings(farmId!),
    enabled: !!farmId,
  });
}

export function useNeighbourEdges(farmId: string | undefined) {
  return useQuery({
    queryKey: ['neighbour-edges', farmId],
    queryFn: () => neighbourService.listEdges(farmId!),
    enabled: !!farmId,
  });
}
