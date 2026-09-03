import { useState } from 'react';
import { Input } from '../primitives/Input';
import { Button } from '../primitives/Button';
import { FormField } from '../primitives/FormField';

export interface MapOrCoordsProps {
  lat?: number;
  lng?: number;
  onSelect?: (lat: number, lng: number) => void;
  className?: string;
}

export function MapOrCoords({ lat, lng, onSelect, className = '' }: MapOrCoordsProps) {
  const [editLat, setEditLat] = useState(lat?.toString() ?? '');
  const [editLng, setEditLng] = useState(lng?.toString() ?? '');

  const handleSet = () => {
    const parsedLat = parseFloat(editLat);
    const parsedLng = parseFloat(editLng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng) && onSelect) {
      onSelect(parsedLat, parsedLng);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-[var(--hv-color-neutral-400)] text-[var(--hv-text-sm)]">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span>Map view coming soon</span>
      </div>

      {onSelect ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <FormField label="Latitude" className="flex-1">
              <Input
                type="number"
                step="any"
                value={editLat}
                onChange={(e) => setEditLat(e.target.value)}
                placeholder="e.g. 31.52"
              />
            </FormField>
            <FormField label="Longitude" className="flex-1">
              <Input
                type="number"
                step="any"
                value={editLng}
                onChange={(e) => setEditLng(e.target.value)}
                placeholder="e.g. 74.35"
              />
            </FormField>
          </div>
          <Button variant="outline" size="sm" onClick={handleSet}>
            📍 Set Location
          </Button>
        </div>
      ) : (
        lat != null && lng != null && (
          <div className="flex items-center gap-2 text-[var(--hv-text-sm)]">
            <span>📍</span>
            <span className="font-medium">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
          </div>
        )
      )}
    </div>
  );
}
