import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  width?: string | number;
  height?: string | number;
};

export function Skeleton({ width, height = '1rem', className, style, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-neutral-200', className)}
      aria-hidden="true"
      style={{
        width: width ?? '100%',
        height,
        ...style,
      }}
      {...rest}
    />
  );
}
