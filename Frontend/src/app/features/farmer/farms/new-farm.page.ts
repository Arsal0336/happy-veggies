import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvInput } from '../../../shared/ui/hv-input';
import { HvSelect } from '../../../shared/ui/hv-select';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvCard } from '../../../shared/ui/hv-card';
import { FarmApiService } from '../../../core/api/farm.service';
import { PlanApiService } from '../../../core/api/plan.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { ToastService } from '../../../shared/ui/toast.service';

type StepId =
  | 'welcome'
  | 'name'
  | 'location'
  | 'region'
  | 'size'
  | 'soil'
  | 'water'
  | 'budget'
  | 'areaType'
  | 'crop'
  | 'confirm';

const STEPS: StepId[] = [
  'welcome',
  'name',
  'location',
  'region',
  'size',
  'soil',
  'water',
  'budget',
  'areaType',
  'crop',
  'confirm',
];

const SOIL_OPTIONS = ['loam', 'sandy', 'clay', 'silt', 'mixed', 'unknown'] as const;
const WATER_SOURCES = ['tube_well', 'canal', 'rain_fed', 'reservoir', 'other'] as const;
const AREA_TYPES = [
  'open_field',
  'shed',
  'greenhouse',
  'tunnel_polyhouse',
  'experimental',
] as const;

function soilLabelKey(soil: string): string {
  const map: Record<string, string> = {
    sandy: 'setup.soilSandy',
    clay: 'setup.soilClay',
    loam: 'setup.soilLoam',
    silt: 'setup.soilSilt',
    mixed: 'setup.soilMixed',
    unknown: 'setup.soilUnknown',
  };
  return map[soil] || 'setup.soilUnknown';
}

function waterLabelKey(source: string): string {
  const map: Record<string, string> = {
    tube_well: 'setup.waterTubeWell',
    canal: 'setup.waterCanal',
    rain_fed: 'setup.waterRainFed',
    reservoir: 'setup.waterReservoir',
    other: 'setup.waterOther',
  };
  return map[source] || 'setup.waterOther';
}

function areaTypeLabelKey(code: string): string {
  switch (code) {
    case 'open_field':
      return 'areas.openField';
    case 'shed':
      return 'areas.shed';
    case 'greenhouse':
      return 'areas.greenhouse';
    case 'tunnel_polyhouse':
      return 'areas.tunnel';
    case 'experimental':
      return 'areas.experimental';
    default:
      return 'areas.otherProtected';
  }
}

