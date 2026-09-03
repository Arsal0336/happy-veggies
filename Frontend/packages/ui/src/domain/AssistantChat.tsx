import { useState, useRef, useEffect } from 'react';
import type { AssistantMessage } from '@hv/api-types';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import { Input } from '../primitives/Input';
import { Spinner } from '../primitives/Spinner';

export interface AssistantChatProps {
  messages: AssistantMessage[];
  onSend: (text: string) => void;
  isSending?: boolean;
  className?: string;
}

export function AssistantChat({ messages, onSend, isSending = false, className = '' }: AssistantChatProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <Card padding="none" className={`flex flex-col h-full ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-[var(--hv-radius-lg)] px-4 py-2 text-[var(--hv-text-sm)] ${
                  isUser
                    ? 'bg-[var(--hv-color-primary-600)] text-white'
                    : 'bg-white border border-[var(--hv-color-neutral-200)]'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.citations.map((cite, i) => (
                      <a
                        key={i}
                        href={cite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--hv-text-xs)] text-[var(--hv-color-primary-600)] underline"
                      >
                        [{i + 1}]
                      </a>
                    ))}
                  </div>
                )}
                {!isUser && msg.disclaimer && (
                  <p className="mt-1 text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-400)] italic">
                    {msg.disclaimer}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex justify-start">
            <Spinner size="sm" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--hv-color-neutral-200)] p-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message…"
          className="flex-1"
        />
        <Button
          variant="primary"
          size="md"
          disabled={!text.trim() || isSending}
          loading={isSending}
          onClick={handleSend}
        >
          Send
        </Button>
      </div>
    </Card>
  );
}
