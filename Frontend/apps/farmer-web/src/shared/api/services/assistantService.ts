import type {
  AssistantMessage,
  AssistantThread,
  PostAssistantMessageResponse,
} from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import {
  appendAssistantMessage,
  delay,
  fixtureThreads,
  nextId,
} from '../fixtures';

type ThreadListItem = {
  id: string;
  title?: string | null;
  createdAt: string;
  lastMessageAt?: string | null;
};

type ThreadDetailResponse = {
  id: string;
  title?: string | null;
  createdAt: string;
  messages?: Array<{
    id: string;
    role: string;
    content: string;
    citationsJson?: string | null;
    createdAt: string;
  }>;
};

type PostMessageLiveResponse = {
  message: {
    id: string;
    role: string;
    content: string;
    citationsJson?: string | null;
    createdAt: string;
  };
  disclaimer?: string;
};

function parseCitations(citationsJson?: string | null): string[] | undefined {
  if (!citationsJson) return undefined;
  try {
    const parsed = JSON.parse(citationsJson) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    /* ignore */
  }
  return undefined;
}

function mapMessage(
  threadId: string,
  m: {
    id: string;
    role: string;
    content: string;
    citationsJson?: string | null;
    createdAt: string;
  },
): AssistantMessage {
  return {
    id: m.id,
    threadId,
    role: m.role === 'assistant' || m.role === 'Assistant' ? 'assistant' : 'user',
    content: m.content,
    citations: parseCitations(m.citationsJson),
    citationsJson: m.citationsJson,
    createdAt: m.createdAt,
  };
}

export const assistantService = {
  async getOrCreateThread(farmId: string): Promise<AssistantThread> {
    if (useFixtures()) {
      await delay();
      const existing = fixtureThreads.find((t) => t.farmId === farmId);
      if (existing) return existing;
      const thread: AssistantThread = {
        id: nextId('thread'),
        farmId,
        createdAt: new Date().toISOString(),
        messages: [],
      };
      fixtureThreads.push(thread);
      return thread;
    }

    const threads = await farmerApi.get<ThreadListItem[]>(
      `/farms/${farmId}/assistant/threads`,
    );
    let threadId = threads?.[0]?.id;

    if (!threadId) {
      const created = await farmerApi.post<{
        id: string;
        title?: string | null;
        createdAt: string;
      }>(`/farms/${farmId}/assistant/threads`, { title: null });
      threadId = created.id;
    }

    const detail = await farmerApi.get<ThreadDetailResponse>(
      `/farms/${farmId}/assistant/threads/${threadId}`,
    );

    return {
      id: detail.id,
      farmId,
      title: detail.title,
      createdAt: detail.createdAt,
      messages: (detail.messages ?? []).map((m) => mapMessage(detail.id, m)),
    };
  },

  async postMessage(
    farmId: string,
    threadId: string,
    text: string,
  ): Promise<PostAssistantMessageResponse> {
    if (useFixtures()) {
      await delay(200);
      const { reply } = appendAssistantMessage(threadId, text);
      return {
        message: reply,
        citations: reply.citations,
        disclaimer: reply.disclaimer,
      };
    }

    const res = await farmerApi.post<PostMessageLiveResponse>(
      `/farms/${farmId}/assistant/threads/${threadId}/messages`,
      { text },
    );

    const message = mapMessage(threadId, res.message);
    return {
      message: {
        ...message,
        disclaimer: res.disclaimer,
      },
      citations: message.citations,
      disclaimer: res.disclaimer,
    };
  },
};
