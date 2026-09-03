import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, Button, Tabs, CompatibilityBadge, Input, Select, FormField, Modal,
  Spinner, ErrorState, EmptyState, FarmGraphic,
} from '@hv/ui';
import {
  fixtureCrops, fixtureCompatibility,
  type LandUnit, type ProductionAreaTypeCode, type ProductionArea, type CropZone,
} from '@hv/api-types';
import { useFarm, useAreas, useZones, useTwin } from '../../shared/api/hooks';
import { ZoneDrawer } from './ZoneDrawer';

const landUnitOptions: { value: LandUnit; label: string }[] = [
  { value: 'kanal', label: 'Kanal' },
  { value: 'marla', label: 'Marla' },
  { value: 'acre', label: 'Acre' },
  { value: 'hectare', label: 'Hectare' },
];

const areaTypeLabelByCode: Record<ProductionAreaTypeCode, string> = {
  open_field: 'Open Field',
  shed: 'Shed',
  greenhouse: 'Greenhouse',
  tunnel_polyhouse: 'Tunnel / Polyhouse',
  experimental: 'Experimental',
  other_protected: 'Other Protected',
};

const areaTypeSelectOptions: { value: ProductionAreaTypeCode; label: string }[] = [
  { value: 'open_field', label: areaTypeLabelByCode.open_field },
  { value: 'shed', label: areaTypeLabelByCode.shed },
  { value: 'greenhouse', label: areaTypeLabelByCode.greenhouse },
  { value: 'tunnel_polyhouse', label: areaTypeLabelByCode.tunnel_polyhouse },
  { value: 'experimental', label: areaTypeLabelByCode.experimental },
  { value: 'other_protected', label: areaTypeLabelByCode.other_protected },
];

const protectedTypes: ProductionAreaTypeCode[] = ['greenhouse', 'tunnel_polyhouse', 'shed', 'other_protected'];

const toAcre = (value: number, unit: LandUnit): number => {
  if (!Number.isFinite(value)) return 0;
  switch (unit) {
    case 'acre': return value;
    case 'hectare': return value * 2.47105;
    case 'marla': return value / 160;
    case 'kanal': default: return value / 8;
  }
};

