import { useState } from 'react';
import { Card, Button, Modal, FormField, Input, Badge } from '@hv/ui';
import { fixtureGovernmentRates, type GovernmentRate } from '@hv/api-types';

export function GovernmentRatesPage() {
  const [rates, setRates] = useState<GovernmentRate[]>([...fixtureGovernmentRates]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GovernmentRate | null>(null);
  const [form, setForm] = useState({ cropName: '', region: '', ratePerUnit: '', unit: 'kg', effectiveDate: '' });

  const openAdd = () => {
    setEditing(null);
    setForm({ cropName: '', region: '', ratePerUnit: '', unit: 'kg', effectiveDate: '' });
    setModalOpen(true);
  };

  const openEdit = (r: GovernmentRate) => {
    setEditing(r);
    setForm({ cropName: r.cropName, region: r.region, ratePerUnit: String(r.ratePerUnit), unit: r.unit, effectiveDate: r.effectiveDate });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.cropName.trim() || !form.ratePerUnit) return;
    if (editing) {
      setRates((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? { ...r, cropName: form.cropName, region: form.region, ratePerUnit: Number(form.ratePerUnit), unit: form.unit, effectiveDate: form.effectiveDate }
            : r,
        ),
      );
    } else {
      const id = `rate-${Date.now()}`;
      setRates((prev) => [
        ...prev,
        { id, cropId: `crop-${form.cropName.toLowerCase()}`, cropName: form.cropName, region: form.region, ratePerUnit: Number(form.ratePerUnit), unit: form.unit, currency: 'PKR', effectiveDate: form.effectiveDate },
      ]);
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[var(--hv-text-2xl)] font-bold">Government Rates</h1>
        <Button size="sm" onClick={openAdd} className="self-start sm:self-auto">+ Add Rate</Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="bg-[var(--hv-color-neutral-50)] border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start px-4 py-3 font-medium">Crop</th>
              <th className="text-start px-4 py-3 font-medium">Region</th>
              <th className="text-start px-4 py-3 font-medium">Rate / Unit</th>
              <th className="text-start px-4 py-3 font-medium">Effective Date</th>
              <th className="text-start px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.id} className="border-b border-[var(--hv-color-neutral-100)]">
                <td className="px-4 py-3">{r.cropName}</td>
                <td className="px-4 py-3">{r.region}</td>
                <td className="px-4 py-3">
                  <Badge variant="info" size="sm">{r.ratePerUnit.toLocaleString()} {r.currency}/{r.unit}</Badge>
                </td>
                <td className="px-4 py-3 text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
                  {new Date(r.effectiveDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Rate' : 'Add Rate'} footer={
        <>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      }>
        <div className="flex flex-col gap-4">
          <FormField label="Crop Name" required>
            <Input value={form.cropName} onChange={(e) => setForm((p) => ({ ...p, cropName: e.target.value }))} />
          </FormField>
          <FormField label="Region" required>
            <Input value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} />
          </FormField>
          <FormField label="Rate per Unit (PKR)" required>
            <Input type="number" value={form.ratePerUnit} onChange={(e) => setForm((p) => ({ ...p, ratePerUnit: e.target.value }))} />
          </FormField>
          <FormField label="Unit">
            <Input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="kg, 40kg, etc." />
          </FormField>
          <FormField label="Effective Date">
            <Input type="date" value={form.effectiveDate} onChange={(e) => setForm((p) => ({ ...p, effectiveDate: e.target.value }))} />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
