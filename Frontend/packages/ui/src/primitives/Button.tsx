import { type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-[var(--hv-color-primary-600)] text-white hover:bg-[var(--hv-color-primary-700)] active:bg-[var(--hv-color-primary-800)]',
  secondary:
    'bg-[var(--hv-color-secondary-600)] text-white hover:bg-[var(--hv-color-secondary-700)]',
  outline:
    'border border-[var(--hv-color-neutral-300)] text-[var(--hv-color-neutral-700)] hover:bg-[var(--hv-color-neutral-50)]',
  ghost:
    'text-[var(--hv-color-neutral-600)] hover:bg-[var(--hv-color-neutral-100)]',
  danger:
    'bg-[var(--hv-color-danger-500)] text-white hover:bg-red-600',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-2 min-h-10 text-[var(--hv-text-sm)]',
  md: 'px-4 py-2 text-[var(--hv-text-base)]',
  lg: 'px-6 py-3 text-[var(--hv-text-lg)]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-[var(--hv-radius-md)] transition-colors duration-[var(--hv-transition-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hv-color-primary-500)] disabled:opacity-50 disabled:pointer-events-none';

  return (
    <button
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin -ms-1 me-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
