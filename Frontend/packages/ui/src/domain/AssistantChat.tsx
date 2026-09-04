import { useState, type FormEvent } from 'react';
import { Alert } from '../primitives/Alert';
import { Button } from '../primitives/Button';
import { Input } from '../primitives/Input';
import { cn } from '../utils/cn';

export type ChatRole = 'user' | 'assistant';

export type ChatCitation = {
  id?: string;
  label: string;
  href?: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  citations?: ChatCitation[];
};

export type AssistantChatProps = {
  messages: ChatMessage[];
  onSend: (content: string) => void;
  loading?: boolean;
  error?: string;
  disclaimer?: string;
  onRetry?: () => void;
  className?: string;
  placeholder?: string;
};

const DEFAULT_DISCLAIMER =
  'AI suggestions are advisory. Always verify with local agronomic guidance before acting.';

export function AssistantChat({
  messages,
  onSend,
  loading = false,
  error,
  disclaimer = DEFAULT_DISCLAIMER,
  onRetry,
  className,
  placeholder = 'Ask about your farm…',
}: AssistantChatProps) {
  const [draft, setDraft] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || loading) return;
    onSend(text);
    setDraft('');
  };

  return (
    <div className={cn('hv-assistant', className)}>
      <div className="hv-assistant__messages" role="log" aria-live="polite" aria-relevant="additions">
        {messages.length === 0 && !loading && (
          <p style={{ margin: 0, color: 'var(--hv-color-text-muted)', fontSize: 'var(--hv-text-sm)' }}>
            Start a conversation with the farm assistant.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn('hv-assistant__bubble', `hv-assistant__bubble--${m.role}`)}
          >
            <div>{m.content}</div>
            {m.citations && m.citations.length > 0 && (
              <ul className="hv-assistant__citations">
                {m.citations.map((c, i) => (
                  <li key={c.id ?? `${m.id}-c-${i}`}>
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noreferrer">
                        {c.label}
                      </a>
                    ) : (
                      c.label
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {loading && (
          <div className="hv-assistant__bubble hv-assistant__bubble--assistant" aria-busy="true">
            Thinking…
          </div>
        )}
      </div>

      {error && (
        <Alert variant="error" title="Assistant error">
          {error}
          {onRetry && (
            <div style={{ marginTop: 'var(--hv-space-2)' }}>
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Retry
              </Button>
            </div>
          )}
        </Alert>
      )}

      <form className="hv-assistant__form" onSubmit={submit}>
        <Input
          className="flex-1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          aria-label="Message"
        />
        <Button type="submit" loading={loading} disabled={!draft.trim()}>
          Send
        </Button>
      </form>

      <p className="hv-assistant__disclaimer">{disclaimer}</p>
    </div>
  );
}