@Component({
  selector: 'app-new-farm-page',
  imports: [TranslatePipe, PageHeader, HvInput, HvSelect, HvButton, HvCard],
  styles: `
    .hv-choice-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
      gap: 0.5rem;
    }
    .hv-choice {
      border: 1px solid var(--hv-color-border);
      border-radius: 0.75rem;
      background: white;
      padding: 0.75rem;
      text-align: start;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
    }
    .hv-choice.is-selected {
      border-color: var(--hv-color-primary-500, #16a34a);
      background: color-mix(in srgb, var(--hv-color-primary-500, #16a34a) 12%, white);
    }
    .hv-setup__summary {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .hv-setup__summary li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.875rem;
    }
    .hv-setup__summary span {
      color: var(--hv-color-text-muted);
      text-align: end;
    }
  `,
  template: `
    <div class="hv-page">
      @if (isWorking()) {
        <hv-card>
          <p class="font-semibold">{{ workingLabel() || ('setup.generatingPlan' | translate) }}</p>
          <p class="mt-2 text-sm text-muted">{{ 'setup.confirmHint' | translate }}</p>
        </hv-card>
      } @else {
        <hv-page-header titleKey="setup.title">
          @if (step() !== 'welcome') {
            <p class="m-0 text-sm text-muted">
              {{ 'setup.progress' | translate: { current: progressCurrent(), total: STEPS.length } }}
            </p>
          }
        </hv-page-header>

        <hv-card>
          @switch (step()) {
            @case ('welcome') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.welcomeTitle' | translate }}</h2>
                <p>{{ 'setup.welcomeBody' | translate }}</p>
                <hv-button labelKey="setup.welcomeStart" (pressed)="goNext()" />
                <hv-button variant="ghost" labelKey="common.cancel" (pressed)="cancel()" />
              </div>
            }
            @case ('name') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.askName' | translate }}</h2>
                <p class="text-sm text-muted">{{ 'setup.askNameHint' | translate }}</p>
                <hv-input labelKey="farms.name" [(value)]="name" />
              </div>
            }
            @case ('location') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.askLocation' | translate }}</h2>
                <p class="text-sm text-muted">{{ 'setup.askLocationHint' | translate }}</p>
                <hv-input labelKey="farms.lat" type="number" [(value)]="lat" />
                <hv-input labelKey="farms.lng" type="number" [(value)]="lng" />
                <hv-button
                  variant="secondary"
                  labelKey="setup.useMyLocation"
                  [loading]="locating()"
                  (pressed)="useMyLocation()"
                />
              </div>
            }
            @case ('region') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.askRegion' | translate }}</h2>
                <p class="text-sm text-muted">{{ 'setup.askRegionHint' | translate }}</p>
                <hv-input labelKey="farms.region" [(value)]="regionCode" />
              </div>
            }
            @case ('size') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.askArea' | translate }}</h2>
                <hv-input labelKey="farms.area" type="number" [(value)]="areaValue" />
                <hv-select labelKey="farms.area" [options]="unitOptions" [(value)]="areaUnit" />
              </div>
            }
            @case ('soil') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.askSoil' | translate }}</h2>
                <p class="text-sm text-muted">{{ 'setup.askSoilHint' | translate }}</p>
                <div class="hv-choice-grid">
                  @for (s of soilOptions; track s) {
                    <button
                      type="button"
                      class="hv-choice"
                      [class.is-selected]="soilType() === s"
                      (click)="soilType.set(s)"
                    >
                      {{ soilLabelKey(s) | translate }}
                    </button>
                  }
                </div>
              </div>
            }
            @case ('water') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.askWater' | translate }}</h2>
                <p class="text-sm text-muted">{{ 'setup.askWaterHint' | translate }}</p>
                <div class="hv-choice-grid">
                  <button
                    type="button"
                    class="hv-choice"
                    [class.is-selected]="waterAccess()"
                    (click)="waterAccess.set(true)"
                  >
                    {{ 'setup.waterYes' | translate }}
                  </button>
                  <button
                    type="button"
                    class="hv-choice"
                    [class.is-selected]="!waterAccess()"
                    (click)="waterAccess.set(false)"
                  >
                    {{ 'setup.waterNo' | translate }}
                  </button>
                </div>
                @if (waterAccess()) {
                  <hv-select
                    labelKey="setup.askWaterHint"
                    [options]="waterOptions"
                    [(value)]="waterSource"
                  />
                }
              </div>
            }
            @case ('budget') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.askBudget' | translate }}</h2>
                <p class="text-sm text-muted">{{ 'setup.askBudgetHint' | translate }}</p>
                <hv-input labelKey="setup.budgetAmount" type="number" [(value)]="budgetAmount" />
              </div>
            }
            @case ('areaType') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.askAreaType' | translate }}</h2>
                <p class="text-sm text-muted">{{ 'setup.askAreaTypeHint' | translate }}</p>
                <div class="hv-choice-grid">
                  @for (code of areaTypes; track code) {
                    <button
                      type="button"
                      class="hv-choice"
                      [class.is-selected]="areaType() === code"
                      (click)="areaType.set(code)"
                    >
                      {{ areaTypeLabelKey(code) | translate }}
                    </button>
                  }
                </div>
                <hv-input
                  labelKey="setup.areaName"
                  [placeholder]="'setup.areaNamePlaceholder' | translate"
                  [(value)]="areaName"
                />
              </div>
            }
            @case ('crop') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.askCrop' | translate }}</h2>
                <p class="text-sm text-muted">{{ 'setup.askCropHint' | translate }}</p>
                <hv-input
                  labelKey="zones.crop"
                  [placeholder]="'setup.cropPlaceholder' | translate"
                  [disabled]="letAiChooseCrop()"
                  [(value)]="cropName"
                  (valueChange)="onCropTyped()"
                />
                <button
                  type="button"
                  class="hv-choice w-full"
                  [class.is-selected]="letAiChooseCrop()"
                  (click)="chooseAiCrop()"
                >
                  {{ 'setup.letAiChoose' | translate }}
                </button>
              </div>
            }
            @case ('confirm') {
              <div class="space-y-3">
                <h2 class="font-display text-xl font-semibold">{{ 'setup.askConfirm' | translate }}</h2>
                <p class="text-sm text-muted">{{ 'setup.confirmHint' | translate }}</p>
                <ul class="hv-setup__summary">
                  <li>
                    <strong>{{ 'setup.summaryFarm' | translate }}</strong>
                    <span>{{ name().trim() || ('common.unnamed' | translate) }}</span>
                  </li>
                  <li>
                    <strong>{{ 'setup.summaryLocation' | translate }}</strong>
                    <span>{{ lat() }}, {{ lng() }}</span>
                  </li>
                  <li>
                    <strong>{{ 'setup.summaryRegion' | translate }}</strong>
                    <span>{{ regionCode() }}</span>
                  </li>
                  <li>
                    <strong>{{ 'setup.summaryArea' | translate }}</strong>
                    <span>{{ areaValue() }} {{ areaUnit() }}</span>
                  </li>
                  <li>
                    <strong>{{ 'setup.summarySoil' | translate }}</strong>
                    <span>{{ soilLabelKey(soilType()) | translate }}</span>
                  </li>
                  <li>
                    <strong>{{ 'setup.summaryWater' | translate }}</strong>
                    <span>
                      {{
                        waterAccess()
                          ? (waterLabelKey(waterSource()) | translate)
                          : ('setup.waterNo' | translate)
                      }}
                    </span>
                  </li>
                  <li>
                    <strong>{{ 'setup.summaryBudget' | translate }}</strong>
                    <span>{{ budgetAmount().trim() ? 'PKR ' + budgetAmount() : '—' }}</span>
                  </li>
                  <li>
                    <strong>{{ 'setup.summaryAreaType' | translate }}</strong>
                    <span>
                      {{ areaName().trim() || (areaTypeLabelKey(areaType()) | translate) }}
                      ({{ areaTypeLabelKey(areaType()) | translate }})
                    </span>
                  </li>
                  <li>
                    <strong>{{ 'setup.summaryCrop' | translate }}</strong>
                    <span>
                      {{
                        letAiChooseCrop()
                          ? ('setup.letAiChoose' | translate)
                          : cropName().trim() || '—'
                      }}
                    </span>
                  </li>
                </ul>
              </div>
            }
          }

          @if (fieldError()) {
            <p class="mt-3 text-sm text-[var(--hv-color-error)]">{{ fieldError() }}</p>
          }

          @if (step() !== 'welcome') {
            <div class="mt-4 flex flex-wrap gap-2">
              @if (canGoBack()) {
                <hv-button variant="ghost" labelKey="common.back" (pressed)="goBack()" />
              }
              @if (step() === 'budget') {
                <hv-button
                  variant="secondary"
                  labelKey="setup.skip"
                  (pressed)="skipBudget()"
                />
              }
              @if (step() === 'confirm') {
                <hv-button labelKey="setup.finish" (pressed)="finishSetup()" />
              } @else {
                <hv-button labelKey="common.next" (pressed)="validateAndNext()" />
              }
            </div>
          }
        </hv-card>
      }
    </div>
  `,
})
export class NewFarmPage {
  private readonly farms = inject(FarmApiService);
  private readonly plans = inject(PlanApiService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  readonly STEPS = STEPS;
  readonly soilOptions = SOIL_OPTIONS;
  readonly areaTypes = AREA_TYPES;
  readonly soilLabelKey = soilLabelKey;
  readonly waterLabelKey = waterLabelKey;
  readonly areaTypeLabelKey = areaTypeLabelKey;

  readonly stepIndex = signal(0);
  readonly name = signal('');
  readonly lat = signal('33.6844');
  readonly lng = signal('73.0479');
  readonly regionCode = signal('Punjab');
  readonly areaValue = signal('5');
  readonly areaUnit = signal('acres');
  readonly soilType = signal<string>('loam');
  readonly waterAccess = signal(true);
  readonly waterSource = signal('tube_well');
  readonly budgetAmount = signal('');
  readonly areaType = signal<string>('open_field');
  readonly areaName = signal('');
  readonly cropName = signal('');
  readonly letAiChooseCrop = signal(false);
  readonly fieldError = signal('');
  readonly workingLabel = signal('');
  readonly isWorking = signal(false);
  readonly locating = signal(false);

  readonly unitOptions = [
    { value: 'acres', label: 'acres' },
    { value: 'kanal', label: 'kanal' },
    { value: 'acre', label: 'acre' },
  ];

  readonly waterOptions = WATER_SOURCES.map((src) => ({
    value: src,
    labelKey: waterLabelKey(src),
  }));

  step(): StepId {
    return STEPS[this.stepIndex()] ?? 'welcome';
  }

  progressCurrent(): number {
    return Math.min(this.stepIndex() + 1, STEPS.length);
  }

  canGoBack(): boolean {
    return this.stepIndex() > 0 && !this.isWorking();
  }

  goNext(): void {
    this.fieldError.set('');
    this.stepIndex.update((i) => Math.min(i + 1, STEPS.length - 1));
  }

  goBack(): void {
    this.fieldError.set('');
    this.stepIndex.update((i) => Math.max(i - 1, 0));
  }

  cancel(): void {
    void this.router.navigateByUrl('/');
  }

  skipBudget(): void {
    this.budgetAmount.set('');
    this.goNext();
  }

  onCropTyped(): void {
    this.letAiChooseCrop.set(false);
  }

  chooseAiCrop(): void {
    this.letAiChooseCrop.set(true);
    this.cropName.set('');
  }

  validateAndNext(): void {
    this.fieldError.set('');
    const step = this.step();
    if (step === 'location') {
      const lat = Number(this.lat());
      const lng = Number(this.lng());
      if (
        this.lat() === '' ||
        this.lng() === '' ||
        Number.isNaN(lat) ||
        Number.isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        this.fieldError.set(this.t.instant('setup.locationRequired'));
        return;
      }
    }
    if (step === 'region' && !this.regionCode().trim()) {
      this.fieldError.set(this.t.instant('setup.regionRequired'));
      return;
    }
    if (step === 'size' && (this.areaValue() === '' || Number(this.areaValue()) <= 0)) {
      this.fieldError.set(this.t.instant('setup.areaRequired'));
      return;
    }
    if (step === 'areaType' && !this.areaType()) {
      this.fieldError.set(this.t.instant('setup.areaTypeRequired'));
      return;
    }
    if (step === 'crop' && !this.letAiChooseCrop() && !this.cropName().trim()) {
      this.fieldError.set(this.t.instant('setup.cropRequired'));
      return;
    }
    this.goNext();
  }

  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.fieldError.set(this.t.instant('setup.locationDenied'));
      return;
    }
    this.locating.set(true);
    this.fieldError.set('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.lat.set(pos.coords.latitude.toFixed(6));
        this.lng.set(pos.coords.longitude.toFixed(6));
        this.locating.set(false);
      },
      () => {
        this.fieldError.set(this.t.instant('setup.locationDenied'));
        this.locating.set(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async finishSetup(): Promise<void> {
    this.isWorking.set(true);
    this.workingLabel.set(this.t.instant('setup.saving'));
    try {
      const farmSize = Number(this.areaValue()) || 1;
      const farm: any = await firstValueFrom(
        this.farms.createFarm({
          name: this.name().trim() || undefined,
          lat: Number(this.lat()),
          lng: Number(this.lng()),
          regionCode: this.regionCode().trim(),
          regionLabel: this.regionCode().trim(),
          areaInputValue: farmSize,
          areaInputUnit: this.areaUnit(),
          soilType: this.soilType(),
          waterAccess: this.waterAccess(),
          waterSource: this.waterAccess() ? this.waterSource() : undefined,
          budgetAmount: this.budgetAmount().trim() ? Number(this.budgetAmount()) : null,
          budgetCurrency: this.budgetAmount().trim() ? 'PKR' : null,
          preferredCropFreeText: this.letAiChooseCrop() ? null : this.cropName().trim() || null,
          letAiChooseCrop: this.letAiChooseCrop(),
          isNewFarmSetup: true,
        }),
      );

      this.workingLabel.set(this.t.instant('setup.creatingArea'));
      const existingAreas = (await firstValueFrom(this.farms.listAreas(farm.id))) as any[];
      let area = existingAreas[0];
      const displayName =
        this.areaName().trim() || this.t.instant(areaTypeLabelKey(this.areaType()));
      const coveredTypes = ['shed', 'greenhouse', 'tunnel_polyhouse', 'other_protected'];

      if (area) {
        await firstValueFrom(this.farms.updateArea(farm.id, area.id, { name: displayName }));
      }

      if (coveredTypes.includes(this.areaType())) {
        try {
          area = await firstValueFrom(
            this.farms.createArea(farm.id, {
              name: displayName,
              typeCode: this.areaType(),
              areaInputValue: Math.max(0.25, farmSize * 0.2),
              areaInputUnit: this.areaUnit(),
            }),
          );
        } catch {
          /* keep default open-field area */
        }
      } else if (!area) {
        area = await firstValueFrom(
          this.farms.createArea(farm.id, {
            name: displayName,
            typeCode: this.areaType() === 'experimental' ? 'experimental' : 'open_field',
            areaInputValue: farmSize,
            areaInputUnit: this.areaUnit(),
          }),
        );
      }

      if (area && !this.letAiChooseCrop() && this.cropName().trim()) {
        this.workingLabel.set(this.t.instant('setup.creatingZone'));
        await firstValueFrom(
          this.farms.createZone(farm.id, area.id, {
            label: this.cropName().trim(),
            cropFreetext: this.cropName().trim(),
            areaInputValue: Math.max(0.1, farmSize * 0.25),
            areaInputUnit: this.areaUnit(),
            growthStage: 'pre_planting',
          }),
        );
      }

      this.workingLabel.set(this.t.instant('setup.generatingPlan'));
      const lang = this.language.current();
      await firstValueFrom(this.plans.generatePlan(farm.id, lang));

      this.toast.success(this.t.instant('setup.doneTitle'));
      await this.router.navigate(['/farms', farm.id, 'plan'], { replaceUrl: true });
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
      this.isWorking.set(false);
      this.workingLabel.set('');
    }
  }
}
