import { useState } from 'react';
import { Card, Button, Modal, FormField, Input, Badge } from '@hv/ui';
import { fixtureCrops, type Crop } from '@hv/api-types';

export function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([...fixtureCrops]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Crop | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ nameEn: '', nameUr: '', id: '' });

  const openAdd = () => {
    setEditing(null);
    setForm({ nameEn: '', nameUr: '', id: '' });
    setModalOpen(true);
  };

  const openEdit = (crop: Crop) => {
    setEditing(crop);
    setForm({ nameEn: crop.nameEn, nameUr: crop.nameUr, id: crop.id });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.nameEn.trim()) return;
    if (editing) {
      setCrops((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, nameEn: form.nameEn, nameUr: form.nameUr } : c)),
      );
    } else {
      const id = form.id.trim() || `crop-${Date.now()}`;
      setCrops((prev) => [...prev, { id, nameEn: form.nameEn, nameUr: form.nameUr, enabled: true }]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setCrops((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[var(--hv-text-2xl)] font-bold">Crop Catalog</h1>
        <Button size="sm" onClick={openAdd} className="self-start sm:self-auto">+ Add Crop</Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="bg-[var(--hv-color-neutral-50)] border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start px-4 py-3 font-medium">ID</th>
              <th className="text-start px-4 py-3 font-medium">English</th>
              <th className="text-start px-4 py-3 font-medium">Urdu</th>
              <th className="text-start px-4 py-3 font-medium">Status</th>
              <th className="text-start px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop) => (
              <tr key={crop.id} className="border-b border-[var(--hv-color-neutral-100)]">
                <td className="px-4 py-3 font-mono text-[var(--hv-text-xs)] max-w-[8rem] truncate">{crop.id}</td>
                <td className="px-4 py-3">{crop.nameEn}</td>
                <td className="px-4 py-3">{crop.nameUr}</td>
                <td className="px-4 py-3">
                  <Badge variant={crop.enabled ? 'success' : 'neutral'} size="sm">
                    {crop.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(crop)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteId(crop.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Crop' : 'Add Crop'} footer={
        <>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      }>
        <div className="flex flex-col gap-4">
          {!editing && (
            <FormField label="Crop ID" hint="Leave blank to auto-generate">
              <Input value={form.id} onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} placeholder="crop-xxx" />
            </FormField>
          )}
          <FormField label="Name (English)" required>
            <Input value={form.nameEn} onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))} />
          </FormField>
          <FormField label="Name (Urdu)">
            <Input value={form.nameUr} onChange={(e) => setForm((p) => ({ ...p, nameUr: e.target.value }))} />
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" footer={
        <>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </>
      }>
        <p className="text-[var(--hv-text-sm)]">Are you sure you want to delete this crop? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
