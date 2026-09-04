import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmersTable, Input, LoadingState, ErrorState, Page } from '@hv/ui';
import { useAdminFarmers } from '../../shared/api/useAdmin';

export function FarmersPage() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAdminFarmers(q || undefined);

  if (isLoading) return <LoadingState label="Loading farmers…" />;
  if (isError) {
    return <ErrorState title="Could not load farmers" onRetry={() => void refetch()} />;
  }

  const rows =
    data?.map((f) => ({
      id: f.id,
      phone: f.phone,
      name: f.name?.trim() || 'Unnamed',
    })) ?? [];

  return (
    <Page className="max-w-5xl gap-4">
      <p className="m-0 text-sm text-muted">Search and open a farmer to inspect farms and plans.</p>
      <Input
        placeholder="Search name, phone, id…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search farmers"
      />
      <FarmersTable rows={rows} onRowClick={(id) => navigate(`/farmers/${id}`)} />
    </Page>
  );
}
