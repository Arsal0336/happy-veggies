import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hv-green-score-meter',
  imports: [TranslatePipe],
  template: `
    <div class="rounded-hv-lg border border-[var(--hv-color-border)] bg-surface p-5 text-center">
      <p class="text-sm text-muted">{{ 'green.score' | translate }}</p>
      <p class="font-display text-5xl font-semibold text-primary-700">{{ displayScore() }}</p>
      <div class="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-[var(--hv-color-neutral-100)]">
        <div class="h-full rounded-full bg-primary-500 transition-all" [style.width.%]="pct()"></div>
      </div>
      <p class="mt-3 text-xs text-muted">{{ 'green.disclaimer' | translate }}</p>
    </div>
  `,
})
export class GreenScoreMeter {
  readonly score = input<number | null>(null);
  readonly max = input(100);

  readonly displayScore = computed(() => (this.score() == null ? '—' : Math.round(this.score()!)));
  readonly pct = computed(() => {
    if (this.score() == null || this.max() <= 0) return 0;
    return Math.min(100, Math.max(0, (this.score()! / this.max()) * 100));
  });
}
