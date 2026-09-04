import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { farmService, type CreateFarmInput } from '../services/farmService';

export function useFarms() {
  return useQuery({
    queryKey: ['farms'],
    queryFn: () => farmService.listFarms(),
  });
}

export function useFarm(farmId: string | undefined) {
  return useQuery({
    queryKey: ['farm', farmId],
    queryFn: () => farmService.getFarm(farmId!),
    enabled: !!farmId,
  });
}

export function useAreas(farmId: string | undefined) {
  return useQuery({
    queryKey: ['areas', farmId],
    queryFn: () => farmService.listAreas(farmId!),
    enabled: !!farmId,
  });
}

export function useZones(farmId: string | undefined, areaId?: string) {
  return useQuery({
    queryKey: ['zones', farmId, areaId],
    queryFn: () => farmService.listZones(farmId!, areaId),
    enabled: !!farmId,
  });
}

export function useCreateFarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFarmInput) => farmService.createFarm(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['farms'] });
    },
  });
}

export function useUpdateFarm(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<CreateFarmInput>) =>
      farmService.updateFarm(farmId, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['farms'] });
      void qc.invalidateQueries({ queryKey: ['farm', farmId] });
      void qc.invalidateQueries({ queryKey: ['twin', farmId] });
    },
  });
}
