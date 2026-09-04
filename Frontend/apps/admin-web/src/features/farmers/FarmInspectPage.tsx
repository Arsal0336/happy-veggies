import { Link, useParams } from 'react-router-dom';
import {
  AdminFarmGraphic,
  TwinSummaryPanel,
  LoadingState,
  ErrorState,
} from '@hv/ui';
import { useAdminFarmTwin } from '../../shared/api/useAdmin';

export function FarmInspectPage() {
  const { id, farmId } = useParams<{ id: string; farmId: string }>();
  const { data, isLoading, isError, refetch } = useAdminFarmTwin(farmId);

  if (isLoading) return <LoadingState label="Loading farm twin…" />;

  if (isError || !data) {
    return (
      <div>
        <Link to={id ? `/farmers/${id}` : '/farmers'}>← Farmer</Link>
        <ErrorState title="Farm twin not found" onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Link to={id ? `/farmers/${id}` : '/farmers'} style={{ fontSize: 'var(--hv-text-sm)' }}>
        ← Farmer detail
      </Link>
      <TwinSummaryPanel
        weather={data.weather}
        water={data.water}
        greenScore={data.greenScore}
        yieldSummary={data.yieldSummary}
      />
      <AdminFarmGraphic
        farmName={data.farmName}
        areas={data.areas}
        zones={data.zones}
        neighbourEdges={data.neighbourEdges}
      />
    </div>
  );
}
