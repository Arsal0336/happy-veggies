import { Button } from '../primitives/Button';
import { EmptyState } from '../primitives/EmptyState';
import { cn } from '../utils/cn';

export type CatalogItem = {
  id: string;
  label: string;
  meta?: string;
};

export type CatalogEditorProps = {
  items: CatalogItem[];
  onAdd?: () => void;
  onSelect?: (id: string) => void;
  title?: string;
  className?: string;
};

export function CatalogEditor({
  items,
  onAdd,
  onSelect,
  title = 'Catalog',
  className,
}: CatalogEditorProps) {
  return (
    <div className={cn('hv-catalog-editor', className)}>
      <div className="hv-catalog-editor__toolbar">
        <Button variant="primary" size="sm" onClick={onAdd}>
          Add {title.toLowerCase()}
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} items`} description="Use Add to create the first entry." />
      ) : (
        <ul className="hv-catalog-editor__list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="hv-catalog-editor__item"
                onClick={() => onSelect?.(item.id)}
                style={{ width: '100%', cursor: onSelect ? 'pointer' : 'default' }}
              >
                <span>
                  <strong>{item.label}</strong>
                  {item.meta && (
                    <span style={{ display: 'block', fontSize: 'var(--hv-text-xs)', color: 'var(--hv-color-text-muted)' }}>
                      {item.meta}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
