import { farmerApi } from '../apiInstance';
import { fixtureThread } from '@hv/api-types';
import type { AssistantThread, PostMessageResponse } from '@hv/api-types';

const USE_FIXTURES = !import.meta.env.VITE_API_BASE_URL;

export const assistantService = {
  getThread: async (farmId: string): Promise<AssistantThread> => {
    if (USE_FIXTURES) return fixtureThread;
    return farmerApi.get<AssistantThread>(`/farms/${farmId}/assistant/thread`);
  },

  sendMessage: async (farmId: string, threadId: string, text: string): Promise<PostMessageResponse> => {
    if (USE_FIXTURES) {
      const base = fixtureThread.messages.find((m) => m.role === 'assistant');
      const msg = {
        id: `msg-${Date.now()}-a`,
        threadId,
        role: 'assistant' as const,
        content: base?.content ?? 'This is a fixture response.',
        citations: base?.citations,
        disclaimer: base?.disclaimer,
        createdAt: new Date().toISOString(),
      };
      await new Promise((r) => setTimeout(r, 600));
      return { message: msg, citations: msg.citations, disclaimer: msg.disclaimer };
    }
    return farmerApi.post<PostMessageResponse>(`/farms/${farmId}/assistant/threads/${threadId}/messages`, { text });
  },
};
