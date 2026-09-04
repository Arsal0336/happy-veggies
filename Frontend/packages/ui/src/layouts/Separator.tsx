import { cn } from '../utils/cn';

export type SeparatorProps = {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
};

export function Separator({ className, orientation = 'horizontal' }: SeparatorProps) {
  return (
    <div
      role="separator"
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
    />
  );
}
