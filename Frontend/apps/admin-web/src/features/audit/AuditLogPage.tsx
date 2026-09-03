import { useState, useMemo } from 'react';
import { Card, Input, Badge } from '@hv/ui';
import { fixtureAuditLog } from '@hv/api-types';

export function AuditLogPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? fixtureAuditLog.filter(
          (e) =>
            e.action.toLowerCase().includes(q) ||
            e.actorAdminId.toLowerCase().includes(q) ||
            e.targetType.toLowerCase().includes(q) ||
            e.targetId.toLowerCase().includes(q),
        )
      : fixtureAuditLog;
  }, [search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[var(--hv-text-2xl)] font-bold">Audit Log</h1>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search actions, actors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="bg-[var(--hv-color-neutral-50)] border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start px-4 py-3 font-medium">Timestamp</th>
              <th className="text-start px-4 py-3 font-medium">Actor</th>
              <th className="text-start px-4 py-3 font-medium">Action</th>
              <th className="text-start px-4 py-3 font-medium">Target</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-[var(--hv-color-neutral-400)]">
                  No log entries found.
                </td>
              </tr>
            )}
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-b border-[var(--hv-color-neutral-100)] hover:bg-[var(--hv-color-neutral-50)]">
                <td className="px-4 py-3 text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={entry.actorAdminId === 'system' ? 'neutral' : 'info'} size="sm">
                    {entry.actorAdminId}
                  </Badge>
                </td>
                <td className="px-4 py-3">{entry.action}</td>
                <td className="px-4 py-3 text-[var(--hv-text-xs)] font-mono max-w-[12rem] truncate">
                  {entry.targetType}/{entry.targetId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
