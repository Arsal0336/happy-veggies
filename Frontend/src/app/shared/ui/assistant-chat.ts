import {
  AfterViewChecked,
  Component,
  ElementRef,
  ViewChild,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HvButton } from './hv-button';
import { looksRtl, renderAssistantMarkdown } from './assistant-markdown';

export type ChatCitation = {
  id?: string;
  label: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | string;
  content: string;
  citations?: ChatCitation[];
  disclaimer?: string;
};

@Component({
  selector: 'hv-assistant-chat',
  imports: [FormsModule, TranslatePipe, HvButton],
  styles: `
    :host { display: flex; flex: 1; min-height: 0; flex-direction: column; }
    .chat {
      display: flex;
      flex: 1;
      min-height: 0;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--hv-color-border);
      border-radius: var(--hv-radius-2xl);
      background: var(--hv-color-surface);
      box-shadow: var(--hv-shadow-md);
    }
    .chat__messages {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background:
        radial-gradient(ellipse at top right, rgb(31 92 50 / 0.06), transparent 45%),
        var(--hv-color-surface);
      scroll-behavior: smooth;
    }
    .chat__empty {
      margin: auto;
      max-width: 18rem;
      text-align: center;
      color: var(--hv-color-text-muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .bubble {
      max-width: min(96%, 36rem);
      border-radius: 1rem;
      padding: 0.75rem 0.9rem;
      font-size: 0.9rem;
      line-height: 1.55;
      position: relative;
      animation: hv-rise 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .bubble--user {
      margin-inline-start: auto;
      background: var(--hv-color-primary-600);
      color: #fff;
      border-bottom-right-radius: 0.35rem;
      white-space: pre-wrap;
    }
    .bubble--assistant {
      margin-inline-end: auto;
      background: var(--hv-color-neutral-50);
      border: 1px solid var(--hv-color-border);
      border-bottom-left-radius: 0.35rem;
      color: var(--hv-color-text);
    }
    .bubble__toolbar {
      display: flex;
      justify-content: flex-end;
      margin: 0 0 0.35rem;
    }
    .bubble__copy {
      border: 1px solid var(--hv-color-border);
      background: #fff;
      border-radius: 999px;
      padding: 0.15rem 0.55rem;
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--hv-color-primary-800);
      cursor: pointer;
    }
    .bubble__copy:hover { background: var(--hv-color-primary-50); }
    .bubble__body :where(p, ul, ol, pre, table, blockquote, h1, h2, h3) {
      margin: 0 0 0.65rem;
    }
    .bubble__body :where(p, ul, ol, pre, table, blockquote, h1, h2, h3):last-child {
      margin-bottom: 0;
    }
    .bubble__body .md-h1 { font-size: 1.15rem; font-weight: 700; }
    .bubble__body .md-h2 { font-size: 1.05rem; font-weight: 700; }
    .bubble__body .md-h3 { font-size: 0.98rem; font-weight: 700; }
    .bubble__body .md-ul,
    .bubble__body .md-ol { padding-inline-start: 1.2rem; }
    .bubble__body .md-ul { list-style: disc; }
    .bubble__body .md-ol { list-style: decimal; }
    .bubble__body .md-quote {
      border-inline-start: 3px solid var(--hv-color-primary-300);
      padding-inline-start: 0.65rem;
      color: var(--hv-color-text-muted);
      font-style: italic;
    }
    .bubble__body .md-pre {
      overflow-x: auto;
      border-radius: 0.65rem;
      background: #0f1a14;
      color: #e8f5ee;
      padding: 0.7rem 0.8rem;
      font-size: 0.78rem;
      line-height: 1.45;
    }
    .bubble__body .md-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.82em;
      background: rgb(31 92 50 / 0.08);
      padding: 0.05rem 0.3rem;
      border-radius: 0.3rem;
    }
    .bubble__body .md-pre .md-code,
    .bubble__body .md-pre code {
      background: transparent;
      padding: 0;
      color: inherit;
      font-size: inherit;
    }
    .bubble__body .md-table-wrap { overflow-x: auto; }
    .bubble__body .md-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
    }
    .bubble__body .md-table th,
    .bubble__body .md-table td {
      border: 1px solid var(--hv-color-border);
      padding: 0.4rem 0.55rem;
      text-align: start;
      vertical-align: top;
    }
    .bubble__body .md-table th {
      background: var(--hv-color-primary-50);
      font-weight: 700;
    }
    .bubble__body .md-hr {
      border: 0;
      border-top: 1px solid var(--hv-color-border);
      margin: 0.75rem 0;
    }
    .bubble__body a {
      color: var(--hv-color-primary-700);
      text-decoration: underline;
    }
    .bubble__citations {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin: 0.65rem 0 0;
      padding: 0;
      list-style: none;
    }
    .bubble__citation {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      background: var(--hv-color-primary-50);
      color: var(--hv-color-primary-800);
      border: 1px solid var(--hv-color-primary-100);
    }
    .bubble__disclaimer {
      margin: 0.55rem 0 0;
      font-size: 0.7rem;
      color: var(--hv-color-text-muted);
      font-style: italic;
    }
    .chat__form {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem;
      border-top: 1px solid var(--hv-color-border);
      background: var(--hv-color-surface);
    }
    .chat__input {
      flex: 1;
      min-width: 0;
      border: 1px solid var(--hv-color-border);
      border-radius: var(--hv-radius-lg);
      padding: 0.7rem 0.85rem;
      font: inherit;
      background: var(--hv-color-neutral-50);
    }
    .chat__input:focus {
      outline: 2px solid var(--hv-color-focus);
      outline-offset: 1px;
      background: #fff;
    }
    .chat__disclaimer {
      margin: 0;
      padding: 0 0.85rem 0.75rem;
      font-size: 0.7rem;
      color: var(--hv-color-text-muted);
    }
    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      padding: 0 0.85rem 0.65rem;
    }
    .suggestions button {
      border: 1px solid var(--hv-color-border);
      background: #fff;
      border-radius: 999px;
      padding: 0.35rem 0.7rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--hv-color-primary-800);
      cursor: pointer;
    }
    .suggestions button:hover { background: var(--hv-color-primary-50); }
  `,
  template: `
    <div class="chat">
      <div #list class="chat__messages" role="log" aria-live="polite">
        @if (!messages().length && !sending()) {
          <p class="chat__empty">{{ emptyLabel() || ('assistant.emptyPrompt' | translate) }}</p>
        }
        @for (m of messages(); track m.id) {
          <div
            class="bubble"
            [class.bubble--user]="m.role === 'user'"
            [class.bubble--assistant]="m.role !== 'user'"
            [attr.dir]="bubbleDir(m)"
          >
            @if (m.role !== 'user') {
              <div class="bubble__toolbar">
                <button
                  type="button"
                  class="bubble__copy"
                  (click)="copyMessage(m)"
                >
                  {{ copiedId() === m.id ? ('assistant.copied' | translate) : ('assistant.copy' | translate) }}
                </button>
              </div>
              <div class="bubble__body" [innerHTML]="assistantHtml(m.content)"></div>
            } @else {
              {{ m.content }}
            }
            @if (m.citations?.length) {
              <ul class="bubble__citations">
                @for (c of m.citations!; track c.id || c.label) {
                  <li class="bubble__citation">{{ c.label }}</li>
                }
              </ul>
            }
            @if (m.role !== 'user' && inlineDisclaimer(m.content); as d) {
              <p class="bubble__disclaimer">{{ d }}</p>
            }
          </div>
        }
        @if (sending()) {
          <div class="bubble bubble--assistant" aria-busy="true">
            {{ 'assistant.thinking' | translate }}
          </div>
        }
        <div #end aria-hidden="true"></div>
      </div>

      @if (visibleSuggestions().length && !sending()) {
        <div class="suggestions" role="group" [attr.aria-label]="'assistant.followUps' | translate">
          @for (q of visibleSuggestions(); track q) {
            <button type="button" (click)="useSuggestion(q)">{{ displaySuggestion(q) }}</button>
          }
        </div>
      }

      <form class="chat__form" (ngSubmit)="onSend()">
        <input
          class="chat__input"
          [(ngModel)]="draftModel"
          name="assistantDraft"
          [disabled]="sending()"
          [placeholder]="'assistant.placeholder' | translate"
          autocomplete="off"
        />
        <hv-button
          type="submit"
          labelKey="assistant.send"
          [loading]="sending()"
          [disabled]="!draftModel.trim()"
        />
      </form>
      <p class="chat__disclaimer">{{ disclaimer() || ('assistant.disclaimer' | translate) }}</p>
    </div>
  `,
})
export class AssistantChat implements AfterViewChecked {
  private readonly t = inject(TranslateService);
  private readonly sanitizer = inject(DomSanitizer);
  @ViewChild('list') listRef?: ElementRef<HTMLDivElement>;
  @ViewChild('end') endRef?: ElementRef<HTMLDivElement>;

