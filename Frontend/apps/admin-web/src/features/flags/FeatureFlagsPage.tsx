import { useState } from 'react';
import { Card, Badge } from '@hv/ui';
import { fixtureFeatureFlags, type FeatureFlag } from '@hv/api-types';

export function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([...fixtureFeatureFlags]);

  const toggle = (id: string) => {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Feature Flags</h1>

      <div className="flex flex-col gap-3">
        {flags.map((flag) => (
          <Card key={flag.id} padding="md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{flag.label}</span>
                  <Badge variant={flag.enabled ? 'success' : 'neutral'} size="sm">
                    {flag.enabled ? 'ON' : 'OFF'}
                  </Badge>
                </div>
                <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)]">{flag.description}</p>
                <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-400)] font-mono mt-1">{flag.key}</p>
              </div>
              <button
                onClick={() => toggle(flag.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  flag.enabled ? 'bg-[var(--hv-color-primary-600)]' : 'bg-[var(--hv-color-neutral-300)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    flag.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
