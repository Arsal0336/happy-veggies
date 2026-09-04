import { Component, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HvCard } from './hv-card';
import { HvEmptyState } from './hv-empty-state';

type PlanContent = Record<string, unknown>;

@Component({
  selector: 'hv-plan-sections',
  imports: [TranslatePipe, HvCard, HvEmptyState],
  template: `
    @if (!plan()) {
      <hv-empty-state titleKey="plan.empty" descriptionKey="plan.emptyHint" />
    } @else {
      <div class="space-y-4">
        @if (farmSummary(); as summary) {
          <hv-card>
            <h3 class="mb-3 text-base font-semibold">{{ 'plan.stats.title' | translate }}</h3>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[28rem] text-start text-base">
                <tbody>
                  <tr class="border-b border-[var(--hv-color-border)]">
                    <th class="py-2.5 pe-4 font-medium text-muted">{{ 'plan.stats.name' | translate }}</th>
                    <td class="py-2.5 font-semibold">{{ dash(summary['name']) }}</td>
                  </tr>
                  <tr class="border-b border-[var(--hv-color-border)]">
                    <th class="py-2.5 pe-4 font-medium text-muted">{{ 'plan.stats.region' | translate }}</th>
                    <td class="py-2.5">{{ dash(summary['region']) }}</td>
                  </tr>
                  <tr class="border-b border-[var(--hv-color-border)]">
                    <th class="py-2.5 pe-4 font-medium text-muted">{{ 'plan.stats.totalAcres' | translate }}</th>
                    <td class="py-2.5">{{ num(summary['totalAcres']) }}</td>
                  </tr>
                  <tr class="border-b border-[var(--hv-color-border)]">
                    <th class="py-2.5 pe-4 font-medium text-muted">{{ 'plan.stats.areas' | translate }}</th>
                    <td class="py-2.5">{{ dash(summary['areaCount']) }}</td>
                  </tr>
                  <tr>
                    <th class="py-2.5 pe-4 font-medium text-muted">{{ 'plan.stats.zones' | translate }}</th>
                    <td class="py-2.5">{{ dash(summary['zoneCount']) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            @if (farmStatus(); as status) {
              <div class="mt-3 overflow-x-auto border-t border-[var(--hv-color-border)] pt-3">
                <table class="w-full min-w-[28rem] text-start text-sm">
                  <tbody>
                    <tr class="border-b border-[var(--hv-color-border)]">
                      <th class="py-2 pe-4 font-medium text-muted">{{ 'plan.stats.weather' | translate }}</th>
                      <td class="py-2">{{ weatherLine(status) }}</td>
                    </tr>
                    <tr class="border-b border-[var(--hv-color-border)]">
                      <th class="py-2 pe-4 font-medium text-muted">{{ 'plan.stats.water' | translate }}</th>
                      <td class="py-2">{{ waterLine(status) }}</td>
                    </tr>
                    <tr>
                      <th class="py-2 pe-4 font-medium text-muted">{{ 'plan.stats.soil' | translate }}</th>
                      <td class="py-2">{{ soilLine(status) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }
          </hv-card>
        }

        @if (yieldRows().length) {
          <hv-card>
            <h3 class="mb-3 text-base font-semibold">{{ 'plan.yieldTable.title' | translate }}</h3>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[52rem] text-start text-base">
                <thead class="border-b border-[var(--hv-color-border)] text-sm text-muted">
                  <tr>
                    <th class="py-2 pe-3 font-semibold">{{ 'plan.yieldTable.zone' | translate }}</th>
                    <th class="py-2 pe-3 font-semibold">{{ 'plan.yieldTable.crop' | translate }}</th>
                    <th class="py-2 pe-3 font-semibold">{{ 'plan.yieldTable.area' | translate }}</th>
                    <th class="py-2 pe-3 font-semibold">{{ 'plan.yieldTable.yield' | translate }}</th>
                    <th class="py-2 pe-3 font-semibold">{{ 'plan.yieldTable.unit' | translate }}</th>
                    <th class="py-2 pe-3 font-semibold">{{ 'plan.yieldTable.rate' | translate }}</th>
                    <th class="py-2 pe-3 font-semibold">{{ 'plan.yieldTable.gross' | translate }}</th>
                    <th class="py-2 font-semibold">{{ 'plan.yieldTable.confidence' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of yieldRows(); track rowKey(row, $index)) {
                    <tr class="border-b border-[var(--hv-color-border)] last:border-0">
                      <td class="py-2.5 pe-3 font-medium">{{ dash(row['zoneLabel']) }}</td>
                      <td class="py-2.5 pe-3">{{ dash(row['cropName'] ?? row['cropId']) }}</td>
                      <td class="py-2.5 pe-3">{{ num(row['areaAcres']) }}</td>
                      <td class="py-2.5 pe-3 font-semibold tabular-nums">
                        {{ num(row['estimatedYield'] ?? row['expectedYield']) }}
                      </td>
                      <td class="py-2.5 pe-3">{{ dash(row['unit'] ?? row['yieldUnit']) }}</td>
                      <td class="py-2.5 pe-3 tabular-nums">{{ money(row['ratePerUnit'], row['currency']) }}</td>
                      <td class="py-2.5 pe-3 font-semibold tabular-nums">
                        {{ money(row['referenceGrossValue'], row['currency']) }}
                      </td>
                      <td class="py-2.5">{{ dash(row['confidence']) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="mt-3 text-sm text-muted">{{ 'plan.yieldTable.disclaimer' | translate }}</p>
          </hv-card>
        }

        @if (warnings().length) {
          <hv-card>
            <h3 class="mb-3 text-base font-semibold">{{ 'plan.warnings.title' | translate }}</h3>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[28rem] text-start text-sm">
                <thead class="border-b border-[var(--hv-color-border)] text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th class="py-2 pe-3 font-semibold">{{ 'plan.warnings.zoneA' | translate }}</th>
                    <th class="py-2 pe-3 font-semibold">{{ 'plan.warnings.zoneB' | translate }}</th>
                    <th class="py-2 font-semibold">{{ 'plan.warnings.reason' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (w of warnings(); track $index) {
                    <tr class="border-b border-[var(--hv-color-border)] last:border-0">
                      <td class="py-2 pe-3">{{ dash(w['zoneA']) }}</td>
                      <td class="py-2 pe-3">{{ dash(w['zoneB']) }}</td>
                      <td class="py-2">{{ dash(w['reason']) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </hv-card>
        }

        @if (sections().length) {
          <div class="space-y-3">
            <h3 class="font-semibold">{{ 'plan.sections' | translate }}</h3>
            @for (section of sections(); track section.id) {
              <hv-card>
                <h4 class="mb-1 font-semibold">{{ section.title }}</h4>
                <p class="whitespace-pre-wrap text-sm text-[var(--hv-color-text)]">{{ section.body }}</p>
              </hv-card>
            }
          </div>
        }
      </div>
    }
  `,
})
export class PlanSections {
  private readonly t = inject(TranslateService);
  readonly plan = input<Record<string, unknown> | null>(null);

