import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, FormField, Select, Card, MapOrCoords } from '@hv/ui';
import type { AreaUnit, SoilType, WaterSourceType } from '@hv/api-types';
import { farmService } from '../../shared/api/services';

type WizardStep = 'location' | 'region' | 'area' | 'soil' | 'water' | 'budget' | 'confirm';

const STEPS: WizardStep[] = ['location', 'region', 'area', 'soil', 'water', 'budget', 'confirm'];

const STEP_LABELS: Record<WizardStep, string> = {
  location: 'Location',
  region: 'Region',
  area: 'Area',
  soil: 'Soil',
  water: 'Water',
  budget: 'Budget',
  confirm: 'Confirm',
};

interface WizardState {
  name: string;
  lat: number;
  lng: number;
  regionCode: string;
  area: string;
  unit: AreaUnit;
  soil: SoilType | '';
  waterAccess: boolean;
  waterSource: WaterSourceType | '';
  budgetAmount: string;
  budgetCurrency: string;
}

const INITIAL_STATE: WizardState = {
  name: '',
  lat: 33.6844,
  lng: 73.0479,
  regionCode: '',
  area: '',
  unit: 'kanal',
  soil: '',
  waterAccess: false,
  waterSource: '',
  budgetAmount: '',
  budgetCurrency: 'PKR',
};

const REGION_OPTIONS = [
  { value: '', label: 'Select region' },
  { value: 'ISB', label: 'Islamabad' },
  { value: 'LHR', label: 'Lahore' },
  { value: 'KHI', label: 'Karachi' },
  { value: 'PSH', label: 'Peshawar' },
  { value: 'QTA', label: 'Quetta' },
  { value: 'MUL', label: 'Multan' },
  { value: 'FSD', label: 'Faisalabad' },
];

const UNIT_OPTIONS: { value: AreaUnit; label: string }[] = [
  { value: 'kanal', label: 'Kanal' },
  { value: 'marla', label: 'Marla' },
  { value: 'acre', label: 'Acre' },
  { value: 'hectare', label: 'Hectare' },
];

const SOIL_OPTIONS: { value: SoilType | ''; label: string }[] = [
  { value: '', label: 'Select soil type' },
  { value: 'loam', label: 'Loam' },
  { value: 'clay', label: 'Clay' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'silt', label: 'Silt' },
  { value: 'mixed', label: 'Mixed' },
];

const WATER_SOURCE_OPTIONS: { value: WaterSourceType | ''; label: string }[] = [
  { value: '', label: 'Select water source' },
  { value: 'canal', label: 'Canal' },
  { value: 'tube_well', label: 'Tube Well' },
  { value: 'rain_fed', label: 'Rain Fed' },
  { value: 'reservoir', label: 'Reservoir' },
  { value: 'other', label: 'Other' },
];

const toAcre = (value: number, unit: AreaUnit): number => {
  switch (unit) {
    case 'acre': return value;
    case 'hectare': return value * 2.47105;
    case 'marla': return value / 160;
    case 'kanal': default: return value / 8;
  }
};

