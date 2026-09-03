/**
 * @hv/ui — Design System
 *
 * Barrel export for all shared UI primitives and domain components.
 * Import from '@hv/ui' in both farmer-web and admin-web.
 */

// Primitives
export { Button } from './primitives/Button';
export type { ButtonProps } from './primitives/Button';

export { Input } from './primitives/Input';
export type { InputProps } from './primitives/Input';

export { Select } from './primitives/Select';
export type { SelectProps } from './primitives/Select';

export { FormField } from './primitives/FormField';
export type { FormFieldProps } from './primitives/FormField';

export { Card } from './primitives/Card';
export type { CardProps } from './primitives/Card';

export { Badge } from './primitives/Badge';
export type { BadgeProps } from './primitives/Badge';

export { Alert } from './primitives/Alert';
export type { AlertProps } from './primitives/Alert';

export { Skeleton } from './primitives/Skeleton';
export type { SkeletonProps } from './primitives/Skeleton';

export { Modal } from './primitives/Modal';
export type { ModalProps } from './primitives/Modal';

export { Tabs } from './primitives/Tabs';
export type { TabsProps, TabItem } from './primitives/Tabs';

export { Spinner } from './primitives/Spinner';
export type { SpinnerProps } from './primitives/Spinner';

export { Toast } from './primitives/Toast';
export type { ToastProps } from './primitives/Toast';

// Domain components
export { ProvenanceBadge } from './domain/ProvenanceBadge';
export type { ProvenanceBadgeProps } from './domain/ProvenanceBadge';

export { CompatibilityBadge } from './domain/CompatibilityBadge';
export type { CompatibilityBadgeProps } from './domain/CompatibilityBadge';

export { ProductionAreaTypeIcon } from './domain/ProductionAreaTypeIcon';
export type { ProductionAreaTypeIconProps } from './domain/ProductionAreaTypeIcon';

export { AreaUnitInput } from './domain/AreaUnitInput';
export type { AreaUnitInputProps } from './domain/AreaUnitInput';

export { EmptyState } from './domain/EmptyState';
export type { EmptyStateProps } from './domain/EmptyState';

export { ErrorState } from './domain/ErrorState';
export type { ErrorStateProps } from './domain/ErrorState';

// FarmGraphic (schematic twin visualization)
export { FarmGraphic } from './domain/FarmGraphic';
export type { FarmGraphicProps } from './domain/FarmGraphic';

export { FarmGraphicLegend } from './domain/FarmGraphicLegend';
export type { FarmGraphicLegendProps } from './domain/FarmGraphicLegend';

export { TwinSummaryPanel } from './domain/TwinSummaryPanel';
export type { TwinSummaryPanelProps } from './domain/TwinSummaryPanel';

export { PlanSectionList } from './domain/PlanSectionList';
export type { PlanSectionListProps } from './domain/PlanSectionList';

export { GreenScoreMeter } from './domain/GreenScoreMeter';
export type { GreenScoreMeterProps } from './domain/GreenScoreMeter';

export { AssistantChat } from './domain/AssistantChat';
export type { AssistantChatProps } from './domain/AssistantChat';

export { AlertList } from './domain/AlertList';
export type { AlertListProps } from './domain/AlertList';

export { MapOrCoords } from './domain/MapOrCoords';
export type { MapOrCoordsProps } from './domain/MapOrCoords';
