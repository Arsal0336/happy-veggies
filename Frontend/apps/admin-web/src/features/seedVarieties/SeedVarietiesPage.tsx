import { CatalogEditor, LoadingState, ErrorState } from '@hv/ui';
import {
  useAdminSeedVarieties,
  useCreateAdminSeedVariety,
  useUpdateAdminSeedVariety,
} from '../../shared/api/useAdmin';
import { useAdminToast } from '../../shared/ui/AdminToast';

export function SeedVarietiesPage() {
  const { data, isLoading, isError, refetch } = useAdminSeedVarieties();
  const createVariety = useCreateAdminSeedVariety();
  const updateVariety = useUpdateAdminSeedVariety();
  const { showSuccess, showError } = useAdminToast();

  if (isLoading) return <LoadingState label="Loading seed varieties…" />;
  if (isError || !data) {
    return (
      <ErrorState title="Could not load seed varieties" onRetry={() => void refetch()} />
    );
  }

  return (
    <CatalogEditor
      title="Seed variety"
      items={data.map((v) => ({
        id: v.id,
        label: v.name,
        meta: [
          v.cropName ?? v.cropId,
          v.enabled === false ? 'disabled' : 'enabled',
        ].join(' · '),
      }))}
      onAdd={() => {
        const id = window.prompt('Variety id (slug)');
        if (!id?.trim()) return;
        const cropId = window.prompt('Crop id');
        if (!cropId?.trim()) return;
        const nameEn = window.prompt('English name');
        if (!nameEn?.trim()) return;
        void createVariety
          .mutateAsync({
            id: id.trim(),
            cropId: cropId.trim(),
            nameEn: nameEn.trim(),
          })
          .then(() => showSuccess('Seed variety saved'))
          .catch(() => showError('Could not create seed variety'));
      }}
      onSelect={(id) => {
        const variety = data.find((v) => v.id === id);
        if (!variety) return;
        const disable = variety.enabled !== false;
        const ok = window.confirm(
          disable
            ? `Soft-disable variety "${variety.name}"?`
            : `Re-enable variety "${variety.name}"?`,
        );
        if (!ok) return;
        void updateVariety
          .mutateAsync({ id, input: { enabled: !disable } })
          .then(() => showSuccess(disable ? 'Variety disabled' : 'Variety enabled'))
          .catch(() => showError('Could not update seed variety'));
      }}
    />
  );
}
