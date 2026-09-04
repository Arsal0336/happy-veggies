import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AssistantChat, Button, ErrorState, LoadingState, Page, PageHeader } from '@hv/ui';
import { usePostAssistantMessage, useThread } from '../../shared/api/hooks';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

const FALLBACK_DISCLAIMER =
  'AI-generated. Not professional agricultural advice.';

const CITATION_KEYS: Record<string, string> = {
  weather_data: 'assistant.citations.weather',
  soil_data: 'assistant.citations.soil',
  growth_stage: 'assistant.citations.growthStage',
  protected_area: 'assistant.citations.protectedArea',
  compatibility_table: 'assistant.citations.compatibility',
};

function citationLabel(raw: string, t: (key: string, opts?: { defaultValue?: string }) => string) {
  const key = CITATION_KEYS[raw];
  if (key) return t(key, { defaultValue: humanizeCitation(raw) });
  return humanizeCitation(raw);
}

function humanizeCitation(raw: string) {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AssistantPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: thread, isLoading, error, refetch } = useThread(farmId);
  const postMessage = usePostAssistantMessage(farmId);
  const { notifyError } = useNotifications();

  if (isLoading) return <LoadingState label={t('common.loading')} />;
  if (error || !thread) {
    return (
      <ErrorState
        title={t('common.error')}
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  const messages =
    thread.messages?.map((m) => ({
      id: m.id,
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
      citations: m.citations?.map((c) => ({
        id: c,
        label: citationLabel(c, t),
      })),
    })) ?? [];

  const lastDisclaimer =
    [...(thread.messages ?? [])]
      .reverse()
      .find((m) => m.role === 'assistant' && m.disclaimer)?.disclaimer ??
    t('assistant.disclaimer', { defaultValue: FALLBACK_DISCLAIMER });

  return (
    <Page className="flex min-h-0 flex-1 flex-col gap-3">
      <PageHeader
        title={t('assistant.title')}
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
            {t('common.back')}
          </Button>
        }
      />
      <AssistantChat
        className="min-h-0 w-full flex-1"
        messages={messages}
        loading={postMessage.isPending}
        disclaimer={lastDisclaimer}
        placeholder={t('assistant.placeholder')}
        emptyLabel={t('assistant.emptyPrompt', {
          defaultValue: 'Ask about irrigation, soil, pests, or your crop plan.',
        })}
        thinkingLabel={t('assistant.thinking', { defaultValue: 'Thinking…' })}
        sendLabel={t('assistant.send')}
        onSend={(text) => {
          postMessage.mutate(
            { threadId: thread.id, text },
            {
              onError: (err) =>
                notifyError(err, () => {
                  postMessage.mutate({ threadId: thread.id, text });
                }),
            },
          );
        }}
      />
    </Page>
  );
}