  private content(): PlanContent | null {
    const p = this.plan() as any;
    if (!p) return null;
    if (typeof p.contentJson === 'string' && p.contentJson.trim()) {
      try {
        return JSON.parse(p.contentJson) as PlanContent;
      } catch {
        /* fall through */
      }
    }
    if (p.contentJson && typeof p.contentJson === 'object') {
      return p.contentJson as PlanContent;
    }
    return p as PlanContent;
  }

  farmSummary(): PlanContent | null {
    const c = this.content();
    const s = c?.['farmSummary'];
    return s && typeof s === 'object' ? (s as PlanContent) : null;
  }

  farmStatus(): PlanContent | null {
    const c = this.content();
    const s = c?.['farmStatus'];
    return s && typeof s === 'object' ? (s as PlanContent) : null;
  }

  warnings(): PlanContent[] {
    const c = this.content();
    const list = c?.['compatibilityWarnings'];
    return Array.isArray(list) ? (list as PlanContent[]) : [];
  }

  yieldRows(): PlanContent[] {
    const c = this.content();
    const economics = Array.isArray(c?.['economicsRows']) ? (c!['economicsRows'] as PlanContent[]) : [];
    const yields = Array.isArray(c?.['yieldEstimates']) ? (c!['yieldEstimates'] as PlanContent[]) : [];

    if (economics.length && yields.length) {
      return yields.map((y, i) => {
        const match =
          economics.find((e) => String(e['zoneId']) === String(y['zoneId'])) ?? economics[i];
        return { ...y, ...match, estimatedYield: y['estimatedYield'] ?? match?.['expectedYield'], confidence: y['confidence'] };
      });
    }
    if (economics.length) return economics;
    return yields;
  }

