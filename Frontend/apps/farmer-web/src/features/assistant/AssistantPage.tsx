import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Spinner, ErrorState, AssistantChat } from '@hv/ui';
import { useThread } from '../../shared/api/hooks';
import { assistantService } from '../../shared/api/services';
import type { AssistantMessage } from '@hv/api-types';
import { fixtureThread } from '@hv/api-types';

interface ThreadSummary {
  id: string;
  label: string;
  createdAt: string;
}

export function AssistantPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<AssistantMessage[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const [threadList, setThreadList] = useState<ThreadSummary[]>([
    { id: fixtureThread.id, label: 'Aphid protection', createdAt: fixtureThread.createdAt },
    { id: 'thread-002', label: 'Irrigation schedule', createdAt: '2025-06-10T08:00:00Z' },
  ]);

  if (!farmId) return <ErrorState error="No farm selected" onRetry={() => navigate('/farms')} />;

  const { data: thread, isLoading, error } = useThread(farmId);

  const currentThreadId = activeThreadId ?? thread?.id;
  const isActiveThread = !activeThreadId || activeThreadId === thread?.id;

  const allMessages: AssistantMessage[] = isActiveThread
    ? [...(thread?.messages ?? []), ...localMessages]
    : [];

  const handleSend = async (text: string) => {
    if (isSending || !currentThreadId) return;

    const now = new Date().toISOString();
    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      threadId: currentThreadId,
      role: 'user',
      content: text,
      createdAt: now,
    };

    setLocalMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const response = await assistantService.sendMessage(farmId, currentThreadId, text);
      setLocalMessages((prev) => [...prev, response.message]);
    } finally {
      setIsSending(false);
    }
  };

  const handleNewThread = () => {
    const newId = `thread-${Date.now()}`;
    setThreadList((prev) => [
      { id: newId, label: 'New conversation', createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setActiveThreadId(newId);
    setLocalMessages([]);
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setLocalMessages([]);
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (error) return <ErrorState error={error instanceof Error ? error : String(error)} />;

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <h1 className="text-[var(--hv-text-lg)] font-bold">{t('assistant.title')}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(`/farms/${farmId}`)} className="self-start sm:self-auto">
          {t('common.back')}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        <div className="w-full md:w-56 shrink-0 flex flex-col gap-2 max-h-40 md:max-h-none">
          <Button variant="primary" size="sm" onClick={handleNewThread} className="w-full">
            + {t('assistant.newThread', 'New thread')}
          </Button>
          <div className="flex flex-col gap-1 overflow-y-auto min-h-0">
            {threadList.map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => handleSelectThread(th.id)}
                className={`text-start rounded-[var(--hv-radius-md)] px-3 py-2 min-h-11 text-[var(--hv-text-sm)] transition-colors ${
                  currentThreadId === th.id
                    ? 'bg-[var(--hv-color-primary-50)] font-medium'
                    : 'hover:bg-[var(--hv-color-neutral-100)]'
                }`}
              >
                <p className="truncate">{th.label}</p>
                <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-400)]">
                  {new Date(th.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <AssistantChat
            messages={allMessages}
            onSend={handleSend}
            isSending={isSending}
            className="flex-1 min-h-[16rem]"
          />

          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-400)] text-center mt-2 shrink-0">
            {t('assistant.disclaimer', 'AI-generated guidance. Verify with local extension services.')}
          </p>
        </div>
      </div>
    </div>
  );
}
