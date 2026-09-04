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
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 bg-gradient-to-br from-primary-100 to-primary-200 text-xs font-bold text-primary-800 shadow-sm',
        className,
      )}
      aria-hidden={!name}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
