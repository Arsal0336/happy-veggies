import { type SelectHTMLAttributes, type ReactNode, forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, className = '', children, ...rest }, ref) => {
    const base =
      'w-full px-3 py-2 pe-10 rounded-[var(--hv-radius-md)] border bg-white text-[var(--hv-text-base)] transition-colors duration-[var(--hv-transition-fast)] focus:outline-none focus:ring-2 focus:ring-[var(--hv-color-primary-500)] focus:border-transparent disabled:bg-[var(--hv-color-neutral-100)] disabled:cursor-not-allowed appearance-none';

    const border = error
      ? 'border-[var(--hv-color-danger-500)]'
      : 'border-[var(--hv-color-neutral-300)]';

    return (
      <div className="relative">
        <select
          ref={ref}
          className={`${base} ${border} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        <svg
          className="pointer-events-none absolute top-1/2 end-3 -translate-y-1/2 h-4 w-4 text-[var(--hv-color-neutral-400)]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
    );
  },
);

Select.displayName = 'Select';
