import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, ErrorState, FormField, Input, LoadingState } from '@hv/ui';
import { useFarm, useUpdateFarm } from '../../shared/api/hooks';
import { farmService } from '../../shared/api/services';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

export function EditFarmPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: farm, isLoading, error, refetch } = useFarm(farmId);
  const updateFarm = useUpdateFarm(farmId);
  const { notifyError, notify } = useNotifications();
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [regionCode, setRegionCode] = useState('');

  useEffect(() => {
    if (!farm) return;
    setName(farm.name ?? '');
    setRegionCode(farm.regionCode);
  }, [farm]);

  if (isLoading) return <LoadingState label={t('common.loading')} />;
  if (error || !farm) {
    return (
      <ErrorState
        title={t('farms.notFound')}
        onRetry={() => void refetch()}
      />
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateFarm.mutateAsync({
        name: name.trim() || undefined,
        regionCode: regionCode.trim() || farm.regionCode,
        regionLabel: regionCode.trim() || farm.regionLabel,
        lat: farm.lat,
        lng: farm.lng,
      });
      notify('success', t('common.save'));
      navigate(`/farms/${farmId}`);
    } catch (err) {
      notifyError(err);
    }
  };

  const onDelete = async () => {
    if (!window.confirm(t('farms.confirmDelete'))) return;
    setDeleting(true);
    try {
      await farmService.deleteFarm(farmId);
      notify('success', t('common.delete'));
      void qc.invalidateQueries({ queryKey: ['farms'] });
      navigate('/');
    } catch (err) {
      notifyError(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="hv-page">
      <h1 className="hv-page__title">{t('farms.edit')}</h1>
      <Card padding="md">
        <form className="hv-stack" onSubmit={(e) => void onSubmit(e)}>
          <FormField htmlFor="edit-name" label={t('farms.name')}>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField htmlFor="edit-region" label={t('farms.region')}>
            <Input
              id="edit-region"
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
            />
          </FormField>
          <div className="hv-row">
            <Button type="submit" variant="primary" loading={updateFarm.isPending}>
              {t('common.save')}
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Card>

      <Card padding="md" className="hv-section">
        <h2 className="hv-section-title">{t('farms.delete')}</h2>
        <p className="hv-muted">{t('farms.deleteHint')}</p>
        <Button variant="danger" loading={deleting} onClick={() => void onDelete()}>
          {t('common.delete')}
        </Button>
      </Card>
    </div>
  );
}
