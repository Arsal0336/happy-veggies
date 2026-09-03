import { Card } from '@hv/ui';
import { fixtureAdminMetrics } from '@hv/api-types';

export function DashboardPage() {
  const metrics = fixtureAdminMetrics;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[var(--hv-text-2xl)] font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Total Farmers</p>
          <p className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-primary-600)]">
            {metrics.totalFarmers.toLocaleString()}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Total Farms</p>
          <p className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-primary-600)]">
            {metrics.totalFarms.toLocaleString()}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Plans Generated</p>
          <p className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-primary-600)]">
            {metrics.plansGenerated.toLocaleString()}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Active Farms</p>
          <p className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-success-600)]">
            {metrics.activeFarms.toLocaleString()}
          </p>
        </Card>
      </div>

      <Card padding="md">
        <h2 className="font-semibold mb-2">LLM Cost</h2>
        <p className="text-[var(--hv-text-lg)] font-bold">
          {metrics.llmCost.amount.toLocaleString()} {metrics.llmCost.currency}
        </p>
      </Card>
    </div>
  );
}