  readonly messages = input<ChatMessage[]>([]);
  readonly sending = input(false);
  readonly disclaimer = input<string | null>(null);
  readonly emptyLabel = input<string | null>(null);
  readonly followUps = input<string[]>([]);
  readonly send = output<string>();

  draftModel = '';
  readonly copiedId = signal<string | null>(null);
  private stickToBottom = true;
  private lastCount = 0;
  private htmlCache = new Map<string, SafeHtml>();

  readonly starterPrompts = [
    'assistant.prompts.irrigate',
    'assistant.prompts.heat',
    'assistant.prompts.neighbours',
  ];

  visibleSuggestions(): string[] {
    const dynamic = this.followUps().filter((q) => !!q?.trim());
    if (dynamic.length) return dynamic.slice(0, 4);
    if (!this.messages().length) return this.starterPrompts;
    return [];
  }

  displaySuggestion(q: string): string {
    return q.startsWith('assistant.') ? this.t.instant(q) : q;
  }

  bubbleDir(m: ChatMessage): 'rtl' | 'ltr' | null {
    return looksRtl(m.content) ? 'rtl' : null;
  }

  assistantHtml(content: string): SafeHtml {
    const { body } = this.split(content);
    const cached = this.htmlCache.get(body);
    if (cached) return cached;
    const html = renderAssistantMarkdown(body);
    const safe = this.sanitizer.bypassSecurityTrustHtml(html);
    this.htmlCache.set(body, safe);
    return safe;
  }

