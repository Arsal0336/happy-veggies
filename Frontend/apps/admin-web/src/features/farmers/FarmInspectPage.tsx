import { Link, useParams } from 'react-router-dom';
import {
  AdminFarmGraphic,
  TwinSummaryPanel,
  LoadingState,
  ErrorState,
  Page,
} from '@hv/ui';
import { useAdminFarmTwin } from '../../shared/api/useAdmin';

export function FarmInspectPage() {
  const { id, farmId } = useParams<{ id: string; farmId: string }>();
  const { data, isLoading, isError, refetch } = useAdminFarmTwin(farmId);
  const backHref = id ? `/farmers/${id}` : '/farmers';

  if (isLoading) return <LoadingState label="Loading farm twin…" />;

  if (isError || !data) {
    return (
      <Page className="max-w-4xl gap-4">
        <Link
          to={backHref}
          className="text-sm font-medium text-primary-700 no-underline hover:underline"
        >
          ← Farmer
        </Link>
        <ErrorState title="Farm twin not found" onRetry={() => void refetch()} />
      </Page>
    );
  }

  return (
    <Page className="max-w-4xl gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backHref}
          className="text-sm font-medium text-primary-700 no-underline hover:underline"
        >
          ← Farmer detail
        </Link>
        <p className="m-0 text-sm text-muted">Read-only twin inspection</p>
      </div>

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
    </Page>
  );
}
