import { useState, type ChangeEvent } from 'react';
import type { AreaUnit } from '@hv/api-types';

export interface AreaUnitInputProps {
  value?: number;
  unit?: AreaUnit;
  onChange?: (value: number, unit: AreaUnit) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const units: AreaUnit[] = ['kanal', 'marla', 'acre', 'hectare'];

export function AreaUnitInput({
  value: initialValue,
  unit: initialUnit = 'kanal',
  onChange,
  error,
  disabled,
  className = '',
}: AreaUnitInputProps) {
  const [value, setValue] = useState(initialValue ?? 0);
  const [unit, setUnit] = useState<AreaUnit>(initialUnit);

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value) || 0;
    setValue(v);
    onChange?.(v, unit);
  };

  const handleUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const u = e.target.value as AreaUnit;
    setUnit(u);
    onChange?.(value, u);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        type="number"
        min={0}
        step="0.01"
        value={value}
        onChange={handleValueChange}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-[var(--hv-radius-md)] border bg-white text-[var(--hv-text-base)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--hv-color-primary-500)] focus:border-transparent disabled:bg-[var(--hv-color-neutral-100)] ${
          error ? 'border-[var(--hv-color-danger-500)]' : 'border-[var(--hv-color-neutral-300)]'
        }`}
        aria-invalid={error ? 'true' : undefined}
      />
      <select
        value={unit}
        onChange={handleUnitChange}
        disabled={disabled}
        className="px-3 py-2 rounded-[var(--hv-radius-md)] border border-[var(--hv-color-neutral-300)] bg-white text-[var(--hv-text-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--hv-color-primary-500)] disabled:bg-[var(--hv-color-neutral-100)]"
      >
        {units.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
    </div>
  );
}
