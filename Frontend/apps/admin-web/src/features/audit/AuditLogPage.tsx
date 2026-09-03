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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <div className="w-64">
          <Input
            placeholder="Search actions, actors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card padding="none">
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
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--hv-color-neutral-400)]">
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
                <td className="px-4 py-3 text-[var(--hv-text-xs)] font-mono">
                  {entry.targetType}/{entry.targetId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
