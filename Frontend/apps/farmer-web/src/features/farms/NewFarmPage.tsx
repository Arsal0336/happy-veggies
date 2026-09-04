import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  AreaUnitInput,
  Button,
  Card,
  FormField,
  Input,
  LoadingState,
  MapOrCoords,
  Select,
  type AreaUnit,
} from '@hv/ui';
import type {
  ProductionAreaTypeCode,
  SoilType,
  WaterSourceType,
} from '@hv/api-types';
import { farmService } from '../../shared/api/services';
import { planService } from '../../shared/api/services/planService';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

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
  | 'confirm'
  | 'working';

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

const SOIL_OPTIONS: SoilType[] = ['loam', 'sandy', 'clay', 'silt', 'mixed', 'unknown'];
const WATER_SOURCES: WaterSourceType[] = [
  'tube_well',
  'canal',
  'rain_fed',
  'reservoir',
  'other',
];
const AREA_TYPES: ProductionAreaTypeCode[] = [
  'open_field',
  'shed',
  'greenhouse',
  'tunnel_polyhouse',
  'experimental',
];

function soilLabelKey(soil: SoilType): string {
  const map: Record<SoilType, string> = {
    sandy: 'setup.soilSandy',
    clay: 'setup.soilClay',
    loam: 'setup.soilLoam',
    silt: 'setup.soilSilt',
    mixed: 'setup.soilMixed',
    unknown: 'setup.soilUnknown',
  };
  return map[soil];
}

function waterLabelKey(source: WaterSourceType): string {
  const map: Record<WaterSourceType, string> = {
    tube_well: 'setup.waterTubeWell',
    canal: 'setup.waterCanal',
    rain_fed: 'setup.waterRainFed',
    reservoir: 'setup.waterReservoir',
    other: 'setup.waterOther',
  };
  return map[source];
}

