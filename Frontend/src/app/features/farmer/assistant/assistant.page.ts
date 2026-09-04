import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvButton } from '../../../shared/ui/hv-button';
import { AssistantApiService } from '../../../core/api/assistant.service';
import { AssistantChat, ChatMessage } from '../../../shared/ui/assistant-chat';
import { ToastService } from '../../../shared/ui/toast.service';

const CITATION_KEYS: Record<string, string> = {
  weather_data: 'assistant.citations.weather',
  soil_data: 'assistant.citations.soil',
  growth_stage: 'assistant.citations.growthStage',
  protected_area: 'assistant.citations.protectedArea',
  compatibility_table: 'assistant.citations.compatibility',
};

@Component({
  selector: 'app-assistant-page',
  imports: [
    RouterLink,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvButton,
    AssistantChat,
  ],
  template: `
    <div class="hv-page flex min-h-[calc(100dvh-6.5rem)] flex-col gap-3">
      <hv-page-header titleKey="assistant.title" subtitleKey="assistant.subtitle">
        <a [routerLink]="['/farms', farmId]">
          <hv-button variant="ghost" labelKey="common.back" />
        </a>
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton [lines]="6" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        <hv-assistant-chat
          class="min-h-0 flex-1"
          [messages]="messages()"
          [sending]="sending()"
          [disclaimer]="disclaimer()"
          [followUps]="followUps()"
          (send)="onSend($event)"
        />
      }
    </div>
  `,
})
export class AssistantPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AssistantApiService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  threadId = '';
  readonly messages = signal<ChatMessage[]>([]);
  readonly followUps = signal<string[]>([]);
  readonly disclaimer = signal<string | null>(null);
  readonly sending = signal(false);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  async onSend(text: string): Promise<void> {
    if (!this.threadId || this.sending()) return;
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: text,
    };
    this.messages.update((list) => [...list, optimistic]);
    this.followUps.set([]);
    this.sending.set(true);
    try {
      const result: any = await firstValueFrom(
        this.api.postMessage(this.farmId, this.threadId, text),
      );
      const fromReply = this.normalizeFollowUps(
        result?.followUpQuestions ?? result?.FollowUpQuestions ?? result?.message?.followUpQuestions,
      );
      await this.refreshMessages();
      if (fromReply.length) {
        this.followUps.set(fromReply);
      }
    } catch (e: any) {
      this.messages.update((list) => list.filter((m) => m.id !== optimistic.id));
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.sending.set(false);
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let threads: any = await firstValueFrom(this.api.listThreads(this.farmId));
      if (!Array.isArray(threads)) threads = [];
      if (!threads.length) {
        const created: any = await firstValueFrom(this.api.createThread(this.farmId, { title: null }));
        threads = [created];
      }
      this.threadId = threads[0].id;
      await this.refreshMessages();
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  private async refreshMessages(): Promise<void> {
    const detail: any = await firstValueFrom(this.api.getThread(this.farmId, this.threadId));
    const raw = detail?.messages || detail?.Messages || [];
    this.messages.set(raw.map((m: any) => this.mapMessage(m)));
    const lastAssistant = [...raw].reverse().find((m: any) => {
      const role = String(m.role ?? m.Role ?? '').toLowerCase();
      return role === 'assistant' || role === '1';
    });
    this.disclaimer.set(
      lastAssistant?.disclaimer || this.t.instant('assistant.disclaimer'),
    );
    this.followUps.set(
      this.extractFollowUps(lastAssistant?.citationsJson ?? lastAssistant?.CitationsJson),
    );
  }

  private mapMessage(m: any): ChatMessage {
    const meta = this.parseMeta(m.citationsJson ?? m.citations ?? m.CitationsJson);
    return {
      id: m.id ?? m.Id,
      role: String(m.role ?? m.Role).toLowerCase() === 'assistant' || m.role === 1 ? 'assistant' : 'user',
      content: m.content || m.Content || m.text || '',
      disclaimer: m.disclaimer,
      citations: meta.citations.map((c) => ({
        id: c,
        label: this.citationLabel(c),
      })),
    };
  }

  private extractFollowUps(value: unknown): string[] {
    return this.parseMeta(value).followUps;
  }

  private normalizeFollowUps(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 4);
  }

  private parseMeta(value: unknown): { citations: string[]; followUps: string[] } {
    if (Array.isArray(value)) {
      return { citations: value.map(String), followUps: [] };
    }
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return { citations: parsed.map(String), followUps: [] };
        }
        if (parsed && typeof parsed === 'object') {
          const citations = Array.isArray(parsed.citations) ? parsed.citations.map(String) : [];
          const followUps = this.normalizeFollowUps(parsed.followUps ?? parsed.FollowUps);
          return { citations, followUps };
        }
      } catch {
        return { citations: [], followUps: [] };
      }
    }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const citations = Array.isArray(obj['citations']) ? (obj['citations'] as unknown[]).map(String) : [];
      const followUps = this.normalizeFollowUps(obj['followUps'] ?? obj['FollowUps']);
      return { citations, followUps };
    }
    return { citations: [], followUps: [] };
  }

  private citationLabel(raw: string): string {
    const key = CITATION_KEYS[raw];
    if (key) return this.t.instant(key);
    return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
