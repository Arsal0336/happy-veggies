import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

export type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({ items, value, onChange, className }: TabsProps) {
  const active = items.find((t) => t.id === value) ?? items[0];

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap gap-1 border-b border-border" role="tablist">
        {items.map((tab) => {
          const selected = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`hv-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`hv-tabpanel-${tab.id}`}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                selected
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-muted hover:text-foreground',
              )}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div
          role="tabpanel"
          id={`hv-tabpanel-${active.id}`}
          aria-labelledby={`hv-tab-${active.id}`}
        >
          {active.content}
        </div>
      )}
    </div>
  );
}
