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
    <div className={cn('hv-tabs', className)}>
      <div className="hv-tabs__list" role="tablist">
        {items.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`hv-tab-${tab.id}`}
            aria-selected={tab.id === active?.id}
            aria-controls={`hv-tabpanel-${tab.id}`}
            className="hv-tabs__tab"
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
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
