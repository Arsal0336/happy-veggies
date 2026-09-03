import { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...rest }, ref) => {
    const base =
      'w-full px-3 py-2 rounded-[var(--hv-radius-md)] border bg-white text-[var(--hv-text-base)] transition-colors duration-[var(--hv-transition-fast)] placeholder:text-[var(--hv-color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--hv-color-primary-500)] focus:border-transparent disabled:bg-[var(--hv-color-neutral-100)] disabled:cursor-not-allowed';

    const border = error
      ? 'border-[var(--hv-color-danger-500)]'
      : 'border-[var(--hv-color-neutral-300)]';

    return (
      <input
        ref={ref}
        className={`${base} ${border} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
    );
  },
);

Input.displayName = 'Input';
