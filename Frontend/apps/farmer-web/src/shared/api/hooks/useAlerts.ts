import { useQuery } from '@tanstack/react-query';
import { alertService } from '../services/alertService';

export const useAlerts = () =>
  useQuery({ queryKey: ['alerts'], queryFn: alertService.listAlerts });
