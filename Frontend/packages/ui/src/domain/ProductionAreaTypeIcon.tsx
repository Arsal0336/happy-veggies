import { cn } from '../utils/cn';

export type ProductionAreaType =
  | 'open_field'
  | 'shed'
  | 'greenhouse'
  | 'tunnel'
  | 'experimental';

const SHORT: Record<ProductionAreaType, string> = {
  open_field: 'OF',
  shed: 'SH',
  greenhouse: 'GH',
  tunnel: 'TN',
  experimental: 'EX',
};

const TITLE: Record<ProductionAreaType, string> = {
  open_field: 'Open field',
  shed: 'Shed',
  greenhouse: 'Greenhouse',
  tunnel: 'Tunnel',
  experimental: 'Experimental',
};

export type ProductionAreaTypeIconProps = {
  type: ProductionAreaType;
  className?: string;
};

export function ProductionAreaTypeIcon({ type, className }: ProductionAreaTypeIconProps) {
  return (
    <span
      className={cn('hv-area-icon', `hv-area-icon--${type}`, className)}
      title={TITLE[type]}
      aria-label={TITLE[type]}
      role="img"
    >
      {SHORT[type]}
    </span>
  );
}
