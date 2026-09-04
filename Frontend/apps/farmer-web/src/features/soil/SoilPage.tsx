import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  FormField,
  Input,
  LoadingState,
  ProvenanceBadge,
  Select,
  type ProvenanceSource,
} from '@hv/ui';
import { useSoilProfiles, useUpsertSoilProfile } from '../../shared/api/hooks';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

function toBadgeSource(provenance?: string | null): ProvenanceSource {
  const v = (provenance ?? '').toLowerCase();
  if (v.includes('farmer')) return 'farmer';
  if (v.includes('sensor') || v.includes('observed') || v.includes('measured')) {
    return 'sensor';
  }
  if (v.includes('third') || v.includes('provider')) return 'provider';
  if (v.includes('estimat') || v.includes('system') || v.includes('historical')) {
    return 'estimated';
  }
  return 'manual';
}

export function SoilPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifyError, notify } = useNotifications();
  const { data: profiles, isLoading, error, refetch } = useSoilProfiles(farmId);
  const upsert = useUpsertSoilProfile(farmId);

  const primary = profiles?.[0];
  const [soilType, setSoilType] = useState('loam');
  const [texture, setTexture] = useState('');
  const [phValue, setPhValue] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!primary) return;
    setSoilType(primary.soilType ?? 'loam');
    setTexture(primary.texture ?? '');
    setPhValue(primary.phValue != null ? String(primary.phValue) : '');
    setNotes(primary.farmerNotes ?? '');
  }, [primary]);

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

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await upsert.mutateAsync({
        id: primary?.id,
        soilType,
        texture: texture.trim() || null,
        phValue: phValue ? Number(phValue) : null,
        farmerNotes: notes.trim() || null,
        provenance: 'farmer_provided',
      });
      notify('success', t('common.save'));
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('soil.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      {!profiles?.length ? (
        <EmptyState title={t('soil.empty')} description={t('soil.emptyHint')} />
      ) : (
        <ul className="hv-stack hv-section">
          {profiles.map((p) => (
            <li key={p.id}>
              <Card padding="md">
                <div className="hv-row hv-row--between">
                  <div>
                    <strong>{p.soilType ?? t('common.unnamed')}</strong>
                    <p className="hv-muted">
                      {p.texture ? `${p.texture} · ` : ''}
                      {p.phValue != null ? `pH ${p.phValue}` : '—'}
                    </p>
                  </div>
                  <ProvenanceBadge source={toBadgeSource(p.soilTypeProvenance)} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card padding="md" className="hv-section">
        <h2 className="hv-section-title">{t('soil.form')}</h2>
        <form className="hv-stack" onSubmit={(e) => void onSave(e)}>
          <FormField htmlFor="soil-type" label={t('soil.type')}>
            <Select
              id="soil-type"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
            >
              <option value="sandy">{t('setup.soilSandy')}</option>
              <option value="clay">{t('setup.soilClay')}</option>
              <option value="loam">{t('setup.soilLoam')}</option>
              <option value="silt">{t('setup.soilSilt')}</option>
              <option value="mixed">{t('setup.soilMixed')}</option>
              <option value="unknown">{t('setup.soilUnknown')}</option>
            </Select>
          </FormField>
          <FormField htmlFor="soil-texture" label={t('soil.texture')}>
            <Input
              id="soil-texture"
              value={texture}
              onChange={(e) => setTexture(e.target.value)}
            />
          </FormField>
          <FormField htmlFor="soil-ph" label={t('soil.ph')}>
            <Input
              id="soil-ph"
              type="number"
              step="any"
              value={phValue}
              onChange={(e) => setPhValue(e.target.value)}
            />
          </FormField>
          <FormField htmlFor="soil-notes" label={t('soil.notes')}>
            <Input
              id="soil-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>
          <div className="hv-row">
            <ProvenanceBadge source="farmer" />
            <span className="hv-muted">{t('soil.provenanceHint')}</span>
          </div>
          <Button type="submit" variant="primary" loading={upsert.isPending}>
            {t('common.save')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
