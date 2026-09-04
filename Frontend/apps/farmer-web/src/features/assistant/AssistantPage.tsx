import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AssistantChat, Button, ErrorState, LoadingState, Page, PageHeader } from '@hv/ui';
import { usePostAssistantMessage, useThread } from '../../shared/api/hooks';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

const FALLBACK_DISCLAIMER =
  'AI-generated. Not professional agricultural advice.';

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
      citations: m.citations?.map((c) => ({ label: c })),
    })) ?? [];

  const lastDisclaimer =
    [...(thread.messages ?? [])]
      .reverse()
      .find((m) => m.role === 'assistant' && m.disclaimer)?.disclaimer ??
    t('assistant.disclaimer', { defaultValue: FALLBACK_DISCLAIMER });

  return (
    <Page>
      <PageHeader
        title={t('assistant.title')}
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
            {t('common.back')}
          </Button>
        }
      />
      <AssistantChat
        messages={messages}
        loading={postMessage.isPending}
        disclaimer={lastDisclaimer}
        placeholder={t('assistant.placeholder')}
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
      <p className="hv-muted hv-hint hv-section">{lastDisclaimer}</p>
    </Page>
  );
}
