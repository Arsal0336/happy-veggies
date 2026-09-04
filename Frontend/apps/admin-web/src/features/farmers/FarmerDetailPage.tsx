import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  LoadingState,
  ErrorState,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  EmptyState,
} from '@hv/ui';
import { useAdminFarmer } from '../../shared/api/useAdmin';

export function FarmerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAdminFarmer(id);

  if (isLoading) return <LoadingState label="Loading farmer…" />;
  if (isError || !data) {
    return (
      <div>
        <Link to="/farmers">← Farmers</Link>
        <ErrorState title="Farmer not found" onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Link to="/farmers" style={{ fontSize: 'var(--hv-text-sm)' }}>
        ← Farmers
      </Link>

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Card padding="md">
          <p style={{ margin: 0, fontSize: 'var(--hv-text-xs)', color: 'var(--hv-color-text-muted)' }}>
            Phone
          </p>
          <p style={{ margin: '0.25rem 0 0', fontFamily: 'monospace' }}>{data.phone}</p>
        </Card>
        <Card padding="md">
          <p style={{ margin: 0, fontSize: 'var(--hv-text-xs)', color: 'var(--hv-color-text-muted)' }}>
            Language
          </p>
          <p style={{ margin: '0.25rem 0 0' }}>{data.language}</p>
        </Card>
        <Card padding="md">
          <p style={{ margin: 0, fontSize: 'var(--hv-text-xs)', color: 'var(--hv-color-text-muted)' }}>
            Farms
          </p>
          <p style={{ margin: '0.25rem 0 0' }}>{data.farms.length}</p>
        </Card>
      </div>

      <Card padding="md">
        <h2 style={{ marginTop: 0, fontSize: 'var(--hv-text-lg)' }}>Farms (read-only)</h2>
        {data.farms.length === 0 ? (
          <p style={{ color: 'var(--hv-color-text-muted)' }}>No farms.</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Region</TableCell>
                <TableCell as="th">Area</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.farms.map((farm) => (
                <TableRow
                  key={farm.id}
                  className="hv-clickable-row"
                  tabIndex={0}
                  onClick={() => navigate(`/farmers/${data.id}/farms/${farm.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/farmers/${data.id}/farms/${farm.id}`);
                    }
                  }}
                >
                  <TableCell>{farm.name}</TableCell>
                  <TableCell>{farm.regionLabel ?? '—'}</TableCell>
                  <TableCell>
                    {farm.areaLabel ??
                      (farm.areaAcres != null ? `${farm.areaAcres} acre` : '—')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card padding="md">
        <h2 style={{ marginTop: 0, fontSize: 'var(--hv-text-lg)' }}>Plans (read-only)</h2>
        {data.plans.length === 0 ? (
          <EmptyState
            title="No plans on this view"
            description="Farmer detail from this backend does not include plan list."
          />
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {data.plans.map((plan) => (
              <li
                key={plan.id}
                style={{
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--hv-color-border, #e5e7eb)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <strong>{plan.id}</strong>
                  <Badge>v{plan.version}</Badge>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--hv-text-sm)', color: 'var(--hv-color-text-muted)' }}>
                  {plan.summary ?? '—'} · {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