export function FarmDetailPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!farmId) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--hv-color-neutral-500)]">{t('farm.notFound')}</p>
        <Button variant="outline" onClick={() => navigate('/farms')} className="mt-4">{t('common.back')}</Button>
      </div>
    );
  }

  const { data: farm, isLoading: farmLoading, error: farmError } = useFarm(farmId);
  const { data: areasData } = useAreas(farmId);
  const { data: zonesData } = useZones(farmId);
  const { data: twin } = useTwin(farmId);

  const [localAreas, setLocalAreas] = useState<ProductionArea[]>([]);
  const [localZones, setLocalZones] = useState<CropZone[]>([]);
  const [deletedAreaIds, setDeletedAreaIds] = useState<Set<string>>(new Set());
  const [deletedZoneIds, setDeletedZoneIds] = useState<Set<string>>(new Set());

  const areas = [...(areasData ?? []), ...localAreas].filter((a) => !deletedAreaIds.has(a.id));
  const zones = [...(zonesData ?? []), ...localZones].filter((z) => !deletedZoneIds.has(z.id));
  const neighbourEdges = twin?.neighbourEdges ?? [];
  const zonesById = new Map(zones.map((z) => [z.id, z]));
  const edgesForThisFarm = neighbourEdges.filter(
    (e) => zonesById.has(e.zoneAId) && zonesById.has(e.zoneBId),
  );

  // --- Add Area ---
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaTypeCode, setNewAreaTypeCode] = useState<ProductionAreaTypeCode>('open_field');
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaValue, setNewAreaValue] = useState('1');
  const [newAreaUnit, setNewAreaUnit] = useState<LandUnit>('kanal');
  // Env attributes for protected types
  const [newAreaTemp, setNewAreaTemp] = useState('');
  const [newAreaHumidity, setNewAreaHumidity] = useState('');
  const [newAreaVentilation, setNewAreaVentilation] = useState('');

  // --- Edit Area ---
  const [editingArea, setEditingArea] = useState<ProductionArea | null>(null);
  const [editAreaName, setEditAreaName] = useState('');
  const [editAreaValue, setEditAreaValue] = useState('');
  const [editAreaUnit, setEditAreaUnit] = useState<LandUnit>('kanal');
  const [editAreaTemp, setEditAreaTemp] = useState('');
  const [editAreaHumidity, setEditAreaHumidity] = useState('');
  const [editAreaVentilation, setEditAreaVentilation] = useState('');

  // --- Delete Area ---
  const [deleteAreaConfirm, setDeleteAreaConfirm] = useState<string | null>(null);

  // --- Add Zone ---
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneProductionAreaId, setNewZoneProductionAreaId] = useState<string>('');
  const [newZoneLabel, setNewZoneLabel] = useState('');
  const [newZoneAreaValue, setNewZoneAreaValue] = useState('1');
  const [newZoneAreaUnit, setNewZoneAreaUnit] = useState<LandUnit>('kanal');
  const [newZoneCropId, setNewZoneCropId] = useState<string>(() => fixtureCrops.find((c) => c.enabled)?.id ?? '');
  const [newZoneNeighbourIds, setNewZoneNeighbourIds] = useState<string[]>([]);

  // --- Edit Zone ---
  const [editingZone, setEditingZone] = useState<CropZone | null>(null);
  const [editZoneLabel, setEditZoneLabel] = useState('');
  const [editZoneAreaValue, setEditZoneAreaValue] = useState('');
  const [editZoneAreaUnit, setEditZoneAreaUnit] = useState<LandUnit>('kanal');
  const [editZoneCropId, setEditZoneCropId] = useState('');
  const [editZoneNeighbourIds, setEditZoneNeighbourIds] = useState<string[]>([]);

  // --- Delete Zone ---
  const [deleteZoneConfirm, setDeleteZoneConfirm] = useState<string | null>(null);

  // --- Zone Drawer ---
  const [drawerZoneId, setDrawerZoneId] = useState<string | null>(null);

  // --- Neighbour compatibility warning ---
  const [compatWarnings, setCompatWarnings] = useState<string[]>([]);

  const checkNeighbourCompat = (cropId: string | undefined, neighbourIds: string[]) => {
    if (!cropId) return [];
    const warnings: string[] = [];
    for (const nId of neighbourIds) {
      const nZone = zonesById.get(nId);
      if (!nZone?.cropId) continue;
      const pair = fixtureCompatibility.find(
        (c) =>
          (c.cropAId === cropId && c.cropBId === nZone.cropId) ||
          (c.cropBId === cropId && c.cropAId === nZone.cropId),
      );
      if (pair?.relation === 'avoid') {
        const cropA = fixtureCrops.find((c) => c.id === cropId)?.nameEn ?? cropId;
        const cropB = fixtureCrops.find((c) => c.id === nZone.cropId)?.nameEn ?? nZone.cropId;
        warnings.push(`⚠️ ${cropA} + ${cropB}: ${pair.reason}`);
      }
    }
    return warnings;
  };

  if (farmLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (farmError) return <ErrorState error={farmError instanceof Error ? farmError : String(farmError)} />;
  if (!farm) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--hv-color-neutral-500)]">{t('farm.notFound')}</p>
        <Button variant="outline" onClick={() => navigate('/farms')} className="mt-4">{t('common.back')}</Button>
      </div>
    );
  }

  // --- Handlers ---
  const handleAddArea = () => {
    const numericValue = Number(newAreaValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return;
    const now = new Date().toISOString();
    const id = `area-local-${Date.now()}`;
    const typeCode = newAreaTypeCode;
    const typeLabel = areaTypeLabelByCode[typeCode];

    const envAttributes: Record<string, { value: number; unit: string } | string | null> = {};
    if (protectedTypes.includes(typeCode)) {
      if (newAreaTemp) envAttributes.temperature = { value: Number(newAreaTemp), unit: '°C' };
      if (newAreaHumidity) envAttributes.humidity = { value: Number(newAreaHumidity), unit: '%' };
      if (newAreaVentilation) envAttributes.ventilation = newAreaVentilation;
    }

    const newArea: ProductionArea = {
      id,
      farmId: farm.id,
      typeCode,
      typeLabel,
      name: newAreaName.trim() || typeLabel,
      areaValue: numericValue,
      areaUnit: newAreaUnit,
      areaCanonical: toAcre(numericValue, newAreaUnit),
      canonicalUnit: 'acre',
      envAttributes: Object.keys(envAttributes).length > 0 ? envAttributes : undefined,
      createdAt: now,
      updatedAt: now,
    };
    setLocalAreas((prev) => [...prev, newArea]);
    setIsAddingArea(false);
    setNewAreaName('');
    setNewAreaValue('1');
    setNewAreaUnit('kanal');
    setNewAreaTemp('');
    setNewAreaHumidity('');
    setNewAreaVentilation('');
  };

  const handleEditArea = () => {
    if (!editingArea) return;
    const numericValue = Number(editAreaValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return;

    const envAttributes: Record<string, { value: number; unit: string } | string | null> = {};
    if (protectedTypes.includes(editingArea.typeCode)) {
      if (editAreaTemp) envAttributes.temperature = { value: Number(editAreaTemp), unit: '°C' };
      if (editAreaHumidity) envAttributes.humidity = { value: Number(editAreaHumidity), unit: '%' };
      if (editAreaVentilation) envAttributes.ventilation = editAreaVentilation;
    }

    const updated: ProductionArea = {
      ...editingArea,
      name: editAreaName.trim() || editingArea.name,
      areaValue: numericValue,
      areaUnit: editAreaUnit,
      areaCanonical: toAcre(numericValue, editAreaUnit),
      envAttributes: Object.keys(envAttributes).length > 0 ? envAttributes : editingArea.envAttributes,
      updatedAt: new Date().toISOString(),
    };

    // Replace in local or mark remote as replaced
    setLocalAreas((prev) => {
      const idx = prev.findIndex((a) => a.id === editingArea.id);
      return idx >= 0
        ? prev.map((a) => (a.id === editingArea.id ? updated : a))
        : [...prev.filter((a) => a.id !== editingArea.id), updated];
    });
    // If it was from areasData, soft-delete original and add updated to local
    if (areasData?.some((a) => a.id === editingArea.id)) {
      setDeletedAreaIds((prev) => new Set(prev).add(editingArea.id));
      setLocalAreas((prev) => [...prev.filter((a) => a.id !== editingArea.id), updated]);
    }
    setEditingArea(null);
  };

  const handleDeleteArea = (areaId: string) => {
    setDeletedAreaIds((prev) => new Set(prev).add(areaId));
    setLocalAreas((prev) => prev.filter((a) => a.id !== areaId));
    // Also delete zones belonging to this area
    const zoneIdsToDelete = zones.filter((z) => z.productionAreaId === areaId).map((z) => z.id);
    setDeletedZoneIds((prev) => {
      const next = new Set(prev);
      zoneIdsToDelete.forEach((id) => next.add(id));
      return next;
    });
    setLocalZones((prev) => prev.filter((z) => z.productionAreaId !== areaId));
    setDeleteAreaConfirm(null);
  };

  const openEditArea = (area: ProductionArea) => {
    setEditingArea(area);
    setEditAreaName(area.name);
    setEditAreaValue(String(area.areaValue));
    setEditAreaUnit(area.areaUnit as LandUnit);
    const env = area.envAttributes ?? {};
    const temp = env.temperature;
    setEditAreaTemp(temp && typeof temp === 'object' && 'value' in temp ? String(temp.value) : '');
    const hum = env.humidity;
    setEditAreaHumidity(hum && typeof hum === 'object' && 'value' in hum ? String(hum.value) : '');
    const vent = env.ventilation;
    setEditAreaVentilation(typeof vent === 'string' ? vent : '');
  };

  const handleAddZone = () => {
    const numericValue = Number(newZoneAreaValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return;
    if (!newZoneProductionAreaId) return;
    const now = new Date().toISOString();
    const id = `zone-local-${Date.now()}`;

    const warnings = checkNeighbourCompat(newZoneCropId, newZoneNeighbourIds);
    setCompatWarnings(warnings);

    const newZone: CropZone = {
      id,
      productionAreaId: newZoneProductionAreaId,
      farmId: farm.id,
      label: newZoneLabel.trim() || 'New Zone',
      area: numericValue,
      areaUnit: newZoneAreaUnit,
      cropId: newZoneCropId || undefined,
      isExperimental: false,
      neighbourIds: newZoneNeighbourIds.length > 0 ? newZoneNeighbourIds : undefined,
      createdAt: now,
      updatedAt: now,
    };
    setLocalZones((prev) => [...prev, newZone]);
    setIsAddingZone(false);
    setNewZoneLabel('');
    setNewZoneAreaValue('1');
    setNewZoneAreaUnit('kanal');
    setNewZoneNeighbourIds([]);
  };

  const handleEditZone = () => {
    if (!editingZone) return;
    const numericValue = Number(editZoneAreaValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return;

    const warnings = checkNeighbourCompat(editZoneCropId, editZoneNeighbourIds);
    setCompatWarnings(warnings);

    const updated: CropZone = {
      ...editingZone,
      label: editZoneLabel.trim() || editingZone.label,
      area: numericValue,
      areaUnit: editZoneAreaUnit,
      cropId: editZoneCropId || undefined,
      neighbourIds: editZoneNeighbourIds.length > 0 ? editZoneNeighbourIds : undefined,
      updatedAt: new Date().toISOString(),
    };

    setLocalZones((prev) => {
      const idx = prev.findIndex((z) => z.id === editingZone.id);
      return idx >= 0
        ? prev.map((z) => (z.id === editingZone.id ? updated : z))
        : [...prev.filter((z) => z.id !== editingZone.id), updated];
    });
    if (zonesData?.some((z) => z.id === editingZone.id)) {
      setDeletedZoneIds((prev) => new Set(prev).add(editingZone.id));
      setLocalZones((prev) => [...prev.filter((z) => z.id !== editingZone.id), updated]);
    }
    setEditingZone(null);
  };

  const openEditZone = (zone: CropZone) => {
    setEditingZone(zone);
    setEditZoneLabel(zone.label);
    setEditZoneAreaValue(String(zone.area));
    setEditZoneAreaUnit(zone.areaUnit as LandUnit);
    setEditZoneCropId(zone.cropId ?? '');
    setEditZoneNeighbourIds(zone.neighbourIds ?? []);
    setCompatWarnings([]);
  };

  const handleDeleteZone = (zoneId: string) => {
    setDeletedZoneIds((prev) => new Set(prev).add(zoneId));
    setLocalZones((prev) => prev.filter((z) => z.id !== zoneId));
    setDeleteZoneConfirm(null);
  };

  const toggleNeighbour = (list: string[], setList: (v: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  // Env attributes form for protected area types
  const envAttributesFields = (
    typeCode: ProductionAreaTypeCode,
    temp: string, setTemp: (v: string) => void,
    humidity: string, setHumidity: (v: string) => void,
    ventilation: string, setVentilation: (v: string) => void,
  ) =>
    protectedTypes.includes(typeCode) ? (
      <div className="flex flex-col gap-3 p-3 bg-[var(--hv-color-neutral-50)] rounded">
        <p className="text-[var(--hv-text-xs)] font-medium text-[var(--hv-color-neutral-500)]">Environment Attributes</p>
        <FormField label="Temperature (°C)">
          <Input type="number" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="25" />
        </FormField>
        <FormField label="Humidity (%)">
          <Input type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} placeholder="65" />
        </FormField>
        <FormField label="Ventilation">
          <Input value={ventilation} onChange={(e) => setVentilation(e.target.value)} placeholder="e.g., Natural / Fan-based" />
        </FormField>
      </div>
    ) : null;

  // Neighbour selection UI
  const neighbourPicker = (
    currentZoneId: string | undefined,
    selectedIds: string[],
    setSelectedIds: (v: string[]) => void,
  ) => {
    const otherZones = zones.filter((z) => z.id !== currentZoneId);
    return otherZones.length > 0 ? (
      <FormField label="Adjacent zones (neighbours)">
        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
          {otherZones.map((z) => (
            <label key={z.id} className="flex items-center gap-2 cursor-pointer text-[var(--hv-text-sm)]">
              <input
                type="checkbox"
                checked={selectedIds.includes(z.id)}
                onChange={() => toggleNeighbour(selectedIds, setSelectedIds, z.id)}
                className="w-4 h-4"
              />
              {z.label}
            </label>
          ))}
        </div>
      </FormField>
    ) : null;
  };

  const tabItems = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="flex flex-col gap-4">
          <FarmGraphic
            areas={areas}
            zones={zones}
            neighbourEdges={edgesForThisFarm}
            onZoneClick={(zoneId) => setDrawerZoneId(zoneId)}
          />
          {/* Compat warnings */}
          {compatWarnings.length > 0 && (
            <div className="flex flex-col gap-1">
              {compatWarnings.map((w, i) => (
                <div key={i} className="text-[var(--hv-text-sm)] text-red-600 flex items-center gap-1">
                  <CompatibilityBadge relation="avoid" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'areas',
      label: t('farm.productionAreas'),
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">{areas.length} areas</p>
            <Button variant="primary" size="sm" onClick={() => { setIsAddingArea(true); setIsAddingZone(false); }}>Add area</Button>
          </div>

          {areas.length === 0 && (
            <EmptyState
              title="No production areas"
              description="Add a production area to start managing your farm."
              action={{ label: 'Add production area', onClick: () => setIsAddingArea(true) }}
            />
          )}

          {areas.map((area) => (
            <Card key={area.id} padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{area.name}</p>
                  <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
                    {area.typeLabel} — {area.areaValue} {area.areaUnit}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => openEditArea(area)}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteAreaConfirm(area.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Add Area Modal */}
          <Modal
            open={isAddingArea}
            onClose={() => setIsAddingArea(false)}
            title="Add Production Area"
            footer={
              <>
                <Button variant="outline" onClick={() => setIsAddingArea(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleAddArea}>Save</Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <FormField label="Type">
                <Select value={newAreaTypeCode} onChange={(e) => setNewAreaTypeCode(e.target.value as ProductionAreaTypeCode)} options={areaTypeSelectOptions} />
              </FormField>
              <FormField label="Name">
                <Input value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} placeholder="e.g., North Field" />
              </FormField>
              <FormField label="Area">
                <div className="flex gap-2">
                  <Input type="number" value={newAreaValue} onChange={(e) => setNewAreaValue(e.target.value)} className="flex-1" />
                  <Select value={newAreaUnit} onChange={(e) => setNewAreaUnit(e.target.value as LandUnit)} options={landUnitOptions} />
                </div>
              </FormField>
              {envAttributesFields(newAreaTypeCode, newAreaTemp, setNewAreaTemp, newAreaHumidity, setNewAreaHumidity, newAreaVentilation, setNewAreaVentilation)}
            </div>
          </Modal>

          {/* Edit Area Modal */}
          <Modal
            open={!!editingArea}
            onClose={() => setEditingArea(null)}
            title="Edit Production Area"
            footer={
              <>
                <Button variant="outline" onClick={() => setEditingArea(null)}>Cancel</Button>
                <Button variant="primary" onClick={handleEditArea}>Save</Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <FormField label="Name">
                <Input value={editAreaName} onChange={(e) => setEditAreaName(e.target.value)} />
              </FormField>
              <FormField label="Area">
                <div className="flex gap-2">
                  <Input type="number" value={editAreaValue} onChange={(e) => setEditAreaValue(e.target.value)} className="flex-1" />
                  <Select value={editAreaUnit} onChange={(e) => setEditAreaUnit(e.target.value as LandUnit)} options={landUnitOptions} />
                </div>
              </FormField>
              {editingArea && envAttributesFields(editingArea.typeCode, editAreaTemp, setEditAreaTemp, editAreaHumidity, setEditAreaHumidity, editAreaVentilation, setEditAreaVentilation)}
            </div>
          </Modal>

          {/* Delete Area Confirm */}
          <Modal
            open={!!deleteAreaConfirm}
            onClose={() => setDeleteAreaConfirm(null)}
            title="Delete Production Area"
            footer={
              <>
                <Button variant="outline" onClick={() => setDeleteAreaConfirm(null)}>Cancel</Button>
                <Button variant="primary" onClick={() => deleteAreaConfirm && handleDeleteArea(deleteAreaConfirm)}>Delete</Button>
              </>
            }
          >
            <p className="text-[var(--hv-text-sm)]">Are you sure? This will also remove all zones in this area.</p>
          </Modal>
        </div>
      ),
    },
    {
      id: 'zones',
      label: t('farm.cropZones'),
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">{zones.length} zones</p>
            <Button variant="primary" size="sm" onClick={() => { setIsAddingZone(true); setIsAddingArea(false); setNewZoneProductionAreaId(areas[0]?.id ?? ''); }}>Add zone</Button>
          </div>

          {zones.length === 0 && (
            <EmptyState
              title="No crop zones"
              description="Add a zone to start planting crops."
              action={areas.length > 0 ? { label: 'Add zone', onClick: () => { setIsAddingZone(true); setNewZoneProductionAreaId(areas[0]?.id ?? ''); } } : undefined}
            />
          )}

          {zones.map((zone) => (
            <Card key={zone.id} padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{zone.label}</p>
                  <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
                    {zone.area} {zone.areaUnit} — {zone.growthStage ?? t('farm.notPlanted')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => openEditZone(zone)}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteZoneConfirm(zone.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Add Zone Modal */}
          <Modal
            open={isAddingZone}
            onClose={() => setIsAddingZone(false)}
            title="Add Crop Zone"
            footer={
              <>
                <Button variant="outline" onClick={() => setIsAddingZone(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleAddZone} disabled={!newZoneProductionAreaId}>Save</Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <FormField label="Production area">
                <Select value={newZoneProductionAreaId} onChange={(e) => setNewZoneProductionAreaId(e.target.value)} options={areas.map((a) => ({ value: a.id, label: a.name }))} />
              </FormField>
              <FormField label="Zone label">
                <Input value={newZoneLabel} onChange={(e) => setNewZoneLabel(e.target.value)} placeholder="e.g., Tomato Section" />
              </FormField>
              <FormField label="Area">
                <div className="flex gap-2">
                  <Input type="number" value={newZoneAreaValue} onChange={(e) => setNewZoneAreaValue(e.target.value)} className="flex-1" />
                  <Select value={newZoneAreaUnit} onChange={(e) => setNewZoneAreaUnit(e.target.value as LandUnit)} options={landUnitOptions} />
                </div>
              </FormField>
              <FormField label="Crop">
                <Select value={newZoneCropId} onChange={(e) => setNewZoneCropId(e.target.value)} options={fixtureCrops.filter((c) => c.enabled).map((c) => ({ value: c.id, label: c.nameEn }))} />
              </FormField>
              {neighbourPicker(undefined, newZoneNeighbourIds, setNewZoneNeighbourIds)}
            </div>
          </Modal>

          {/* Edit Zone Modal */}
          <Modal
            open={!!editingZone}
            onClose={() => setEditingZone(null)}
            title="Edit Crop Zone"
            footer={
              <>
                <Button variant="outline" onClick={() => setEditingZone(null)}>Cancel</Button>
                <Button variant="primary" onClick={handleEditZone}>Save</Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <FormField label="Zone label">
                <Input value={editZoneLabel} onChange={(e) => setEditZoneLabel(e.target.value)} />
              </FormField>
              <FormField label="Area">
                <div className="flex gap-2">
                  <Input type="number" value={editZoneAreaValue} onChange={(e) => setEditZoneAreaValue(e.target.value)} className="flex-1" />
                  <Select value={editZoneAreaUnit} onChange={(e) => setEditZoneAreaUnit(e.target.value as LandUnit)} options={landUnitOptions} />
                </div>
              </FormField>
              <FormField label="Crop">
                <Select value={editZoneCropId} onChange={(e) => setEditZoneCropId(e.target.value)} options={fixtureCrops.filter((c) => c.enabled).map((c) => ({ value: c.id, label: c.nameEn }))} />
              </FormField>
              {editingZone && neighbourPicker(editingZone.id, editZoneNeighbourIds, setEditZoneNeighbourIds)}
            </div>
          </Modal>

          {/* Delete Zone Confirm */}
          <Modal
            open={!!deleteZoneConfirm}
            onClose={() => setDeleteZoneConfirm(null)}
            title="Delete Crop Zone"
            footer={
              <>
                <Button variant="outline" onClick={() => setDeleteZoneConfirm(null)}>Cancel</Button>
                <Button variant="primary" onClick={() => deleteZoneConfirm && handleDeleteZone(deleteZoneConfirm)}>Delete</Button>
              </>
            }
          >
            <p className="text-[var(--hv-text-sm)]">Are you sure you want to delete this zone?</p>
          </Modal>
        </div>
      ),
    },
    {
      id: 'compatibility',
      label: 'Compatibility',
      content: (
        <div className="flex flex-col gap-3">
          {edgesForThisFarm.map((edge) => {
            const zoneA = zonesById.get(edge.zoneAId);
            const zoneB = zonesById.get(edge.zoneBId);
            return (
              <Card key={`${edge.zoneAId}-${edge.zoneBId}`} padding="sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{zoneA?.label ?? edge.zoneAId} ↔ {zoneB?.label ?? edge.zoneBId}</p>
                    <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)] mt-1">{edge.reason}</p>
                  </div>
                  <CompatibilityBadge relation={edge.relation} />
                </div>
              </Card>
            );
          })}
          {edgesForThisFarm.length === 0 && (
            <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-400)]">No neighbour compatibility information available.</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[var(--hv-text-xl)] font-bold">{farm.name}</h1>
          <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)]">
            {farm.regionLabel} — {farm.areaInput.value} {farm.areaInput.unit}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/farms/${farmId}/edit`)}>
          Edit Farm
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => navigate(`/twin/${farm.id}`)}>{t('twin.viewTwin')}</Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/plan/${farm.id}`)}>{t('plan.viewPlan')}</Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/assistant/${farm.id}`)}>{t('assistant.openAssistant')}</Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/green-farm/${farm.id}`)}>{t('greenFarm.viewScore')}</Button>
      </div>

      <Tabs items={tabItems} />

      {/* Zone Drawer */}
      {drawerZoneId && (
        <ZoneDrawer
          zone={zonesById.get(drawerZoneId)}
          onClose={() => setDrawerZoneId(null)}
        />
      )}
    </div>
  );
}
