import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Input, Button } from '@hv/ui';
import { fixtureAdminFarmers } from '@hv/api-types';

const PAGE_SIZE = 5;

export function FarmersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? fixtureAdminFarmers.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.phone.includes(q) ||
            f.region.toLowerCase().includes(q),
        )
      : fixtureAdminFarmers;
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[var(--hv-text-2xl)] font-bold">Farmers</h1>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search name, phone, region…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="bg-[var(--hv-color-neutral-50)] border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start px-4 py-3 font-medium">Name</th>
              <th className="text-start px-4 py-3 font-medium">Phone</th>
              <th className="text-start px-4 py-3 font-medium">Region</th>
              <th className="text-start px-4 py-3 font-medium">Farms</th>
              <th className="text-start px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)]">
                  No farmers match your search.
                </td>
              </tr>
            )}
            {paged.map((f) => (
              <tr key={f.id} className="border-b border-[var(--hv-color-neutral-100)] hover:bg-[var(--hv-color-neutral-50)]">
                <td className="px-4 py-3">
                  <Link to={`/farmers/${f.id}`} className="text-[var(--hv-color-primary-600)] hover:underline">
                    {f.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-[var(--hv-text-xs)]">{f.phone}</td>
                <td className="px-4 py-3">{f.region}</td>
                <td className="px-4 py-3">{f.farmsCount}</td>
                <td className="px-4 py-3 text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
                  {new Date(f.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
            Previous
          </Button>
          <span className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)]">
            Page {safePage} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
