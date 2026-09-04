import { cn } from '../utils/cn';

export type AvatarProps = {
  name?: string;
  className?: string;
};

function initials(name?: string) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800',
        className,
      )}
      aria-hidden={!name}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