  async copyMessage(m: ChatMessage): Promise<void> {
    const { body } = this.split(m.content);
    try {
      await navigator.clipboard.writeText(body);
      this.copiedId.set(m.id);
      window.setTimeout(() => {
        if (this.copiedId() === m.id) this.copiedId.set(null);
      }, 1600);
    } catch {
      // ignore clipboard failures (permissions / insecure context)
    }
  }

  ngAfterViewChecked(): void {
    const count = this.messages().length + (this.sending() ? 1 : 0);
    if (count !== this.lastCount) {
      this.lastCount = count;
      this.scrollToEnd();
    }
  }

  inlineDisclaimer(content: string): string | null {
    return this.split(content).inlineDisclaimer || null;
  }

  useSuggestion(q: string): void {
    this.draftModel = this.displaySuggestion(q);
    this.onSend();
  }

  onSend(): void {
    const text = this.draftModel.trim();
    if (!text || this.sending()) return;
    this.stickToBottom = true;
    this.send.emit(text);
    this.draftModel = '';
    queueMicrotask(() => this.scrollToEnd());
  }

  private split(content: string): { body: string; inlineDisclaimer?: string } {
    const withoutFollowUps = content
      .replace(/<<<FOLLOW_UPS>>>[\s\S]*?<<<END_FOLLOW_UPS>>>/gi, '')
      .trim();
    const parts = withoutFollowUps
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) return { body: '' };
    const last = parts[parts.length - 1]!;
    const disclaimerRe =
      /(?:⚠️\s*)?(?:this is\s+)?ai[- ]generated|not professional agricultural|advisory(?:\s+content)?(?:\s+only)?|مصنوعی ذہانت|پیشہ ورانہ زرعی/i;
    if (parts.length > 1 && disclaimerRe.test(last)) {
      return { body: parts.slice(0, -1).join('\n\n'), inlineDisclaimer: last };
    }
    return { body: parts.join('\n\n') };
  }

  private scrollToEnd(): void {
    if (!this.stickToBottom) return;
    const el = this.listRef?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }
}