  sections(): Array<{ id: string; title: string; body: string }> {
    const p = this.content();
    if (!p) return [];

    const fromArray = this.fromList(p['sections'] ?? p['planSections']);
    if (fromArray.length) return fromArray;

    const keys = ['overview', 'planting', 'irrigation', 'nutrition', 'risks', 'economics', 'water', 'recommendations'];
    return keys
      .filter((k) => p[k] != null)
      .map((k) => ({
        id: k,
        title: this.titleCase(k),
        body: this.stringifyBody(p[k]),
      }))
      .filter((s) => !!s.body);
  }

  dash(value: unknown): string {
    if (value == null || value === '') return '—';
    return String(value);
  }

  num(value: unknown): string {
    if (value == null || value === '') return '—';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  money(value: unknown, currency: unknown): string {
    if (value == null || value === '') return '—';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    const cur = currency ? String(currency) : 'PKR';
    return `${cur} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  weatherLine(status: PlanContent): string {
    const parts: string[] = [];
    if (status['weatherTempC'] != null) parts.push(`${this.num(status['weatherTempC'])}°C`);
    if (status['weatherCondition']) parts.push(String(status['weatherCondition']));
    if (status['rainfallMm'] != null) parts.push(`${this.num(status['rainfallMm'])} mm rain`);
    return parts.length ? parts.join(' · ') : '—';
  }

  waterLine(status: PlanContent): string {
    const parts: string[] = [];
    if (status['waterSourceCount'] != null) parts.push(`${status['waterSourceCount']} sources`);
    if (status['irrigationMethod']) parts.push(String(status['irrigationMethod']));
    if (status['waterReliability']) parts.push(String(status['waterReliability']));
    return parts.length ? parts.join(' · ') : '—';
  }

  soilLine(status: PlanContent): string {
    const parts: string[] = [];
    if (status['soilType']) parts.push(String(status['soilType']));
    if (status['soilPh'] != null) parts.push(`pH ${this.num(status['soilPh'])}`);
    return parts.length ? parts.join(' · ') : '—';
  }

  rowKey(row: PlanContent, index: number): string {
    return String(row['zoneId'] ?? row['zoneLabel'] ?? index);
  }

  private fromList(list: unknown): Array<{ id: string; title: string; body: string }> {
    if (!Array.isArray(list)) return [];
    return list
      .map((item, i) => {
        const s = (item ?? {}) as Record<string, unknown>;
        const id = String(s['sectionId'] ?? s['key'] ?? s['id'] ?? `section-${i}`);
        const title = String(
          s['title'] ?? s['heading'] ?? this.t.instant('plan.sectionFallback', { n: i + 1 }),
        );
        const body = this.stringifyBody(s['body'] ?? s['content'] ?? s['text'] ?? '');
        const recs = s['recommendations'];
        const recText = Array.isArray(recs)
          ? '\n\n' + recs.map((r) => `• ${String(r)}`).join('\n')
          : '';
        return { id, title, body: (body + recText).trim() };
      })
      .filter((s) => !!s.body);
  }

  private stringifyBody(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) {
      return value.map((v) => (typeof v === 'string' ? `• ${v}` : this.stringifyBody(v))).join('\n');
    }
    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => `${this.titleCase(k)}: ${typeof v === 'string' ? v : this.stringifyBody(v)}`)
        .join('\n');
    }
    return '';
  }

  private titleCase(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
