import { useState, type FormEvent } from 'react';
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
  Select,
} from '@hv/ui';
import {
  useCreateWaterSource,
  useDeleteWaterSource,
  useWaterSources,
} from '../../shared/api/hooks';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

const TYPE_OPTIONS = [
  'tube_well',
  'canal',
  'rain_fed',
  'reservoir',
  'other',
] as const;

export function WaterPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifyError, notify } = useNotifications();
  const { data: sources, isLoading, error, refetch } = useWaterSources(farmId);
  const createSource = useCreateWaterSource(farmId);
  const deleteSource = useDeleteWaterSource(farmId);

  const [type, setType] = useState<string>('tube_well');
  const [irrigationMethod, setIrrigationMethod] = useState('flood');

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
    try {
      await createSource.mutateAsync({
        type,
        irrigationMethod: irrigationMethod.trim() || null,
        provenance: 'farmer_provided',
      });
      notify('success', t('water.add'));
    } catch (err) {
      notifyError(err);
    }
  };

  const onDelete = async (sourceId: string) => {
    if (!window.confirm(t('water.confirmDelete'))) return;
    try {
      await deleteSource.mutateAsync(sourceId);
      notify('success', t('common.delete'));
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('water.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      {!sources?.length ? (
        <EmptyState title={t('water.empty')} />
      ) : (
        <ul className="hv-stack">
          {sources.map((source) => (
            <li key={source.id}>
              <Card padding="md" className="hv-row hv-row--between">
                <div>
                  <strong>{source.type}</strong>
                  <p className="hv-muted">
                    {source.irrigationMethod ?? '—'}
                    {source.reliability ? ` · ${source.reliability}` : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  loading={deleteSource.isPending}
                  onClick={() => void onDelete(source.id)}
                >
                  {t('common.delete')}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card padding="md" className="hv-section">
        <h2 className="hv-section-title">{t('water.add')}</h2>
        <form className="hv-stack" onSubmit={(e) => void onAdd(e)}>
          <FormField htmlFor="ws-type" label={t('water.type')}>
            <Select
              id="ws-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPE_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {t(`setup.water${code === 'tube_well' ? 'TubeWell' : code === 'canal' ? 'Canal' : code === 'rain_fed' ? 'RainFed' : code === 'reservoir' ? 'Reservoir' : 'Other'}`)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="ws-irrigation" label={t('water.irrigation')}>
            <Input
              id="ws-irrigation"
              value={irrigationMethod}
              onChange={(e) => setIrrigationMethod(e.target.value)}
            />
          </FormField>
          <Button type="submit" variant="primary" loading={createSource.isPending}>
            {t('water.add')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