function areaTypeLabelKey(code: ProductionAreaTypeCode): string {
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

export function NewFarmPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { notifyError, notify } = useNotifications();

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex] ?? 'welcome';

  const [name, setName] = useState('');
  const [lat, setLat] = useState<number | ''>(33.6844);
  const [lng, setLng] = useState<number | ''>(73.0479);
  const [regionCode, setRegionCode] = useState('Punjab');
  const [areaValue, setAreaValue] = useState<number | ''>(5);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('acres');
  const [soilType, setSoilType] = useState<SoilType>('loam');
  const [waterAccess, setWaterAccess] = useState(true);
  const [waterSource, setWaterSource] = useState<WaterSourceType>('tube_well');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [areaType, setAreaType] = useState<ProductionAreaTypeCode>('open_field');
  const [areaName, setAreaName] = useState('');
  const [cropName, setCropName] = useState('');
  const [letAiChooseCrop, setLetAiChooseCrop] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [workingLabel, setWorkingLabel] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [locating, setLocating] = useState(false);

  const progressCurrent = Math.min(stepIndex + 1, STEPS.length);
  const questionSteps = STEPS.length;

  const canGoBack = stepIndex > 0 && step !== 'working';

  const goNext = () => {
    setFieldError('');
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setFieldError('');
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const validateAndNext = () => {
    setFieldError('');
    if (step === 'location') {
      if (lat === '' || lng === '' || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
        setFieldError(t('setup.locationRequired'));
        return;
      }
      if (Number(lat) < -90 || Number(lat) > 90 || Number(lng) < -180 || Number(lng) > 180) {
        setFieldError(t('setup.locationRequired'));
        return;
      }
    }
    if (step === 'region' && !regionCode.trim()) {
      setFieldError(t('setup.regionRequired'));
      return;
    }
    if (step === 'size' && (areaValue === '' || Number(areaValue) <= 0)) {
      setFieldError(t('setup.areaRequired'));
      return;
    }
    if (step === 'areaType' && !areaType) {
      setFieldError(t('setup.areaTypeRequired'));
      return;
    }
    if (step === 'crop' && !letAiChooseCrop && !cropName.trim()) {
      setFieldError(t('setup.cropRequired'));
      return;
    }
    goNext();
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setFieldError(t('setup.locationDenied'));
      return;
    }
    setLocating(true);
    setFieldError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      () => {
        setFieldError(t('setup.locationDenied'));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const finishSetup = async () => {
    setIsWorking(true);
    setWorkingLabel(t('setup.saving'));
    try {
      const farmSize = Number(areaValue) || 1;
      const farm = await farmService.createFarm({
        name: name.trim() || undefined,
        lat: Number(lat),
        lng: Number(lng),
        regionCode: regionCode.trim(),
        regionLabel: regionCode.trim(),
        area: { value: farmSize, unit: areaUnit },
        soilType,
        waterAccess,
        waterSource: waterAccess ? waterSource : undefined,
        budgetAmount: budgetAmount.trim() ? Number(budgetAmount) : null,
        budgetCurrency: budgetAmount.trim() ? 'PKR' : null,
        preferredCropFreeText: letAiChooseCrop ? null : cropName.trim() || null,
        letAiChooseCrop,
        isNewFarmSetup: true,
      });

      setWorkingLabel(t('setup.creatingArea'));
      const existingAreas = await farmService.listAreas(farm.id);
      let area = existingAreas[0];
      const displayName = areaName.trim() || t(areaTypeLabelKey(areaType));
      const coveredTypes: ProductionAreaTypeCode[] = [
        'shed',
        'greenhouse',
        'tunnel_polyhouse',
        'other_protected',
      ];

      if (area) {
        await farmService.updateArea(farm.id, area.id, { name: displayName });
      }

      if (coveredTypes.includes(areaType)) {
        try {
          area = await farmService.createArea(farm.id, {
            name: displayName,
            typeCode: areaType,
            area: { value: Math.max(0.25, farmSize * 0.2), unit: areaUnit },
          });
        } catch {
          // Keep the default open-field area if a covered area cannot be added.
        }
      } else if (!area) {
        area = await farmService.createArea(farm.id, {
          name: displayName,
          typeCode: areaType === 'experimental' ? 'experimental' : 'open_field',
          area: { value: farmSize, unit: areaUnit },
        });
      }

      if (area && !letAiChooseCrop && cropName.trim()) {
        setWorkingLabel(t('setup.creatingZone'));
        await farmService.createZone(farm.id, {
          productionAreaId: area.id,
          label: cropName.trim(),
          cropFreetext: cropName.trim(),
          area: { value: Math.max(0.1, farmSize * 0.25), unit: areaUnit },
          growthStage: 'pre_planting',
        });
      }

      setWorkingLabel(t('setup.generatingPlan'));
      const language = i18n.language?.startsWith('ur') ? 'ur' : 'en';
      await planService.generatePlan(farm.id, language);

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['farms'] }),
        qc.invalidateQueries({ queryKey: ['farm', farm.id] }),
        qc.invalidateQueries({ queryKey: ['areas', farm.id] }),
        qc.invalidateQueries({ queryKey: ['zones', farm.id] }),
        qc.invalidateQueries({ queryKey: ['twin', farm.id] }),
        qc.invalidateQueries({ queryKey: ['plan', farm.id] }),
      ]);

      notify('success', t('setup.doneTitle'));
      navigate(`/farms/${farm.id}/plan`, { replace: true });
    } catch (err) {
      notifyError(err);
      setIsWorking(false);
      setWorkingLabel('');
    }
  };

  const choiceButtons = useMemo(
    () => ({
      soil: SOIL_OPTIONS.map((s) => (
        <button
          key={s}
          type="button"
          className={`hv-choice${soilType === s ? ' is-selected' : ''}`}
          onClick={() => setSoilType(s)}
        >
          {t(soilLabelKey(s))}
        </button>
      )),
      areaTypes: AREA_TYPES.map((code) => (
        <button
          key={code}
          type="button"
          className={`hv-choice${areaType === code ? ' is-selected' : ''}`}
          onClick={() => setAreaType(code)}
        >
          {t(areaTypeLabelKey(code))}
        </button>
      )),
    }),
    [soilType, areaType, t],
  );

  if (isWorking) {
    return (
      <div className="hv-page">
        <Card padding="lg">
          <LoadingState label={workingLabel || t('setup.generatingPlan')} />
          <p className="hv-muted hv-center">{t('setup.confirmHint')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="hv-page hv-setup">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('setup.title')}</h1>
        {step !== 'welcome' && (
          <p className="hv-muted">
            {t('setup.progress', { current: progressCurrent, total: questionSteps })}
          </p>
        )}
      </div>

      {step !== 'welcome' && (
        <div
          className="hv-setup__progress"
          role="progressbar"
          aria-valuenow={progressCurrent}
          aria-valuemin={1}
          aria-valuemax={questionSteps}
        >
          <div
            className="hv-setup__progress-bar"
            style={{ width: `${(progressCurrent / questionSteps) * 100}%` }}
          />
        </div>
      )}

      <Card padding="lg" className="hv-setup__card">
        {step === 'welcome' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.welcomeTitle')}</h2>
            <p>{t('setup.welcomeBody')}</p>
            <Button variant="primary" onClick={goNext}>
              {t('setup.welcomeStart')}
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              {t('common.cancel')}
            </Button>
          </div>
        )}

        {step === 'name' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.askName')}</h2>
            <p className="hv-muted">{t('setup.askNameHint')}</p>
            <FormField htmlFor="setup-name" label={t('farms.name')}>
              <Input
                id="setup-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </FormField>
          </div>
        )}

        {step === 'location' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.askLocation')}</h2>
            <p className="hv-muted">{t('setup.askLocationHint')}</p>
            <MapOrCoords
              latitude={lat}
              longitude={lng}
              onLatitudeChange={setLat}
              onLongitudeChange={setLng}
            />
            <Button variant="secondary" loading={locating} onClick={useMyLocation}>
              {t('setup.useMyLocation')}
            </Button>
          </div>
        )}

        {step === 'region' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.askRegion')}</h2>
            <p className="hv-muted">{t('setup.askRegionHint')}</p>
            <FormField htmlFor="setup-region" label={t('farms.region')} required>
              <Input
                id="setup-region"
                value={regionCode}
                onChange={(e) => setRegionCode(e.target.value)}
                autoFocus
              />
            </FormField>
          </div>
        )}

        {step === 'size' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.askArea')}</h2>
            <AreaUnitInput
              label={t('farms.area')}
              value={areaValue}
              unit={areaUnit}
              onValueChange={setAreaValue}
              onUnitChange={setAreaUnit}
            />
          </div>
        )}

        {step === 'soil' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.askSoil')}</h2>
            <p className="hv-muted">{t('setup.askSoilHint')}</p>
            <div className="hv-choice-grid">{choiceButtons.soil}</div>
          </div>
        )}

        {step === 'water' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.askWater')}</h2>
            <p className="hv-muted">{t('setup.askWaterHint')}</p>
            <div className="hv-choice-grid">
              <button
                type="button"
                className={`hv-choice${waterAccess ? ' is-selected' : ''}`}
                onClick={() => setWaterAccess(true)}
              >
                {t('setup.waterYes')}
              </button>
              <button
                type="button"
                className={`hv-choice${!waterAccess ? ' is-selected' : ''}`}
                onClick={() => setWaterAccess(false)}
              >
                {t('setup.waterNo')}
              </button>
            </div>
            {waterAccess && (
              <FormField htmlFor="setup-water-source" label={t('setup.askWaterHint')}>
                <Select
                  id="setup-water-source"
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value as WaterSourceType)}
                >
                  {WATER_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {t(waterLabelKey(src))}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
          </div>
        )}

        {step === 'budget' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.askBudget')}</h2>
            <p className="hv-muted">{t('setup.askBudgetHint')}</p>
            <FormField htmlFor="setup-budget" label={t('setup.budgetAmount')}>
              <Input
                id="setup-budget"
                type="number"
                min={0}
                step="any"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                autoFocus
              />
            </FormField>
          </div>
        )}

        {step === 'areaType' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.askAreaType')}</h2>
            <p className="hv-muted">{t('setup.askAreaTypeHint')}</p>
            <div className="hv-choice-grid">{choiceButtons.areaTypes}</div>
            <FormField htmlFor="setup-area-name" label={t('setup.areaName')}>
              <Input
                id="setup-area-name"
                value={areaName}
                placeholder={t('setup.areaNamePlaceholder')}
                onChange={(e) => setAreaName(e.target.value)}
              />
            </FormField>
          </div>
        )}

        {step === 'crop' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.askCrop')}</h2>
            <p className="hv-muted">{t('setup.askCropHint')}</p>
            <FormField htmlFor="setup-crop" label={t('zones.crop')}>
              <Input
                id="setup-crop"
                value={cropName}
                placeholder={t('setup.cropPlaceholder')}
                disabled={letAiChooseCrop}
                onChange={(e) => {
                  setCropName(e.target.value);
                  setLetAiChooseCrop(false);
                }}
                autoFocus
              />
            </FormField>
            <button
              type="button"
              className={`hv-choice${letAiChooseCrop ? ' is-selected' : ''}`}
              onClick={() => {
                setLetAiChooseCrop(true);
                setCropName('');
              }}
            >
              {t('setup.letAiChoose')}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="hv-stack">
            <h2 className="hv-setup__question">{t('setup.askConfirm')}</h2>
            <p className="hv-muted">{t('setup.confirmHint')}</p>
            <ul className="hv-setup__summary">
              <li>
                <strong>{t('setup.summaryFarm')}</strong>
                <span>{name.trim() || t('common.unnamed')}</span>
              </li>
              <li>
                <strong>{t('setup.summaryLocation')}</strong>
                <span>
                  {lat}, {lng}
                </span>
              </li>
              <li>
                <strong>{t('setup.summaryRegion')}</strong>
                <span>{regionCode}</span>
              </li>
              <li>
                <strong>{t('setup.summaryArea')}</strong>
                <span>
                  {areaValue} {areaUnit}
                </span>
              </li>
              <li>
                <strong>{t('setup.summarySoil')}</strong>
                <span>{t(soilLabelKey(soilType))}</span>
              </li>
              <li>
                <strong>{t('setup.summaryWater')}</strong>
                <span>
                  {waterAccess
                    ? t(waterLabelKey(waterSource))
                    : t('setup.waterNo')}
                </span>
              </li>
              <li>
                <strong>{t('setup.summaryBudget')}</strong>
                <span>{budgetAmount.trim() ? `PKR ${budgetAmount}` : '—'}</span>
              </li>
              <li>
                <strong>{t('setup.summaryAreaType')}</strong>
                <span>
                  {areaName.trim() || t(areaTypeLabelKey(areaType))} (
                  {t(areaTypeLabelKey(areaType))})
                </span>
              </li>
              <li>
                <strong>{t('setup.summaryCrop')}</strong>
                <span>
                  {letAiChooseCrop ? t('setup.letAiChoose') : cropName.trim() || '—'}
                </span>
              </li>
            </ul>
          </div>
        )}

        {fieldError && <p className="hv-setup__error">{fieldError}</p>}

        {step !== 'welcome' && (
          <div className="hv-setup__actions">
            {canGoBack && (
              <Button variant="ghost" onClick={goBack}>
                {t('common.back')}
              </Button>
            )}
            {step === 'budget' && (
              <Button
                variant="secondary"
                onClick={() => {
                  setBudgetAmount('');
                  goNext();
                }}
              >
                {t('setup.skip')}
              </Button>
            )}
            {step === 'confirm' ? (
              <Button variant="primary" onClick={() => void finishSetup()}>
                {t('setup.finish')}
              </Button>
            ) : (
              <Button variant="primary" onClick={validateAndNext}>
                {t('common.next')}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
