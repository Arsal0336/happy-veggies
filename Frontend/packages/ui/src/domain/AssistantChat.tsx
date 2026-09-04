import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
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
  emptyLabel?: string;
  thinkingLabel?: string;
  sendLabel?: string;
};

const DEFAULT_DISCLAIMER =
  'AI suggestions are advisory. Always verify with local agronomic guidance before acting.';

const DISCLAIMER_LINE =
  /(?:⚠️\s*)?(?:this is\s+)?ai[- ]generated|not professional agricultural|advisory(?:\s+content)?(?:\s+only)?/i;

function splitBodyAndDisclaimer(content: string): { body: string; inlineDisclaimer?: string } {
  const parts = content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return { body: '' };

  const last = parts[parts.length - 1]!;
  if (parts.length > 1 && DISCLAIMER_LINE.test(last)) {
    return { body: parts.slice(0, -1).join('\n\n'), inlineDisclaimer: last };
  }
  return { body: parts.join('\n\n') };
}

function formatMessageBody(text: string): ReactNode {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return paragraphs.map((para, i) => {
    const lines = para.split('\n');
    return (
      <p key={i} className="hv-assistant__para">
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </p>
    );
  });
}

export function AssistantChat({
  messages,
  onSend,
  loading = false,
  error,
  disclaimer = DEFAULT_DISCLAIMER,
  onRetry,
  className,
  placeholder = 'Ask about your farm…',
  emptyLabel = 'Start a conversation with the farm assistant.',
  thinkingLabel = 'Thinking…',
  sendLabel = 'Send',
}: AssistantChatProps) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  const scrollToEnd = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = listRef.current;
    if (!el) return;
    const top = el.scrollHeight;
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({ top, behavior });
    } else {
      el.scrollTop = top;
    }
  }, []);

  const lastMessageId = messages[messages.length - 1]?.id;
  const messageCount = messages.length;

  useLayoutEffect(() => {
    if (!stickToBottomRef.current) return;
    scrollToEnd('auto');
  }, [messageCount, lastMessageId, loading, scrollToEnd]);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    const frame = requestAnimationFrame(() => scrollToEnd('smooth'));
    const timeout = window.setTimeout(() => scrollToEnd('auto'), 80);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [messageCount, lastMessageId, loading, scrollToEnd]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const keepPinned = () => {
      if (stickToBottomRef.current) scrollToEnd('auto');
    };

    const onScroll = () => {
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottomRef.current = remaining < 80;
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(keepPinned);
    ro.observe(el);
    if (endRef.current) ro.observe(endRef.current);

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [scrollToEnd]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || loading) return;
    stickToBottomRef.current = true;
    onSend(text);
    setDraft('');
    requestAnimationFrame(() => scrollToEnd('smooth'));
  };

  return (
    <div className={cn('hv-assistant hv-assistant--fill', className)}>
      <div
        ref={listRef}
        className="hv-assistant__messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 && !loading && (
          <p className="hv-assistant__empty">{emptyLabel}</p>
        )}
        {messages.map((m) => {
          const { body, inlineDisclaimer } = splitBodyAndDisclaimer(m.content);
          return (
            <div
              key={m.id}
              className={cn('hv-assistant__bubble', `hv-assistant__bubble--${m.role}`)}
            >
              <div className="hv-assistant__body">{formatMessageBody(body)}</div>
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
              {m.role === 'assistant' && inlineDisclaimer ? (
                <p className="hv-assistant__bubble-disclaimer">{inlineDisclaimer}</p>
              ) : null}
            </div>
          );
        })}
        {loading && (
          <div className="hv-assistant__bubble hv-assistant__bubble--assistant" aria-busy="true">
            {thinkingLabel}
          </div>
        )}
        <div ref={endRef} className="hv-assistant__scroll-anchor" aria-hidden />
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
          {sendLabel}
        </Button>
      </form>

      <p className="hv-assistant__disclaimer">{disclaimer}</p>
    </div>
  );
}
