import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button, Badge, Modal, FormField, Input, Select, EmptyState, ErrorState } from '@hv/ui';
import type { ExperimentalPlan, ExperimentalOutcome } from '@hv/api-types';
import {
  fixtureExperimentalPlans,
  fixtureExperimentalOutcomes,
  fixtureCrops,
  fixtureProductionAreas,
} from '@hv/api-types';

type ModalMode = 'create' | 'outcome' | null;

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  draft: 'neutral',
  approved: 'success',
  rejected: 'danger',
  completed: 'warning',
};

export function ExperimentalPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<ExperimentalPlan[]>(
    fixtureExperimentalPlans.filter((p) => p.farmId === farmId),
  );
  const [outcomes, setOutcomes] = useState<ExperimentalOutcome[]>(fixtureExperimentalOutcomes);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Create form state
  const [newCropId, setNewCropId] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newHypothesis, setNewHypothesis] = useState('');
  const [newAreaId, setNewAreaId] = useState('');

  // Outcome form state
  const [outcomeYield, setOutcomeYield] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState('');

  if (!farmId) return <ErrorState error="No farm selected" onRetry={() => navigate('/farms')} />;

  const areas = fixtureProductionAreas.filter((a) => a.farmId === farmId);
  const crops = fixtureCrops.filter((c) => c.enabled);

  const resetCreateForm = () => {
    setNewCropId('');
    setNewArea('');
    setNewHypothesis('');
    setNewAreaId('');
  };

  const handleCreate = () => {
    if (!newCropId || !newArea || !newHypothesis || !newAreaId) return;
    const crop = crops.find((c) => c.id === newCropId);
    const plan: ExperimentalPlan = {
      id: `exp-plan-${Date.now()}`,
      farmId,
      productionAreaId: newAreaId,
      cropId: newCropId,
      cropName: crop?.nameEn ?? newCropId,
      areaValue: parseFloat(newArea),
      areaUnit: 'kanal',
      hypothesis: newHypothesis,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlans((prev) => [...prev, plan]);
    resetCreateForm();
    setModalMode(null);
  };

  const handleStatusChange = (planId: string, status: ExperimentalPlan['status']) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, status, updatedAt: new Date().toISOString() } : p)),
    );
  };

  const handleRecordOutcome = () => {
    if (!selectedPlanId || !outcomeYield) return;
    const outcome: ExperimentalOutcome = {
      id: `exp-out-${Date.now()}`,
      planId: selectedPlanId,
      yieldValue: parseFloat(outcomeYield),
      yieldUnit: 'kg',
      notes: outcomeNotes,
      recordedAt: new Date().toISOString(),
    };
    setOutcomes((prev) => [...prev, outcome]);
    handleStatusChange(selectedPlanId, 'completed');
    setOutcomeYield('');
    setOutcomeNotes('');
    setSelectedPlanId(null);
    setModalMode(null);
  };

  const openOutcomeModal = (planId: string) => {
    setSelectedPlanId(planId);
    setModalMode('outcome');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[var(--hv-text-lg)] font-bold">
          {t('experimental.title', 'Experimental Farming')}
        </h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="primary" size="sm" onClick={() => setModalMode('create')}>
            {t('experimental.newPlan', 'New Experiment')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/farms/${farmId}`)}>
            {t('common.back')}
          </Button>
        </div>
      </div>

      {plans.length === 0 && (
        <EmptyState
          title={t('experimental.empty', 'No experimental plans yet')}
          description={t('experimental.emptyHint', 'Create an experiment to test a crop in a small area.')}
        />
      )}

      {plans.map((plan) => {
        const planOutcomes = outcomes.filter((o) => o.planId === plan.id);
        return (
          <Card key={plan.id} padding="md">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{plan.cropName}</span>
                  <Badge variant={STATUS_BADGE[plan.status] ?? 'neutral'} size="sm">
                    {plan.status}
                  </Badge>
                </div>
                <span className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
                  {plan.areaValue} {plan.areaUnit}
                </span>
              </div>

              <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-600)]">{plan.hypothesis}</p>

              <div className="flex gap-2 flex-wrap">
                {plan.status === 'draft' && (
                  <>
                    <Button size="sm" variant="primary" onClick={() => handleStatusChange(plan.id, 'approved')}>
                      {t('experimental.approve', 'Approve')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(plan.id, 'rejected')}>
                      {t('experimental.reject', 'Reject')}
                    </Button>
                  </>
                )}
                {plan.status === 'approved' && (
                  <Button size="sm" variant="primary" onClick={() => openOutcomeModal(plan.id)}>
                    {t('experimental.recordOutcome', 'Record Outcome')}
                  </Button>
                )}
              </div>

              {planOutcomes.length > 0 && (
                <div className="border-t border-[var(--hv-color-neutral-100)] pt-3 mt-1">
                  <p className="text-[var(--hv-text-xs)] font-medium mb-1">
                    {t('experimental.outcomes', 'Outcomes')}
                  </p>
                  {planOutcomes.map((o) => (
                    <div key={o.id} className="text-[var(--hv-text-sm)]">
                      <span className="font-medium">{o.yieldValue} {o.yieldUnit}</span>
                      {o.notes && <span className="text-[var(--hv-color-neutral-500)]"> — {o.notes}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {/* Create Experiment Modal */}
      <Modal
        open={modalMode === 'create'}
        onClose={() => { setModalMode(null); resetCreateForm(); }}
        title={t('experimental.createTitle', 'Create Experimental Plan')}
      >
        <div className="flex flex-col gap-4">
          <FormField label={t('experimental.area', 'Production Area')}>
            <Select
              value={newAreaId}
              onChange={(e) => setNewAreaId(e.target.value)}
              options={[
                { label: '— Select area —', value: '' },
                ...areas.map((a) => ({ label: a.name, value: a.id })),
              ]}
            />
          </FormField>
          <FormField label={t('experimental.crop', 'Crop')}>
            <Select
              value={newCropId}
              onChange={(e) => setNewCropId(e.target.value)}
              options={[
                { label: '— Select crop —', value: '' },
                ...crops.map((c) => ({ label: c.nameEn, value: c.id })),
              ]}
            />
          </FormField>
          <FormField label={t('experimental.areaSize', 'Area (kanal)')}>
            <Input type="number" value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="0.5" />
          </FormField>
          <FormField label={t('experimental.hypothesis', 'Hypothesis / Goal')}>
            <Input value={newHypothesis} onChange={(e) => setNewHypothesis(e.target.value)} placeholder="What do you want to test?" />
          </FormField>
          <Button variant="primary" onClick={handleCreate} disabled={!newCropId || !newArea || !newHypothesis || !newAreaId}>
            {t('experimental.create', 'Create Plan')}
          </Button>
        </div>
      </Modal>

      {/* Record Outcome Modal */}
      <Modal
        open={modalMode === 'outcome'}
        onClose={() => { setModalMode(null); setSelectedPlanId(null); }}
        title={t('experimental.recordOutcomeTitle', 'Record Experiment Outcome')}
      >
        <div className="flex flex-col gap-4">
          <FormField label={t('experimental.yield', 'Yield (kg)')}>
            <Input type="number" value={outcomeYield} onChange={(e) => setOutcomeYield(e.target.value)} placeholder="120" />
          </FormField>
          <FormField label={t('experimental.notes', 'Notes')}>
            <Input value={outcomeNotes} onChange={(e) => setOutcomeNotes(e.target.value)} placeholder="Observations, learnings…" />
          </FormField>
          <Button variant="primary" onClick={handleRecordOutcome} disabled={!outcomeYield}>
            {t('experimental.save', 'Save Outcome')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
