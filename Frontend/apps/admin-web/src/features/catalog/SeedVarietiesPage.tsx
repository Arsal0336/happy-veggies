import { useState } from 'react';
import { Card, Button, Modal, FormField, Input, Select, Badge } from '@hv/ui';
import { fixtureSeedVarieties, fixtureCrops, type SeedVariety } from '@hv/api-types';

export function SeedVarietiesPage() {
  const [varieties, setVarieties] = useState<SeedVariety[]>([...fixtureSeedVarieties]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SeedVariety | null>(null);
  const [form, setForm] = useState({ nameEn: '', nameUr: '', cropId: '', varietyType: '', maturityDays: '' });

  const cropOptions = fixtureCrops.map((c) => ({ value: c.id, label: c.nameEn }));

  const openAdd = () => {
    setEditing(null);
    setForm({ nameEn: '', nameUr: '', cropId: cropOptions[0]?.value ?? '', varietyType: '', maturityDays: '' });
    setModalOpen(true);
  };

  const openEdit = (v: SeedVariety) => {
    setEditing(v);
    setForm({ nameEn: v.nameEn, nameUr: v.nameUr, cropId: v.cropId, varietyType: v.varietyType, maturityDays: String(v.maturityDays ?? '') });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.nameEn.trim() || !form.cropId) return;
    if (editing) {
      setVarieties((prev) =>
        prev.map((v) =>
          v.id === editing.id
            ? { ...v, nameEn: form.nameEn, nameUr: form.nameUr, cropId: form.cropId, varietyType: form.varietyType, maturityDays: form.maturityDays ? Number(form.maturityDays) : undefined }
            : v,
        ),
      );
    } else {
      const id = `variety-${Date.now()}`;
      setVarieties((prev) => [
        ...prev,
        { id, nameEn: form.nameEn, nameUr: form.nameUr, cropId: form.cropId, varietyType: form.varietyType, maturityDays: form.maturityDays ? Number(form.maturityDays) : undefined, enabled: true },
      ]);
    }
    setModalOpen(false);
  };

  const cropName = (id: string) => fixtureCrops.find((c) => c.id === id)?.nameEn ?? id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Seed Varieties</h1>
        <Button size="sm" onClick={openAdd}>+ Add Variety</Button>
      </div>

      <Card padding="none">
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="bg-[var(--hv-color-neutral-50)] border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start px-4 py-3 font-medium">Name</th>
              <th className="text-start px-4 py-3 font-medium">Crop</th>
              <th className="text-start px-4 py-3 font-medium">Type</th>
              <th className="text-start px-4 py-3 font-medium">Maturity</th>
              <th className="text-start px-4 py-3 font-medium">Status</th>
              <th className="text-start px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {varieties.map((v) => (
              <tr key={v.id} className="border-b border-[var(--hv-color-neutral-100)]">
                <td className="px-4 py-3">{v.nameEn}</td>
                <td className="px-4 py-3">{cropName(v.cropId)}</td>
                <td className="px-4 py-3">{v.varietyType}</td>
                <td className="px-4 py-3">{v.maturityDays ? `${v.maturityDays}d` : '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={v.enabled ? 'success' : 'neutral'} size="sm">
                    {v.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(v)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Variety' : 'Add Variety'} footer={
        <>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      }>
        <div className="flex flex-col gap-4">
          <FormField label="Name (English)" required>
            <Input value={form.nameEn} onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))} />
          </FormField>
          <FormField label="Name (Urdu)">
            <Input value={form.nameUr} onChange={(e) => setForm((p) => ({ ...p, nameUr: e.target.value }))} />
          </FormField>
          <FormField label="Crop" required>
            <Select options={cropOptions} value={form.cropId} onChange={(e) => setForm((p) => ({ ...p, cropId: e.target.value }))} />
          </FormField>
          <FormField label="Variety Type">
            <Input value={form.varietyType} onChange={(e) => setForm((p) => ({ ...p, varietyType: e.target.value }))} placeholder="e.g. determinate" />
          </FormField>
          <FormField label="Maturity Days">
            <Input type="number" value={form.maturityDays} onChange={(e) => setForm((p) => ({ ...p, maturityDays: e.target.value }))} />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
