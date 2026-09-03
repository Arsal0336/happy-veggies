import { type ReactNode, useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({
  items,
  defaultActiveId,
  onChange,
  className = '',
}: TabsProps) {
  const [activeId, setActiveId] = useState(defaultActiveId ?? items[0]?.id ?? '');

  const handleSelect = (id: string) => {
    setActiveId(id);
    onChange?.(id);
  };

  const activeItem = items.find((t) => t.id === activeId);

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex border-b border-[var(--hv-color-neutral-200)] gap-1 overflow-x-auto"
      >
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => handleSelect(tab.id)}
              className={`px-4 py-2 text-[var(--hv-text-sm)] font-medium whitespace-nowrap border-b-2 transition-colors duration-[var(--hv-transition-fast)] disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'border-[var(--hv-color-primary-500)] text-[var(--hv-color-primary-600)]'
                  : 'border-transparent text-[var(--hv-color-neutral-500)] hover:text-[var(--hv-color-neutral-700)] hover:border-[var(--hv-color-neutral-300)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-4">
        {activeItem?.content}
      </div>
    </div>
  );
}
