import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { twinService } from '../services/twinService';

export function useTwin(farmId: string | undefined) {
  return useQuery({
    queryKey: ['twin', farmId],
    queryFn: () => twinService.getTwin(farmId!),
    enabled: !!farmId,
  });
}

export function useRefreshTwin(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => twinService.refreshTwin(farmId),
    onSuccess: (twin) => {
      qc.setQueryData(['twin', farmId], twin);
    },
  });
}
