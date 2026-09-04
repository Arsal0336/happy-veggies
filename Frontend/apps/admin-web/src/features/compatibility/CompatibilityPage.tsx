import { useState, type FormEvent } from 'react';
import {
  CompatibilityMatrixEditor,
  LoadingState,
  ErrorState,
  Card,
  Button,
  FormField,
  Input,
  Alert,
} from '@hv/ui';
import {
  useAdminCompatibility,
  useUpsertAdminCompatibility,
} from '../../shared/api/useAdmin';
import type { CompatibilityRelation } from '@hv/api-types';
import { useAdminToast } from '../../shared/ui/AdminToast';

export function CompatibilityPage() {
  const { data, isLoading, isError, refetch } = useAdminCompatibility();
  const upsert = useUpsertAdminCompatibility();
  const { showSuccess, showError } = useAdminToast();
  const [cropAId, setCropAId] = useState('');
  const [cropBId, setCropBId] = useState('');
  const [relation, setRelation] = useState<CompatibilityRelation>('good');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Loading compatibility…" />;
  if (isError || !data) {
    return (
      <ErrorState title="Could not load compatibility" onRetry={() => void refetch()} />
    );
  }

  const onUpsert = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormOk(null);
    if (!cropAId.trim() || !cropBId.trim()) {
      setFormError('Both crop ids are required.');
      return;
    }
    try {
      await upsert.mutateAsync({
        cropAId: cropAId.trim(),
        cropBId: cropBId.trim(),
        relation,
        reason: reason.trim() || undefined,
        enabled: true,
      });
      setFormOk('Compatibility pair saved.');
      showSuccess('Compatibility pair saved');
      setCropAId('');
      setCropBId('');
      setReason('');
    } catch {
      setFormError('Could not save compatibility pair.');
      showError('Could not save compatibility pair');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Card padding="md">
        <h2 style={{ marginTop: 0, fontSize: 'var(--hv-text-lg)' }}>Upsert pair</h2>
        <form
          onSubmit={(e) => void onUpsert(e)}
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            alignItems: 'end',
          }}
        >
          <FormField label="Crop A id" htmlFor="compat-a" required>
            <Input
              id="compat-a"
              value={cropAId}
              onChange={(e) => setCropAId(e.target.value)}
              placeholder="tomato"
            />
          </FormField>
          <FormField label="Crop B id" htmlFor="compat-b" required>
            <Input
              id="compat-b"
              value={cropBId}
              onChange={(e) => setCropBId(e.target.value)}
              placeholder="onion"
            />
          </FormField>
          <FormField label="Relation" htmlFor="compat-rel">
            <select
              id="compat-rel"
              value={relation}
              onChange={(e) => setRelation(e.target.value as CompatibilityRelation)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--hv-radius-md, 8px)',
                border: '1px solid var(--hv-color-border, #ccc)',
              }}
            >
              <option value="good">good</option>
              <option value="avoid">avoid</option>
              <option value="neutral">neutral</option>
            </select>
          </FormField>
          <FormField label="Reason" htmlFor="compat-reason">
            <Input
              id="compat-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FormField>
          <Button type="submit" variant="primary" loading={upsert.isPending}>
            Save pair
          </Button>
        </form>
        {formError && (
          <Alert variant="error" style={{ marginTop: '0.75rem' }}>
            {formError}
          </Alert>
        )}
        {formOk && (
          <Alert variant="success" style={{ marginTop: '0.75rem' }}>
            {formOk}
          </Alert>
        )}
      </Card>
      <CompatibilityMatrixEditor
        pairs={data}
        onSelect={(id) => {
          const pair = data.find((p) => p.id === id);
          if (!pair) return;
          const disable = pair.enabled !== false;
          const ok = window.confirm(
            disable
              ? `Soft-disable ${pair.cropA} ↔ ${pair.cropB}?`
              : `Re-enable ${pair.cropA} ↔ ${pair.cropB}?`,
          );
          if (!ok) return;
          void upsert
            .mutateAsync({
              id: pair.id,
              cropAId: pair.cropA,
              cropBId: pair.cropB,
              relation: pair.relation,
              reason: pair.reason,
              enabled: !disable,
            })
            .catch(() => window.alert('Could not update pair'));
        }}
      />
    </div>
  );
}
