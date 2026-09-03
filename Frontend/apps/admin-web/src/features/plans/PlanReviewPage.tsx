import { useState } from 'react';
import { Card, Button, Badge } from '@hv/ui';
import { fixtureAdminPlanReviews, type AdminPlanReview } from '@hv/api-types';

export function PlanReviewPage() {
  const [reviews, setReviews] = useState<AdminPlanReview[]>([...fixtureAdminPlanReviews]);
  const [selected, setSelected] = useState<AdminPlanReview | null>(null);

  const updateStatus = (id: string, status: AdminPlanReview['status']) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
  };

  const statusVariant = (s: AdminPlanReview['status']) =>
    s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : 'warning';

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Plan Reviews</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <table className="w-full text-[var(--hv-text-sm)]">
              <thead className="bg-[var(--hv-color-neutral-50)] border-b border-[var(--hv-color-neutral-200)]">
                <tr>
                  <th className="text-start px-4 py-3 font-medium">Farm</th>
                  <th className="text-start px-4 py-3 font-medium">Farmer</th>
                  <th className="text-start px-4 py-3 font-medium">Status</th>
                  <th className="text-start px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`border-b border-[var(--hv-color-neutral-100)] cursor-pointer hover:bg-[var(--hv-color-neutral-50)] ${selected?.id === r.id ? 'bg-[var(--hv-color-primary-50)]' : ''}`}
                  >
                    <td className="px-4 py-3">{r.farmName}</td>
                    <td className="px-4 py-3 text-[var(--hv-color-neutral-500)]">{r.farmerName}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(r.status)} size="sm">{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Detail pane */}
        <div>
          {selected ? (
            <Card padding="md">
              <h3 className="font-semibold mb-2">{selected.farmName}</h3>
              <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)] mb-1">
                Farmer: {selected.farmerName}
              </p>
              <p className="text-[var(--hv-text-sm)] mb-3">
                Status: <Badge variant={statusVariant(selected.status)} size="sm">{selected.status}</Badge>
              </p>
              {selected.flagReason && (
                <div className="bg-amber-50 border border-amber-200 rounded-[var(--hv-radius-md)] p-3 mb-4">
                  <p className="text-[var(--hv-text-xs)] font-medium text-amber-800">Flag Reason</p>
                  <p className="text-[var(--hv-text-sm)] text-amber-700">{selected.flagReason}</p>
                </div>
              )}
              {selected.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateStatus(selected.id, 'approved')}>Approve</Button>
                  <Button variant="danger" size="sm" onClick={() => updateStatus(selected.id, 'rejected')}>Reject</Button>
                </div>
              )}
            </Card>
          ) : (
            <Card padding="md">
              <p className="text-[var(--hv-color-neutral-400)] text-[var(--hv-text-sm)] text-center py-8">
                Select a plan to review
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