export function NewFarmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>('location');
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentIdx = STEPS.indexOf(step);
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === STEPS.length - 1;

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const next = () => !isLast && setStep(STEPS[currentIdx + 1]);
  const prev = () => !isFirst && setStep(STEPS[currentIdx - 1]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const numericArea = Number(state.area) || 1;
      await farmService.createFarm({
        lat: state.lat,
        lng: state.lng,
        regionCode: state.regionCode || 'ISB',
        areaAcres: toAcre(numericArea, state.unit),
        areaInput: { value: numericArea, unit: state.unit },
        soilType: state.soil || null,
        waterAccess: state.waterAccess || null,
        waterSource: (state.waterSource as WaterSourceType) || null,
        budget: state.budgetAmount
          ? { amount: Number(state.budgetAmount), currency: state.budgetCurrency }
          : null,
      });
      navigate('/farms');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'location':
        return (
          <div className="flex flex-col gap-4">
            <FormField label={t('farm.name')}>
              <Input
                value={state.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder={t('farm.namePlaceholder')}
              />
            </FormField>
            <MapOrCoords
              lat={state.lat}
              lng={state.lng}
              onSelect={(lat, lng) => setState((p) => ({ ...p, lat, lng }))}
            />
          </div>
        );

      case 'region':
        return (
          <FormField label="Region">
            <Select
              value={state.regionCode}
              onChange={(e) => update('regionCode', e.target.value)}
              options={REGION_OPTIONS}
            />
          </FormField>
        );

      case 'area':
        return (
          <FormField label={t('farm.area')}>
            <div className="flex gap-2">
              <Input
                type="number"
                value={state.area}
                onChange={(e) => update('area', e.target.value)}
                placeholder="25"
                className="flex-1"
              />
              <Select
                value={state.unit}
                onChange={(e) => update('unit', e.target.value as AreaUnit)}
                options={UNIT_OPTIONS}
              />
            </div>
          </FormField>
        );

      case 'soil':
        return (
          <FormField label={t('farm.soilType')}>
            <Select
              value={state.soil}
              onChange={(e) => update('soil', e.target.value as SoilType)}
              options={SOIL_OPTIONS}
            />
          </FormField>
        );

      case 'water':
        return (
          <div className="flex flex-col gap-4">
            <FormField label="Water Access">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.waterAccess}
                  onChange={(e) => update('waterAccess', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-[var(--hv-text-sm)]">Farm has water access</span>
              </label>
            </FormField>
            {state.waterAccess && (
              <FormField label="Water Source">
                <Select
                  value={state.waterSource}
                  onChange={(e) => update('waterSource', e.target.value as WaterSourceType)}
                  options={WATER_SOURCE_OPTIONS}
                />
              </FormField>
            )}
          </div>
        );

      case 'budget':
        return (
          <FormField label="Budget (optional)">
            <div className="flex gap-2">
              <Input
                type="number"
                value={state.budgetAmount}
                onChange={(e) => update('budgetAmount', e.target.value)}
                placeholder="50000"
                className="flex-1"
              />
              <Select
                value={state.budgetCurrency}
                onChange={(e) => update('budgetCurrency', e.target.value)}
                options={[
                  { value: 'PKR', label: 'PKR' },
                  { value: 'USD', label: 'USD' },
                ]}
              />
            </div>
          </FormField>
        );

      case 'confirm':
        return (
          <div className="flex flex-col gap-2 text-[var(--hv-text-sm)]">
            <p><strong>Name:</strong> {state.name || '(unnamed)'}</p>
            <p><strong>Location:</strong> {state.lat.toFixed(4)}, {state.lng.toFixed(4)}</p>
            <p><strong>Region:</strong> {state.regionCode || '(not set)'}</p>
            <p><strong>Area:</strong> {state.area || '—'} {state.unit}</p>
            <p><strong>Soil:</strong> {state.soil || '(not set)'}</p>
            <p><strong>Water:</strong> {state.waterAccess ? (state.waterSource || 'Yes') : 'No'}</p>
            {state.budgetAmount && (
              <p><strong>Budget:</strong> {state.budgetAmount} {state.budgetCurrency}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[var(--hv-text-lg)] font-bold">{t('newFarmer.title')}</h1>

      {/* Step indicator */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => i <= currentIdx && setStep(s)}
            className={`flex-1 py-1 text-[var(--hv-text-xs)] rounded transition-colors ${
              i === currentIdx
                ? 'bg-[var(--hv-color-primary-600)] text-white'
                : i < currentIdx
                  ? 'bg-[var(--hv-color-primary-100)] text-[var(--hv-color-primary-700)] cursor-pointer'
                  : 'bg-[var(--hv-color-neutral-100)] text-[var(--hv-color-neutral-400)]'
            }`}
          >
            {STEP_LABELS[s]}
          </button>
        ))}
      </div>

      <Card padding="lg">
        <div className="flex flex-col gap-4">
          <h2 className="text-[var(--hv-text-md)] font-semibold">{STEP_LABELS[step]}</h2>
          {renderStep()}

          <div className="flex gap-3 mt-2">
            {isFirst ? (
              <Button variant="outline" onClick={() => navigate('/farms')}>
                {t('common.cancel')}
              </Button>
            ) : (
              <Button variant="outline" onClick={prev}>
                Back
              </Button>
            )}
            {isLast ? (
              <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
                {t('farm.createFarm')}
              </Button>
            ) : (
              <Button variant="primary" onClick={next}>
                Next
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
