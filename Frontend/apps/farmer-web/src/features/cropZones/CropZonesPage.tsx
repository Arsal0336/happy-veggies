import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  CompatibilityBadge,
  EmptyState,
  ErrorState,
  FormField,
  Input,
  LoadingState,
  type CompatibilityLevel,
} from '@hv/ui';
import {
  useNeighbourWarnings,
  useSeedSuggestions,
  useTwin,
  useZones,
} from '../../shared/api/hooks';
import { farmService } from '../../shared/api/services';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

export function CropZonesPage() {
  const { farmId = '', areaId = '' } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { notifyError, notify } = useNotifications();
  const { data: zones, isLoading, error, refetch } = useZones(farmId, areaId);
  const { data: twin } = useTwin(farmId);
  const { data: warnings } = useNeighbourWarnings(farmId);

  const [label, setLabel] = useState('');
  const [crop, setCrop] = useState('');
  const [cropId, setCropId] = useState('');
  const [seedVarietyId, setSeedVarietyId] = useState('');
  const [areaValue, setAreaValue] = useState('1');
  const [saving, setSaving] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  const suggestionCropKey = cropId.trim() || crop.trim();
  const { data: varieties } = useSeedSuggestions(farmId, suggestionCropKey || undefined);

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

  const edges = twin?.neighbourEdges ?? [];

  const relationFor = (zoneId: string): CompatibilityLevel | null => {
    const edge = edges.find((e) => e.zoneAId === zoneId || e.zoneBId === zoneId);
    return edge?.relation ?? null;
  };

  const warningsFor = (zoneId: string) =>
    (warnings ?? []).filter((w) => w.zoneAId === zoneId || w.zoneBId === zoneId);

  const resetForm = () => {
    setLabel('');
    setCrop('');
    setCropId('');
    setSeedVarietyId('');
    setAreaValue('1');
    setEditingZoneId(null);
  };

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    try {
      if (editingZoneId) {
        await farmService.updateZone(farmId, areaId, editingZoneId, {
          label: label.trim(),
          cropFreetext: crop.trim() || label.trim(),
          cropId: cropId.trim() || undefined,
          seedVarietyId: seedVarietyId || undefined,
          area: { value: Number(areaValue) || 1, unit: 'kanal' },
        });
        notify('success', t('zones.applyVariety'));
      } else {
        await farmService.createZone(farmId, {
          productionAreaId: areaId,
          label: label.trim(),
          cropFreetext: crop.trim() || label.trim(),
          cropId: cropId.trim() || undefined,
          seedVarietyId: seedVarietyId || undefined,
          area: { value: Number(areaValue) || 1, unit: 'kanal' },
        });
        notify('success', t('zones.add'));
      }
      resetForm();
      void qc.invalidateQueries({ queryKey: ['zones', farmId] });
      void qc.invalidateQueries({ queryKey: ['twin', farmId] });
      void qc.invalidateQueries({ queryKey: ['neighbour-warnings', farmId] });
    } catch (err) {
      notifyError(err);
    } finally {
      setSaving(false);
    }
  };

  const onApplyVariety = async (zoneId: string, varietyId: string) => {
    try {
      await farmService.updateZone(farmId, areaId, zoneId, {
        seedVarietyId: varietyId,
      });
      notify('success', t('zones.applyVariety'));
      void qc.invalidateQueries({ queryKey: ['zones', farmId] });
      void qc.invalidateQueries({ queryKey: ['twin', farmId] });
    } catch (err) {
      notifyError(err);
    }
  };

  const onEdit = (zone: {
    id: string;
    label?: string | null;
    cropFreetext?: string | null;
    cropId?: string | null;
    seedVarietyId?: string | null;
    area: { value: number };
  }) => {
    setEditingZoneId(zone.id);
    setLabel(zone.label ?? '');
    setCrop(zone.cropFreetext ?? '');
    setCropId(zone.cropId ?? '');
    setSeedVarietyId(zone.seedVarietyId ?? '');
    setAreaValue(String(zone.area.value));
  };

  const onDelete = async (zoneId: string) => {
    if (!window.confirm(t('zones.confirmDelete'))) return;
    try {
      await farmService.deleteZone(farmId, areaId, zoneId);
      notify('success', t('common.delete'));
      void qc.invalidateQueries({ queryKey: ['zones', farmId] });
      void qc.invalidateQueries({ queryKey: ['twin', farmId] });
      void qc.invalidateQueries({ queryKey: ['neighbour-warnings', farmId] });
    } catch (err) {
      notifyError(err);
    }
  };

  const varietyLabel = (v: { nameEn: string; nameUr: string }) =>
    i18n.language?.startsWith('ur') ? v.nameUr || v.nameEn : v.nameEn;

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('zones.title')}</h1>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/farms/${farmId}/areas`)}
        >
          {t('common.back')}
        </Button>
      </div>

      {(warnings?.length ?? 0) > 0 && (
        <Card padding="md" className="hv-section">
          <h2 className="hv-section-title">{t('zones.neighbourWarnings')}</h2>
          <ul className="hv-stack">
            {warnings!.map((w, i) => (
              <li key={`${w.zoneAId}-${w.zoneBId}-${i}`} className="hv-muted">
                {w.zoneALabel ?? w.zoneAId} ↔ {w.zoneBLabel ?? w.zoneBId}
                {w.reason ? `: ${w.reason}` : ''}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!zones?.length ? (
        <EmptyState title={t('zones.empty')} />
      ) : (
        <ul className="hv-stack">
          {zones.map((zone) => {
            const level = relationFor(zone.id);
            const zoneWarnings = warningsFor(zone.id);
            return (
              <li key={zone.id}>
                <Card padding="md">
                  <div className="hv-row hv-row--between">
                    <div>
                      <strong>{zone.label}</strong>
                      <p className="hv-muted">
                        {zone.cropFreetext ?? zone.cropId ?? '—'} · {zone.area.value}{' '}
                        {zone.area.unit}
                        {zone.growthStage ? ` · ${zone.growthStage}` : ''}
                        {zone.seedVarietyId
                          ? ` · ${t('zones.variety')}: ${zone.seedVarietyId}`
                          : ''}
                      </p>
                      {zoneWarnings.map((w, i) => (
                        <p key={i} className="hv-muted hv-text-sm">
                          {w.reason}
                        </p>
                      ))}
                    </div>
                    <div className="hv-row">
                      {level && (
                        <div>
                          <p className="hv-muted hv-text-sm">{t('zones.neighbours')}</p>
                          <CompatibilityBadge level={level} />
                        </div>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => onEdit(zone)}>
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void onDelete(zone.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Card padding="md" className="hv-section">
        <h2 className="hv-section-title">
          {editingZoneId ? t('zones.edit') : t('zones.add')}
        </h2>
        <form className="hv-stack" onSubmit={(e) => void onAdd(e)}>
          <FormField htmlFor="zone-label" label={t('zones.label')} required>
            <Input id="zone-label" value={label} onChange={(e) => setLabel(e.target.value)} />
          </FormField>
          <FormField htmlFor="zone-crop" label={t('zones.crop')}>
            <Input
              id="zone-crop"
              value={crop}
              onChange={(e) => {
                setCrop(e.target.value);
                setSeedVarietyId('');
              }}
            />
          </FormField>
          <FormField htmlFor="zone-crop-id" label={t('zones.cropId')}>
            <Input
              id="zone-crop-id"
              value={cropId}
              placeholder="tomato"
              onChange={(e) => {
                setCropId(e.target.value);
                setSeedVarietyId('');
              }}
            />
          </FormField>
          <FormField htmlFor="zone-area" label={t('farms.area')}>
            <Input
              id="zone-area"
              type="number"
              step="any"
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
            />
          </FormField>

          {(varieties?.length ?? 0) > 0 && (
            <div className="hv-stack">
              <p className="hv-section-title">{t('zones.varietySuggestions')}</p>
              <ul className="hv-stack">
                {varieties!.map((v) => (
                  <li key={v.id}>
                    <Card padding="sm">
                      <div className="hv-row hv-row--between">
                        <div>
                          <strong>{varietyLabel(v)}</strong>
                          <p className="hv-muted hv-text-sm">
                            {v.varietyType} · {v.riskBand}
                            {v.maturityDays != null ? ` · ${v.maturityDays}d` : ''}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={seedVarietyId === v.id ? 'primary' : 'secondary'}
                          onClick={() => {
                            setSeedVarietyId(v.id);
                            if (editingZoneId) void onApplyVariety(editingZoneId, v.id);
                          }}
                        >
                          {t('zones.applyVariety')}
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="hv-row">
            <Button type="submit" variant="primary" loading={saving}>
              {editingZoneId ? t('common.save') : t('zones.add')}
            </Button>
            {editingZoneId && (
              <Button type="button" variant="ghost" onClick={resetForm}>
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
