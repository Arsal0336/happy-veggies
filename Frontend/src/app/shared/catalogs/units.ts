import type { HvSelectOption } from '../ui/hv-select';

/** Government rate units — mass totals only (rate is PKR per this unit). */
export const RATE_UNIT_OPTIONS: HvSelectOption[] = [
  { value: 'kg', labelKey: 'units.kg' },
  { value: 'maund', labelKey: 'units.maund' },
  { value: 't', labelKey: 'units.ton' },
];

/** Farmer expected-yield units — totals or density (per acre). */
export const YIELD_UNIT_OPTIONS: HvSelectOption[] = [
  { value: 'kg', labelKey: 'units.kg' },
  { value: 'maund', labelKey: 'units.maund' },
  { value: 't', labelKey: 'units.ton' },
  { value: 'kg/acre', labelKey: 'units.kgPerAcre' },
  { value: 'maund/acre', labelKey: 'units.maundPerAcre' },
  { value: 't/acre', labelKey: 'units.tonPerAcre' },
];

export const CURRENCY_OPTIONS: HvSelectOption[] = [
  { value: 'PKR', label: 'PKR' },
  { value: 'USD', label: 'USD' },
];

const KG_PER_MAUND = 40;
const KG_PER_TON = 1000;

type MassKind = 'kg' | 'maund' | 't' | 'kg/acre' | 'maund/acre' | 't/acre';

function normalizeUnit(raw: string | null | undefined): MassKind | null {
  if (!raw?.trim()) return 'kg';
  let u = raw.trim().toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
  u = u.replace(/per/g, '/').replace(/\/+/g, '/');
  const aliases: Record<string, MassKind> = {
    kg: 'kg',
    kilogram: 'kg',
    kilograms: 'kg',
    kgs: 'kg',
    maund: 'maund',
    maunds: 'maund',
    mann: 'maund',
    man: 'maund',
    t: 't',
    ton: 't',
    tons: 't',
    tonne: 't',
    tonnes: 't',
    mt: 't',
    'kg/acre': 'kg/acre',
    'kg/ac': 'kg/acre',
    'kgs/acre': 'kg/acre',
    'maund/acre': 'maund/acre',
    'maunds/acre': 'maund/acre',
    't/acre': 't/acre',
    'ton/acre': 't/acre',
    'tons/acre': 't/acre',
    'tonne/acre': 't/acre',
  };
  return aliases[u] ?? null;
}

function toKg(value: number, unit: MassKind, areaAcres: number): number | null {
  const acres = areaAcres > 0 ? areaAcres : 0;
  switch (unit) {
    case 'kg':
      return value;
    case 'maund':
      return value * KG_PER_MAUND;
    case 't':
      return value * KG_PER_TON;
    case 'kg/acre':
      return value * acres;
    case 'maund/acre':
      return value * KG_PER_MAUND * acres;
    case 't/acre':
      return value * KG_PER_TON * acres;
    default:
      return null;
  }
}

function fromKgTotal(kg: number, rateUnit: MassKind): number | null {
  switch (rateUnit) {
    case 'kg':
    case 'kg/acre':
      return kg;
    case 'maund':
    case 'maund/acre':
      return kg / KG_PER_MAUND;
    case 't':
    case 't/acre':
      return kg / KG_PER_TON;
    default:
      return null;
  }
}

/** Convert yield into rate unit quantity for ExpectedAmount = qty × rate. */
export function yieldToRateUnit(
  yieldValue: number,
  yieldUnit: string | null | undefined,
  rateUnit: string | null | undefined,
  areaAcres: number,
): number | null {
  const from = normalizeUnit(yieldUnit);
  const to = normalizeUnit(rateUnit);
  if (from == null || to == null || !Number.isFinite(yieldValue)) return null;
  const kg = toKg(yieldValue, from, areaAcres);
  if (kg == null) return null;
  return fromKgTotal(kg, to);
}

export function expectedAmount(
  yieldValue: number | null | undefined,
  yieldUnit: string | null | undefined,
  ratePerUnit: number | null | undefined,
  rateUnit: string | null | undefined,
  areaAcres: number,
): number | null {
  if (yieldValue == null || ratePerUnit == null) return null;
  const qty = yieldToRateUnit(yieldValue, yieldUnit, rateUnit ?? 'kg', areaAcres);
  if (qty == null) return null;
  return qty * ratePerUnit;
}
