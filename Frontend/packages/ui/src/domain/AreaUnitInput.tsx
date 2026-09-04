import { FormField } from '../primitives/FormField';
import { Input } from '../primitives/Input';
import { Select } from '../primitives/Select';
import { cn } from '../utils/cn';

export type AreaUnit = 'acres' | 'kanal' | 'marla' | 'sqm';

export type AreaUnitInputProps = {
  id?: string;
  label?: string;
  value: number | '';
  unit: AreaUnit;
  onValueChange: (value: number | '') => void;
  onUnitChange: (unit: AreaUnit) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

const UNITS: { value: AreaUnit; label: string }[] = [
  { value: 'acres', label: 'Acres' },
  { value: 'kanal', label: 'Kanal' },
  { value: 'marla', label: 'Marla' },
  { value: 'sqm', label: 'm²' },
];

export function AreaUnitInput({
  id = 'area-unit',
  label = 'Area',
  value,
  unit,
  onValueChange,
  onUnitChange,
  error,
  disabled,
  className,
}: AreaUnitInputProps) {
  return (
    <FormField label={label} htmlFor={id} error={error} className={cn('hv-area-unit-field', className)}>
      <div className="hv-area-unit">
        <Input
          id={id}
          type="number"
          min={0}
          step="any"
          value={value === '' ? '' : value}
          disabled={disabled}
          aria-invalid={!!error}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onValueChange('');
              return;
            }
            const n = Number(raw);
            if (!Number.isNaN(n)) onValueChange(n);
          }}
        />
        <Select
          id={`${id}-unit`}
          value={unit}
          disabled={disabled}
          aria-label="Area unit"
          onChange={(e) => onUnitChange(e.target.value as AreaUnit)}
        >
          {UNITS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </Select>
      </div>
    </FormField>
  );
}
