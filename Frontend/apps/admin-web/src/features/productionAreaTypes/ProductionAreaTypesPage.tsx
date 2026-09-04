import { CatalogEditor, LoadingState, ErrorState } from '@hv/ui';
import {
  useAdminAreaTypes,
  useCreateAdminAreaType,
  useUpdateAdminAreaType,
} from '../../shared/api/useAdmin';
import { useAdminToast } from '../../shared/ui/AdminToast';

export function ProductionAreaTypesPage() {
  const { data, isLoading, isError, refetch } = useAdminAreaTypes();
  const createType = useCreateAdminAreaType();
  const updateType = useUpdateAdminAreaType();
  const { showSuccess, showError } = useAdminToast();

  if (isLoading) return <LoadingState label="Loading area types…" />;
  if (isError || !data) {
    return <ErrorState title="Could not load area types" onRetry={() => void refetch()} />;
  }

  return (
    <CatalogEditor
      title="Area type"
      items={data.map((t) => ({
        id: t.id,
        label: t.label,
        meta: [
          `${t.code} · ${t.category}`,
          t.enabled === false ? 'disabled' : 'enabled',
        ].join(' · '),
      }))}
      onAdd={() => {
        const code = window.prompt('Type code (e.g. open_field)');
        if (!code?.trim()) return;
        const nameEn = window.prompt('English name');
        if (!nameEn?.trim()) return;
        const category =
          window.prompt('Category: open | protected | experimental', 'open') ??
          'open';
        void createType
          .mutateAsync({
            code: code.trim(),
            nameEn: nameEn.trim(),
            category: category.trim().toLowerCase(),
          })
          .then(() => showSuccess('Area type saved'))
          .catch(() => showError('Could not create area type'));
      }}
      onSelect={(id) => {
        const type = data.find((t) => t.id === id);
        if (!type) return;
        const disable = type.enabled !== false;
        const ok = window.confirm(
          disable
            ? `Soft-disable area type "${type.label}"?`
            : `Re-enable area type "${type.label}"?`,
        );
        if (!ok) return;
        void updateType
          .mutateAsync({ code: type.code, input: { enabled: !disable } })
          .then(() => showSuccess(disable ? 'Area type disabled' : 'Area type enabled'))
          .catch(() => showError('Could not update area type'));
      }}
    />
  );
}
