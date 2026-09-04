import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type FormFieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn('hv-form-field', className)}>
      <label className="hv-form-field__label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span aria-hidden="true"> *</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <span className="hv-form-field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="hv-form-field__error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
