import { type ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-[var(--hv-text-sm)] font-medium text-[var(--hv-color-neutral-700)]"
      >
        {label}
        {required && <span className="text-[var(--hv-color-danger-500)] ms-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">{hint}</p>
      )}
      {error && (
        <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-danger-500)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
