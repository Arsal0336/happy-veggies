import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistantService } from '../services/assistantService';

export function useThread(farmId: string | undefined) {
  return useQuery({
    queryKey: ['assistant-thread', farmId],
    queryFn: () => assistantService.getOrCreateThread(farmId!),
    enabled: !!farmId,
  });
}

export function usePostAssistantMessage(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, text }: { threadId: string; text: string }) =>
      assistantService.postMessage(farmId, threadId, text),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['assistant-thread', farmId] });
    },
  });
}
