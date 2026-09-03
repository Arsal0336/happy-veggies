export interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
}

export function Skeleton({
  width,
  height = '1rem',
  variant = 'text',
  className = '',
}: SkeletonProps) {
  const shape =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'rectangular'
        ? 'rounded-[var(--hv-radius-md)]'
        : 'rounded';

  return (
    <div
      className={`animate-pulse bg-[var(--hv-color-neutral-200)] ${shape} ${className}`}
      style={{ width: width ?? '100%', height }}
      aria-hidden="true"
    />
  );
}
