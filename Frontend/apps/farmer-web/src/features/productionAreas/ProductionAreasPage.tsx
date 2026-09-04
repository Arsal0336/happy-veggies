import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  FormField,
  Input,
  LoadingState,
  ProductionAreaTypeIcon,
  Select,
  type ProductionAreaType,
} from '@hv/ui';
import type { ProductionAreaTypeCode } from '@hv/api-types';
import { useAreas } from '../../shared/api/hooks';
import { farmService } from '../../shared/api/services';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

const TYPE_OPTIONS: ProductionAreaTypeCode[] = [
  'open_field',
  'shed',
  'greenhouse',
  'tunnel_polyhouse',
  'experimental',
  'other_protected',
];

function typeLabelKey(code: ProductionAreaTypeCode | string): string {
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

function toIconType(code: ProductionAreaTypeCode | string): ProductionAreaType {
  if (code === 'tunnel_polyhouse') return 'tunnel';
  if (code === 'other_protected') return 'shed';
  return code as ProductionAreaType;
}

export function ProductionAreasPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { notifyError, notify } = useNotifications();
  const { data: areas, isLoading, error, refetch } = useAreas(farmId);

  const [name, setName] = useState('');
  const [typeCode, setTypeCode] = useState<ProductionAreaTypeCode>('open_field');
  const [areaValue, setAreaValue] = useState('1');
  const [saving, setSaving] = useState(false);

  if (isLoading) return <LoadingState label={t('common.loading')} />;
  if (error) {
    return (
      <ErrorState
        title={t('common.error')}
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await farmService.createArea(farmId, {
        name: name.trim(),
        typeCode,
        area: { value: Number(areaValue) || 1, unit: 'kanal' },
      });
      setName('');
      notify('success', t('areas.add'));
      void qc.invalidateQueries({ queryKey: ['areas', farmId] });
      void qc.invalidateQueries({ queryKey: ['twin', farmId] });
    } catch (err) {
      notifyError(err);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (areaId: string) => {
    if (!window.confirm(t('areas.confirmDelete'))) return;
    try {
      await farmService.deleteArea(farmId, areaId);
      notify('success', t('common.delete'));
      void qc.invalidateQueries({ queryKey: ['areas', farmId] });
      void qc.invalidateQueries({ queryKey: ['zones', farmId] });
      void qc.invalidateQueries({ queryKey: ['twin', farmId] });
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('areas.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      {!areas?.length ? (
        <EmptyState title={t('areas.empty')} />
      ) : (
        <ul className="hv-stack">
          {areas.map((area) => (
            <li key={area.id}>
              <Card padding="md" className="hv-row hv-row--between">
                <div className="hv-row">
                  <ProductionAreaTypeIcon type={toIconType(area.typeCode)} />
                  <div>
                    <strong>{area.name}</strong>
                    <p className="hv-muted">
                      {t(typeLabelKey(area.typeCode))} · {area.area.value} {area.area.unit}
                    </p>
                  </div>
                </div>
                <div className="hv-row">
                  <Link to={`/farms/${farmId}/areas/${area.id}/zones`}>
                    {t('areas.manageZones')}
                  </Link>
                  <Button size="sm" variant="danger" onClick={() => void onDelete(area.id)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card padding="md" className="hv-section">
        <h2 className="hv-section-title">{t('areas.add')}</h2>
        <form className="hv-stack" onSubmit={(e) => void onAdd(e)}>
          <FormField htmlFor="area-name" label={t('areas.name')} required>
            <Input id="area-name" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField htmlFor="area-type" label={t('areas.type')}>
            <Select
              id="area-type"
              value={typeCode}
              onChange={(e) => setTypeCode(e.target.value as ProductionAreaTypeCode)}
            >
              {TYPE_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {t(typeLabelKey(code))}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="area-size" label={t('farms.area')}>
            <Input
              id="area-size"
              type="number"
              step="any"
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
            />
          </FormField>
          <Button type="submit" variant="primary" loading={saving}>
            {t('areas.add')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
