import { useQuery } from '@tanstack/react-query';
import { farmService } from '../services/farmService';

export const useFarms = () =>
  useQuery({ queryKey: ['farms'], queryFn: farmService.listFarms });

export const useFarm = (farmId: string) =>
  useQuery({ queryKey: ['farm', farmId], queryFn: () => farmService.getFarm(farmId), enabled: !!farmId });

export const useAreas = (farmId: string) =>
  useQuery({ queryKey: ['areas', farmId], queryFn: () => farmService.listAreas(farmId), enabled: !!farmId });

export const useZones = (farmId: string) =>
  useQuery({ queryKey: ['zones', farmId], queryFn: () => farmService.listZones(farmId), enabled: !!farmId });
