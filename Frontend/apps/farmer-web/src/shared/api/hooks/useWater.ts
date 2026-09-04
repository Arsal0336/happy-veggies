import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateWaterSourceRequest, UpdateWaterSourceRequest } from '@hv/api-types';
import { waterService } from '../services/waterService';

export function useWaterSources(farmId: string | undefined) {
  return useQuery({
    queryKey: ['water', farmId],
    queryFn: () => waterService.list(farmId!),
    enabled: !!farmId,
  });
}

export function useCreateWaterSource(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWaterSourceRequest) => waterService.create(farmId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['water', farmId] });
      void qc.invalidateQueries({ queryKey: ['twin', farmId] });
    },
  });
}

export function useUpdateWaterSource(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sourceId,
      patch,
    }: {
      sourceId: string;
      patch: UpdateWaterSourceRequest;
    }) => waterService.update(farmId, sourceId, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['water', farmId] });
      void qc.invalidateQueries({ queryKey: ['twin', farmId] });
    },
  });
}

export function useDeleteWaterSource(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => waterService.remove(farmId, sourceId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['water', farmId] });
      void qc.invalidateQueries({ queryKey: ['twin', farmId] });
    },
  });
}
