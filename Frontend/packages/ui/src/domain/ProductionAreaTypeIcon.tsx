import type { ProductionAreaTypeCode } from '@hv/api-types';

export interface ProductionAreaTypeIconProps {
  type: ProductionAreaTypeCode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const colorMap: Record<ProductionAreaTypeCode, string> = {
  open_field: 'text-[var(--hv-area-open-field)]',
  shed: 'text-[var(--hv-area-shed)]',
  greenhouse: 'text-[var(--hv-area-greenhouse)]',
  tunnel_polyhouse: 'text-[var(--hv-area-tunnel)]',
  experimental: 'text-[var(--hv-area-experimental)]',
  other_protected: 'text-[var(--hv-color-neutral-500)]',
};

const iconPaths: Record<ProductionAreaTypeCode, string> = {
  open_field: 'M3 15l5-7 4 5 5-8 4 10H3z',
  shed: 'M3 21V9l9-6 9 6v12H3zm3-2h12V10l-6-4-6 4v9z',
  greenhouse: 'M2 20h20V8l-10-6L2 8v12zm2-2V9l8-5 8 5v9H4z',
  tunnel_polyhouse: 'M2 20c0-8 4-14 10-14s10 6 10 14H2zm2-1h16c-.5-6-3.5-11-8-11S4.5 13 4 19z',
  experimental: 'M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z',
  other_protected: 'M3 21V9l9-6 9 6v12H3z',
};

const labels: Record<ProductionAreaTypeCode, string> = {
  open_field: 'Open Field',
  shed: 'Shed',
  greenhouse: 'Greenhouse',
  tunnel_polyhouse: 'Tunnel / Polyhouse',
  experimental: 'Experimental',
  other_protected: 'Other Protected',
};

export function ProductionAreaTypeIcon({
  type,
  size = 'md',
  className = '',
}: ProductionAreaTypeIconProps) {
  return (
    <svg
      className={`${sizeClasses[size]} ${colorMap[type]} ${className}`}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-label={labels[type]}
    >
      <title>{labels[type]}</title>
      <path d={iconPaths[type]} />
    </svg>
  );
}
