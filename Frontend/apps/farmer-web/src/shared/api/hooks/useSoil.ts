import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpsertSoilProfileRequest } from '@hv/api-types';
import { soilService } from '../services/soilService';

export function useSoilProfiles(farmId: string | undefined) {
  return useQuery({
    queryKey: ['soil', farmId],
    queryFn: () => soilService.list(farmId!),
    enabled: !!farmId,
  });
}

export function useUpsertSoilProfile(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertSoilProfileRequest) =>
      soilService.upsert(farmId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['soil', farmId] });
      void qc.invalidateQueries({ queryKey: ['twin', farmId] });
    },
  });
}
