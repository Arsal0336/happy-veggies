import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AssistantChat } from '@hv/ui';
import { fixtureThread } from '@hv/api-types';

describe('AssistantChat', () => {
  const messages = fixtureThread.messages;

  it('renders user and assistant messages', () => {
    render(<AssistantChat messages={messages} onSend={vi.fn()} />);
    expect(screen.getByText(/protect my tomatoes/)).toBeInTheDocument();
    expect(screen.getByText(/Basil intercropping/)).toBeInTheDocument();
  });

  it('calls onSend with trimmed text', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<AssistantChat messages={messages} onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type a message…');
    await user.type(input, 'Hello world');
    await user.click(screen.getByText('Send'));

    expect(onSend).toHaveBeenCalledWith('Hello world');
  });

  it('does not send empty messages', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<AssistantChat messages={messages} onSend={onSend} />);

    await user.click(screen.getByText('Send'));
    expect(onSend).not.toHaveBeenCalled();
  });
});
