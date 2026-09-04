import { FormField } from '../primitives/FormField';
import { cn } from '../utils/cn';

export type RatesUploadPanelProps = {
  onFileChange?: (file: File | null) => void;
  note?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
};

export function RatesUploadPanel({
  onFileChange,
  note = 'Upload a CSV or JSON file of government reference rates. Format TBD — this is a stub ingest control.',
  accept = '.csv,.json,text/csv,application/json',
  disabled,
  className,
}: RatesUploadPanelProps) {
  return (
    <div className={cn('hv-rates-upload', className)}>
      <FormField label="Government rates file" htmlFor="hv-rates-file" hint={note}>
        <input
          id="hv-rates-file"
          className="hv-input"
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(e) => onFileChange?.(e.target.files?.[0] ?? null)}
        />
      </FormField>
      <p className="hv-rates-upload__note">{note}</p>
    </div>
  );
}
