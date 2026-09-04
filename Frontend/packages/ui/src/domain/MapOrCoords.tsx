import { FormField } from '../primitives/FormField';
import { Input } from '../primitives/Input';
import { cn } from '../utils/cn';

export type MapOrCoordsProps = {
  latitude: number | '';
  longitude: number | '';
  onLatitudeChange: (value: number | '') => void;
  onLongitudeChange: (value: number | '') => void;
  latError?: string;
  lngError?: string;
  disabled?: boolean;
  className?: string;
};

function parseCoord(raw: string): number | '' {
  if (raw === '' || raw === '-' || raw === '.') return '';
  const n = Number(raw);
  return Number.isNaN(n) ? '' : n;
}

/** Coords-only location input — map library remains TBD-07 (GAP-063). */
export function MapOrCoords({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  latError,
  lngError,
  disabled,
  className,
}: MapOrCoordsProps) {
  return (
    <div className={cn('hv-map-coords', className)}>
      <p className="hv-map-coords__note">Map library TBD — enter coordinates</p>
      <FormField label="Latitude" htmlFor="hv-lat" error={latError}>
        <Input
          id="hv-lat"
          type="number"
          step="any"
          min={-90}
          max={90}
          value={latitude === '' ? '' : latitude}
          disabled={disabled}
          aria-invalid={!!latError}
          onChange={(e) => onLatitudeChange(parseCoord(e.target.value))}
        />
      </FormField>
      <FormField label="Longitude" htmlFor="hv-lng" error={lngError}>
        <Input
          id="hv-lng"
          type="number"
          step="any"
          min={-180}
          max={180}
          value={longitude === '' ? '' : longitude}
          disabled={disabled}
          aria-invalid={!!lngError}
          onChange={(e) => onLongitudeChange(parseCoord(e.target.value))}
        />
      </FormField>
    </div>
  );
}
