import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, FormField, Select, Card, MapOrCoords, Spinner, ErrorState } from '@hv/ui';
import type { AreaUnit, SoilType, WaterSourceType, UpdateFarmPayload } from '@hv/api-types';
import { useFarm } from '../../shared/api/hooks';

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

export function EditFarmPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: farm, isLoading, error } = useFarm(farmId ?? '');

  const [name, setName] = useState('');
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [regionCode, setRegionCode] = useState('');
  const [area, setArea] = useState('');
  const [unit, setUnit] = useState<AreaUnit>('kanal');
  const [soil, setSoil] = useState<SoilType | ''>('');
  const [waterSource, setWaterSource] = useState<WaterSourceType | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (farm && !initialized) {
      setName(farm.name ?? '');
      setLat(farm.lat);
      setLng(farm.lng);
      setRegionCode(farm.regionCode);
      setArea(String(farm.areaInput.value));
      setUnit(farm.areaInput.unit as AreaUnit);
      setSoil(farm.soilType ?? '');
      setWaterSource(farm.waterSource ?? '');
      setInitialized(true);
    }
  }, [farm, initialized]);

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (error) return <ErrorState error={error instanceof Error ? error : String(error)} />;
  if (!farm) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--hv-color-neutral-500)]">{t('farm.notFound')}</p>
        <Button variant="outline" onClick={() => navigate('/farms')} className="mt-4">
          {t('common.back')}
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // PATCH semantics: only changed fields
      const _payload: UpdateFarmPayload = {};
      if (name !== (farm.name ?? '')) _payload.name = name;
      if (lat !== farm.lat) _payload.lat = lat;
      if (lng !== farm.lng) _payload.lng = lng;
      if (regionCode !== farm.regionCode) _payload.regionCode = regionCode;
      const numArea = Number(area) || farm.areaInput.value;
      if (numArea !== farm.areaInput.value || unit !== farm.areaInput.unit) {
        _payload.areaInput = { value: numArea, unit };
      }
      // In fixture mode just navigate back
      navigate(`/farms/${farmId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[var(--hv-text-lg)] font-bold">Edit Farm</h1>

      <Card padding="lg">
        <div className="flex flex-col gap-4">
          <FormField label={t('farm.name')}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('farm.namePlaceholder')}
            />
          </FormField>

          <MapOrCoords lat={lat} lng={lng} onSelect={(la, ln) => { setLat(la); setLng(ln); }} />

          <FormField label="Region">
            <Select
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
              options={REGION_OPTIONS}
            />
          </FormField>

          <FormField label={t('farm.area')}>
            <div className="flex gap-2">
              <Input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="25"
                className="flex-1"
              />
              <Select
                value={unit}
                onChange={(e) => setUnit(e.target.value as AreaUnit)}
                options={UNIT_OPTIONS}
              />
            </div>
          </FormField>

          <FormField label={t('farm.soilType')}>
            <Select
              value={soil}
              onChange={(e) => setSoil(e.target.value as SoilType)}
              options={SOIL_OPTIONS}
            />
          </FormField>

          <FormField label="Water Source">
            <Select
              value={waterSource}
              onChange={(e) => setWaterSource(e.target.value as WaterSourceType)}
              options={WATER_SOURCE_OPTIONS}
            />
          </FormField>

          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => navigate(`/farms/${farmId}`)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
