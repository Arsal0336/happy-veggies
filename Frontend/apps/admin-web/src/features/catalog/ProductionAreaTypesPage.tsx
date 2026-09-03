import { useState } from 'react';
import { Card, Button, Modal, FormField, Input, Select, Badge } from '@hv/ui';
import { fixtureProductionAreaTypes, type ProductionAreaType } from '@hv/api-types';

export function ProductionAreaTypesPage() {
  const [types, setTypes] = useState<ProductionAreaType[]>([...fixtureProductionAreaTypes]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductionAreaType | null>(null);
  const [form, setForm] = useState({ nameEn: '', nameUr: '', category: 'open' as ProductionAreaType['category'] });

  const categoryOptions = [
    { value: 'open', label: 'Open' },
    { value: 'protected', label: 'Protected' },
    { value: 'experimental', label: 'Experimental' },
  ];

  const openAdd = () => {
    setEditing(null);
    setForm({ nameEn: '', nameUr: '', category: 'open' });
    setModalOpen(true);
  };

  const openEdit = (t: ProductionAreaType) => {
    setEditing(t);
    setForm({ nameEn: t.nameEn, nameUr: t.nameUr, category: t.category });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.nameEn.trim()) return;
    if (editing) {
      setTypes((prev) =>
        prev.map((t) => (t.code === editing.code ? { ...t, nameEn: form.nameEn, nameUr: form.nameUr, category: form.category } : t)),
      );
    } else {
      const code = form.nameEn.toLowerCase().replace(/\s+/g, '_') as ProductionAreaType['code'];
      setTypes((prev) => [...prev, { code, nameEn: form.nameEn, nameUr: form.nameUr, category: form.category, enabled: true }]);
    }
    setModalOpen(false);
  };

  const toggleEnabled = (code: string) => {
    setTypes((prev) => prev.map((t) => (t.code === code ? { ...t, enabled: !t.enabled } : t)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Production Area Types</h1>
        <Button size="sm" onClick={openAdd}>+ Add Type</Button>
      </div>

      <Card padding="none">
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="bg-[var(--hv-color-neutral-50)] border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start px-4 py-3 font-medium">Code</th>
              <th className="text-start px-4 py-3 font-medium">English</th>
              <th className="text-start px-4 py-3 font-medium">Urdu</th>
              <th className="text-start px-4 py-3 font-medium">Category</th>
              <th className="text-start px-4 py-3 font-medium">Status</th>
              <th className="text-start px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.code} className="border-b border-[var(--hv-color-neutral-100)]">
                <td className="px-4 py-3 font-mono text-[var(--hv-text-xs)]">{t.code}</td>
                <td className="px-4 py-3">{t.nameEn}</td>
                <td className="px-4 py-3">{t.nameUr}</td>
                <td className="px-4 py-3">
                  <Badge variant="neutral" size="sm">{t.category}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={t.enabled ? 'success' : 'neutral'} size="sm">
                    {t.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => toggleEnabled(t.code)}>
                    {t.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Type' : 'Add Type'} footer={
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
          <FormField label="Category" required>
            <Select options={categoryOptions} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ProductionAreaType['category'] }))} />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
