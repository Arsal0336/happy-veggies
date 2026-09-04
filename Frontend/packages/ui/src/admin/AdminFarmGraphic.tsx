import { FarmGraphic } from '../domain/FarmGraphic';
import type { FarmGraphicProps } from '../domain/FarmGraphic';
import { FarmGraphicLegend } from '../domain/FarmGraphicLegend';
import { cn } from '../utils/cn';

export type AdminFarmGraphicProps = Omit<
  FarmGraphicProps,
  'readOnly' | 'onSelectArea' | 'onSelectZone' | 'emptyAction'
> & {
  className?: string;
  showLegend?: boolean;
};

/** Read-only FarmGraphic wrapper for admin farm inspect. */
export function AdminFarmGraphic({
  showLegend = true,
  className,
  ...farmProps
}: AdminFarmGraphicProps) {
  return (
    <div className={cn(className)}>
      <FarmGraphic {...farmProps} readOnly />
      {showLegend && <FarmGraphicLegend />}
    </div>
  );
}
