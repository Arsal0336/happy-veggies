import type { Provenance } from '@hv/api-types';

export interface ProvenanceBadgeProps {
  provenance: Provenance;
  className?: string;
}

const labels: Record<Provenance, string> = {
  farmer_provided: 'Farmer Provided',
  third_party_estimate: 'Third-Party Estimate',
  observed_measured: 'Observed/Measured',
  system_derived: 'System Derived',
  historical_reference: 'Historical Reference',
};

const colorMap: Record<Provenance, string> = {
  farmer_provided: 'bg-[var(--hv-color-warning-100)] text-[var(--hv-color-warning-700)]',
  third_party_estimate: 'bg-[var(--hv-color-info-100)] text-[var(--hv-color-info-700)]',
  observed_measured: 'bg-[var(--hv-color-success-100)] text-[var(--hv-color-success-700)]',
  system_derived: 'bg-[var(--hv-color-primary-100)] text-[var(--hv-color-primary-700)]',
  historical_reference: 'bg-[var(--hv-color-neutral-100)] text-[var(--hv-color-neutral-700)]',
};

export function ProvenanceBadge({ provenance, className = '' }: ProvenanceBadgeProps) {
  const isVerified = provenance === 'observed_measured';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[var(--hv-text-xs)] font-medium ${colorMap[provenance]} ${className}`}
      title={`Data provenance: ${labels[provenance]}`}
    >
      {isVerified && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {labels[provenance]}
    </span>
  );
}
