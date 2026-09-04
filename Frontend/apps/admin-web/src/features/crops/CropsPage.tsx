import { CatalogEditor, LoadingState, ErrorState } from '@hv/ui';
import { useAdminCrops, useCreateAdminCrop, useUpdateAdminCrop } from '../../shared/api/useAdmin';
import { useAdminToast } from '../../shared/ui/AdminToast';

export function CropsPage() {
  const { data, isLoading, isError, refetch } = useAdminCrops();
  const createCrop = useCreateAdminCrop();
  const updateCrop = useUpdateAdminCrop();
  const { showSuccess, showError } = useAdminToast();

  if (isLoading) return <LoadingState label="Loading crops…" />;
  if (isError || !data) {
    return <ErrorState title="Could not load crops" onRetry={() => void refetch()} />;
  }

  return (
    <CatalogEditor
      title="Crop"
      items={data.map((c) => ({
        id: c.id,
        label: c.name,
        meta: [
          c.enabled === false ? 'disabled' : 'enabled',
          c.nameUr,
        ]
          .filter(Boolean)
          .join(' · '),
      }))}
      onAdd={() => {
        const id = window.prompt('Crop id (slug, e.g. tomato)');
        if (!id?.trim()) return;
        const nameEn = window.prompt('English name');
        if (!nameEn?.trim()) return;
        const nameUr = window.prompt('Urdu name (optional)') ?? undefined;
        void createCrop
          .mutateAsync({
            id: id.trim(),
            nameEn: nameEn.trim(),
            nameUr: nameUr?.trim() || undefined,
          })
          .then(() => showSuccess('Crop saved'))
          .catch(() => showError('Could not create crop'));
      }}
      onSelect={(id) => {
        const crop = data.find((c) => c.id === id);
        if (!crop) return;
        const disable = crop.enabled !== false;
        const ok = window.confirm(
          disable
            ? `Soft-disable crop "${crop.name}"?`
            : `Re-enable crop "${crop.name}"?`,
        );
        if (!ok) return;
        void updateCrop
          .mutateAsync({ id, input: { enabled: !disable } })
          .then(() => showSuccess(disable ? 'Crop disabled' : 'Crop enabled'))
          .catch(() => showError('Could not update crop'));
      }}
    />
  );
}
