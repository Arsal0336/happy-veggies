import { AuditLogTable, LoadingState, ErrorState } from '@hv/ui';
import { useAdminAuditLogs } from '../../shared/api/useAdmin';
import { fixtureAdminUser } from '../../shared/api/fixtures';

export function AuditLogPage() {
  const { data, isLoading, isError, refetch } = useAdminAuditLogs();

  if (isLoading) return <LoadingState label="Loading audit log…" />;
  if (isError || !data) {
    return <ErrorState title="Could not load audit log" onRetry={() => void refetch()} />;
  }

  const rows = data.map((entry) => ({
    id: entry.id,
    who:
      entry.actorAdminId === fixtureAdminUser.id
        ? fixtureAdminUser.email
        : entry.actorAdminId,
    what: `${entry.action} · ${entry.targetType}/${entry.targetId}`,
    when: new Date(entry.timestamp).toLocaleString(),
  }));

  return <AuditLogTable rows={rows} />;
}
