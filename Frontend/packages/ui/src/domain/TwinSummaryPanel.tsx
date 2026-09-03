import type { TwinSummary } from '@hv/api-types';
import { Badge } from '../primitives/Badge';

export interface TwinSummaryPanelProps {
  twin: TwinSummary;
  className?: string;
}

export function TwinSummaryPanel({ twin, className = '' }: TwinSummaryPanelProps) {
  const { weather, soil, waterSources, greenSummary } = twin;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {weather?.temperature && (
        <Badge variant="info" size="md">
          🌡️ {weather.temperature.value}{weather.temperature.unit}
        </Badge>
      )}
      {weather?.humidity != null && (
        <Badge variant="info" size="md">
          💧 {weather.humidity}% humidity
        </Badge>
      )}
      {weather?.rainProbability != null && (
        <Badge variant="info" size="md">
          🌧️ {weather.rainProbability}% rain
        </Badge>
      )}
      {soil?.type && (
        <Badge variant="neutral" size="md">
          🌱 {soil.type}
        </Badge>
      )}
      {soil?.ph && (
        <Badge variant="neutral" size="md">
          pH {soil.ph.value}
        </Badge>
      )}
      {waterSources?.[0] && (
        <Badge variant="default" size="md">
          💦 {waterSources[0].type.replace('_', ' ')}
        </Badge>
      )}
      {waterSources?.[0]?.reliability && (
        <Badge
          variant={waterSources[0].reliability === 'reliable' ? 'success' : waterSources[0].reliability === 'unreliable' ? 'warning' : 'neutral'}
          size="md"
        >
          {waterSources[0].reliability}
        </Badge>
      )}
      {greenSummary?.overallScore != null && (
        <Badge variant="success" size="md">
          🌿 {greenSummary.overallScore}/100
        </Badge>
      )}
    </div>
  );
}
