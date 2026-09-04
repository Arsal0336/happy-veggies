import { useState, type FormEvent } from 'react';
import {
  LoadingState,
  ErrorState,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  Button,
  FormField,
  Input,
  Alert,
} from '@hv/ui';
import {
  useAdminRates,
  useCreateAdminRate,
  useUpdateAdminRate,
} from '../../shared/api/useAdmin';

export function GovernmentRatesPage() {
  const { data, isLoading, isError, refetch } = useAdminRates();
  const createRate = useCreateAdminRate();
  const updateRate = useUpdateAdminRate();

  const [cropId, setCropId] = useState('');
  const [ratePerUnit, setRatePerUnit] = useState('');
  const [unit, setUnit] = useState('kg');
  const [currency, setCurrency] = useState('PKR');
  const [period, setPeriod] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Loading rates…" />;
  if (isError || !data) {
    return <ErrorState title="Could not load rates" onRetry={() => void refetch()} />;
  }

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormOk(null);
    const amount = Number(ratePerUnit);
    if (!cropId.trim() || !period.trim() || !Number.isFinite(amount) || amount < 0) {
      setFormError('Crop id, period, and a non-negative rate are required.');
      return;
    }
    try {
      await createRate.mutateAsync({
        cropId: cropId.trim(),
        ratePerUnit: amount,
        unit: unit.trim() || 'kg',
        currency: currency.trim() || 'PKR',
        period: period.trim(),
        sourceLabel: sourceLabel.trim() || undefined,
      });
      setFormOk('Rate created.');
      setCropId('');
      setRatePerUnit('');
      setPeriod('');
      setSourceLabel('');
    } catch {
      setFormError('Could not create rate.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Card padding="md">
        <h2 style={{ marginTop: 0, fontSize: 'var(--hv-text-lg)' }}>Add rate</h2>
        <form
          onSubmit={(e) => void onCreate(e)}
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            alignItems: 'end',
          }}
        >
          <FormField label="Crop id" htmlFor="rate-crop" required>
            <Input
              id="rate-crop"
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              placeholder="crop-tomato"
            />
          </FormField>
          <FormField label="Rate per unit" htmlFor="rate-amount" required>
            <Input
              id="rate-amount"
              type="number"
              min={0}
              step="any"
              value={ratePerUnit}
              onChange={(e) => setRatePerUnit(e.target.value)}
            />
          </FormField>
          <FormField label="Unit" htmlFor="rate-unit">
            <Input id="rate-unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
          </FormField>
          <FormField label="Currency" htmlFor="rate-currency">
            <Input
              id="rate-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </FormField>
          <FormField label="Period" htmlFor="rate-period" required>
            <Input
              id="rate-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="2025-Kharif"
            />
          </FormField>
          <FormField label="Source" htmlFor="rate-source">
            <Input
              id="rate-source"
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
            />
          </FormField>
          <Button type="submit" variant="primary" loading={createRate.isPending}>
            Create
          </Button>
        </form>
        {formError && (
          <Alert variant="error" style={{ marginTop: '0.75rem' }}>
            {formError}
          </Alert>
        )}
        {formOk && (
          <Alert variant="success" style={{ marginTop: '0.75rem' }}>
            {formOk}
          </Alert>
        )}
      </Card>

      <Card padding="md">
        <h2 style={{ marginTop: 0, fontSize: 'var(--hv-text-lg)' }}>Reference rates</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th">Crop</TableCell>
              <TableCell as="th">Amount</TableCell>
              <TableCell as="th">Unit</TableCell>
              <TableCell as="th">Period</TableCell>
              <TableCell as="th">Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>{rate.cropName ?? rate.cropId}</TableCell>
                <TableCell>
                  {rate.currency} {rate.amount.toLocaleString()}
                </TableCell>
                <TableCell>{rate.unit}</TableCell>
                <TableCell>{rate.periodLabel}</TableCell>
                <TableCell>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={
                      updateRate.isPending && updateRate.variables?.id === rate.id
                    }
                    onClick={() =>
                      updateRate.mutate({
                        id: rate.id,
                        input: { isActive: !(rate.isActive ?? true) },
                      })
                    }
                  >
                    {(rate.isActive ?? true) ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
