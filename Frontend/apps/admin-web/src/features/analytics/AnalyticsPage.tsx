import { Card } from '@hv/ui';
import { fixtureAdminAnalytics } from '@hv/api-types';

export function AnalyticsPage() {
  const analytics = fixtureAdminAnalytics;
  const maxRequests = Math.max(...analytics.dailyStats.map((d) => d.requests));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[var(--hv-text-2xl)] font-bold">Analytics</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Total Requests</p>
          <p className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-primary-600)]">
            {analytics.totalRequests.toLocaleString()}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">LLM Calls</p>
          <p className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-primary-600)]">
            {analytics.llmCalls.toLocaleString()}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">LLM Cost</p>
          <p className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-primary-600)]">
            {analytics.llmCostPKR.toLocaleString()} PKR
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Avg Response</p>
          <p className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-primary-600)]">
            {analytics.avgResponseMs.toLocaleString()} ms
          </p>
        </Card>
      </div>

      {/* Daily bar chart */}
      <Card padding="md">
        <h2 className="font-semibold mb-4">Daily Requests (Last 7 Days)</h2>
        <div className="overflow-x-auto">
        <div className="flex items-end gap-2 h-40 min-w-[20rem]">
          {analytics.dailyStats.map((day) => {
            const pct = maxRequests > 0 ? (day.requests / maxRequests) * 100 : 0;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
                  {day.requests}
                </span>
                <div
                  className="w-full bg-[var(--hv-color-primary-400)] rounded-t-[var(--hv-radius-sm)]"
                  style={{ height: `${pct}%`, minHeight: '4px' }}
                />
                <span className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-400)]">
                  {day.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
        </div>
      </Card>

      {/* LLM cost breakdown */}
      <Card padding="md">
        <h2 className="font-semibold mb-4">LLM Cost by Day</h2>
        <div className="flex flex-col gap-2">
          {analytics.dailyStats.map((day) => {
            const maxCost = Math.max(...analytics.dailyStats.map((d) => d.cost));
            const pct = maxCost > 0 ? (day.cost / maxCost) * 100 : 0;
            return (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)] w-16">
                  {day.date.slice(5)}
                </span>
                <div className="flex-1 h-5 bg-[var(--hv-color-neutral-100)] rounded-[var(--hv-radius-sm)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--hv-color-secondary-400)] rounded-[var(--hv-radius-sm)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[var(--hv-text-xs)] font-mono w-20 text-end">
                  {day.cost.toLocaleString()} PKR
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
