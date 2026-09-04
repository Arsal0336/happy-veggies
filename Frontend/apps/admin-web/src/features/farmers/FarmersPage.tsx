import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmersTable, Input, LoadingState, ErrorState } from '@hv/ui';
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
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search name, phone, id…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search farmers"
      />
      <FarmersTable rows={rows} onRowClick={(id) => navigate(`/farmers/${id}`)} />
    </div>
  );
}
