import React, { useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  DollarSign,
  Edit3,
  Layers,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { StatCard } from '@shared/ui/StatCard';
import { ConfirmDialog } from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/toast/toastStore';
import { formatUsd } from '@shared/utils/formatters';
import type {
  PlanBillingCycle,
  SubscriptionPlan,
} from '../../domain/entities/SubscriptionPlan';
import {
  useCreateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useSubscriptionPlansQuery,
  useToggleSubscriptionPlanStatusMutation,
  useUpdateSubscriptionPlanMutation,
} from '../../application/hooks/useSubscriptionPlans';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ isOpen, onClose }) => {
  const createMutation = useCreateSubscriptionPlanMutation();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [priceUsd, setPriceUsd] = useState<number | string>(149);
  const [billingCycle, setBillingCycle] = useState<PlanBillingCycle>('MONTHLY');
  const [durationDays, setDurationDays] = useState<number | string>(30);
  const [badgeText, setBadgeText] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [features, setFeatures] = useState<string[]>([
    'Acceso completo a todos los bots del catálogo',
    '1 Licencia NinjaTrader 8 con HWID lock',
    'Configuraciones optimizadas para Prop Firms',
    'Soporte técnico preferencial',
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  if (!isOpen) return null;

  const handleCycleChange = (cycle: PlanBillingCycle) => {
    setBillingCycle(cycle);
    if (cycle === 'MONTHLY') setDurationDays(30);
    else if (cycle === 'QUARTERLY') setDurationDays(90);
    else if (cycle === 'SEMIANNUAL') setDurationDays(180);
    else if (cycle === 'ANNUAL') setDurationDays(365);
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures((prev) => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.danger('Campo requerido', 'El nombre del plan es obligatorio.');
      return;
    }
    const finalPrice = Number(priceUsd);
    if (isNaN(finalPrice) || finalPrice < 0) {
      toast.danger('Precio inválido', 'El precio debe ser un número igual o mayor a 0.');
      return;
    }
    const finalDays = Number(durationDays);
    if (isNaN(finalDays) || finalDays <= 0) {
      toast.danger('Duración inválida', 'La duración debe ser mayor a 0 días.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim(),
        priceUsd: finalPrice,
        currency: 'USD',
        billingCycle,
        durationDays: finalDays,
        badgeText: badgeText.trim() || undefined,
        isPopular,
        isActive,
        features: features.filter(Boolean),
        botAccessType: 'ALL_ACCESS',
      });
      toast.success('Plan creado', `La membresía "${name}" ha sido creada exitosamente.`);
      onClose();
    } catch (err) {
      toast.danger('Error al crear plan', err instanceof Error ? err.message : 'No se pudo crear el plan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-emerald-500/10">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Crear Nuevo Plan de Membresía</h2>
            <p className="text-xs text-slate-400">Define los precios, duración y beneficios para los clientes.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Comercial del Plan *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Membresía Semestral All-Access"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Código de Identificación (Opcional)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej. PLAN_SEMIANNUAL_PRO"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-amber-300 font-mono placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción del Plan</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica a qué bots tiene acceso y para quién está recomendado..."
              rows={2}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Precio en USD *</label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ciclo de Facturación</label>
              <select
                value={billingCycle}
                onChange={(e) => handleCycleChange(e.target.value as PlanBillingCycle)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="MONTHLY">Mensual (30 días)</option>
                <option value="QUARTERLY">Trimestral (90 días)</option>
                <option value="SEMIANNUAL">Semestral (180 días)</option>
                <option value="ANNUAL">Anual (365 días)</option>
                <option value="CUSTOM">Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duración en Días *</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Etiqueta Destacada (Badge opcional)</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Ej. Ahorra 20% o Más Popular"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="font-medium">Plan Más Popular</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="font-medium text-emerald-300">Plan Activo</span>
              </label>
            </div>
          </div>

          {/* Lista Dinámica de Beneficios (Features) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Beneficios Incluidos (Features)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Escribe un beneficio y presiona Agregar..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddFeature}>
                Agregar
              </Button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-1.5 text-xs text-slate-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button variant="ghost" size="md" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={createMutation.isPending} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Guardar y Activar Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditPlanModalProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditPlanModal: React.FC<EditPlanModalProps> = ({ plan, isOpen, onClose }) => {
  const updateMutation = useUpdateSubscriptionPlanMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceUsd, setPriceUsd] = useState<number | string>(149);
  const [billingCycle, setBillingCycle] = useState<PlanBillingCycle>('MONTHLY');
  const [durationDays, setDurationDays] = useState<number | string>(30);
  const [badgeText, setBadgeText] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  React.useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDescription(plan.description);
      setPriceUsd(plan.priceUsd);
      setBillingCycle(plan.billingCycle);
      setDurationDays(plan.durationDays);
      setBadgeText(plan.badgeText || '');
      setIsPopular(Boolean(plan.isPopular));
      setIsActive(plan.isActive);
      setFeatures(plan.features || []);
    }
  }, [plan]);

  if (!isOpen || !plan) return null;

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures((prev) => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.danger('Campo requerido', 'El nombre del plan es obligatorio.');
      return;
    }
    const finalPrice = Number(priceUsd);
    const finalDays = Number(durationDays);

    try {
      await updateMutation.mutateAsync({
        id: plan.id,
        input: {
          name: name.trim(),
          description: description.trim(),
          priceUsd: finalPrice,
          billingCycle,
          durationDays: finalDays,
          badgeText: badgeText.trim() || undefined,
          isPopular,
          isActive,
          features: features.filter(Boolean),
        },
      });
      toast.success('Plan actualizado', `Los cambios en "${name}" han sido guardados.`);
      onClose();
    } catch (err) {
      toast.danger('Error al actualizar plan', err instanceof Error ? err.message : 'No se pudo actualizar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Edit3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Editar Plan de Membresía</h2>
            <p className="text-xs text-slate-400">Modifica precios, beneficios o estado del plan ({plan.code}).</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Comercial *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Precio en USD *</label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ciclo</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as PlanBillingCycle)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="MONTHLY">Mensual (30 días)</option>
                <option value="QUARTERLY">Trimestral (90 días)</option>
                <option value="SEMIANNUAL">Semestral (180 días)</option>
                <option value="ANNUAL">Anual (365 días)</option>
                <option value="CUSTOM">Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duración (Días)</label>
              <input
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Etiqueta Destacada</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Ej. Ahorra 20%"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="font-medium">Plan Más Popular</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="font-medium text-emerald-300">Plan Activo (Venta abierta)</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Beneficios</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Agregar beneficio..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddFeature}>
                Agregar
              </Button>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-1.5 text-xs text-slate-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button variant="ghost" size="md" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={updateMutation.isPending} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SubscriptionPlansAdminPage: React.FC = () => {
  const { data: plans = [], isLoading } = useSubscriptionPlansQuery();
  const toggleMutation = useToggleSubscriptionPlanStatusMutation();
  const deleteMutation = useDeleteSubscriptionPlanMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);

  const activePlansCount = plans.filter((p) => p.isActive).length;
  const popularPlan = plans.find((p) => p.isPopular) || plans[0];
  const minPrice = plans.length > 0 ? Math.min(...plans.map((p) => p.priceUsd)) : 0;
  const maxPrice = plans.length > 0 ? Math.max(...plans.map((p) => p.priceUsd)) : 0;

  const handleToggleActive = (plan: SubscriptionPlan) => {
    const nextState = !plan.isActive;
    toggleMutation.mutate(
      { id: plan.id, isActive: nextState },
      {
        onSuccess: () => {
          toast.success(
            nextState ? 'Plan Activado' : 'Plan Pausado',
            `El plan "${plan.name}" ahora está ${nextState ? 'visible' : 'oculto'} para los clientes.`
          );
        },
        onError: () => toast.danger('Error al cambiar estado del plan'),
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingPlan) return;
    const target = deletingPlan;
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        setDeletingPlan(null);
        toast.success('Plan eliminado', `Se eliminó el plan "${target.name}".`);
      },
      onError: () => toast.danger('Error al eliminar plan'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Planes y Membresías de Suscripción
            </h1>
            <Badge variant="amber" pulse>
              Administrador
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Crea, personaliza precios y administra los tipos de membresía que se venden a los clientes para acceder al catálogo completo de bots.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          + Crear Nuevo Plan / Membresía
        </Button>
      </div>

      {/* Métricas de Planes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de Planes"
          value={plans.length}
          subtitle="Tipos de membresía configurados"
          icon={<Layers className="h-5 w-5 text-amber-400" />}
          accent="amber"
        />
        <StatCard
          title="Planes Activos"
          value={`${activePlansCount} / ${plans.length}`}
          subtitle="Disponibles para contratación"
          icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
          accent="emerald"
        />
        <StatCard
          title="Plan Destacado"
          value={popularPlan ? popularPlan.name.split(' ')[1] || 'Anual' : 'N/A'}
          subtitle={popularPlan ? `${formatUsd(popularPlan.priceUsd)} / ${popularPlan.durationDays}d` : 'Sin definir'}
          icon={<Sparkles className="h-5 w-5 text-yellow-400" />}
          accent="amber"
        />
        <StatCard
          title="Rango de Precios"
          value={`${formatUsd(minPrice)} - ${formatUsd(maxPrice)}`}
          subtitle="Precios configurados en USD"
          icon={<DollarSign className="h-5 w-5 text-emerald-400" />}
          accent="emerald"
        />
      </div>

      {/* Grid de Planes Configurables */}
      {isLoading ? (
        <Card className="p-10 text-center text-slate-400">
          Cargando planes de suscripción...
        </Card>
      ) : plans.length === 0 ? (
        <Card className="p-10 text-center text-slate-400">
          No hay planes configurados. Haz clic en <strong>+ Crear Nuevo Plan</strong> para comenzar.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between p-6 transition-all border ${
                plan.isPopular
                  ? 'border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800 bg-slate-900/90'
              } ${!plan.isActive ? 'opacity-70 grayscale-20' : ''}`}
            >
              <div>
                {/* Badges superiores */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {plan.badgeText && (
                      <Badge variant="amber">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {plan.badgeText}
                      </Badge>
                    )}
                    {plan.isPopular && !plan.badgeText && (
                      <Badge variant="amber">Más Popular</Badge>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(plan)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                      plan.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                    title="Clic para cambiar visibilidad"
                  >
                    {plan.isActive ? '● Activo' : '○ Inactivo'}
                  </button>
                </div>

                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  ID: {plan.code}
                </div>

                <p className="mt-2 text-xs text-slate-300 line-clamp-2">
                  {plan.description}
                </p>

                {/* Precio y Duración */}
                <div className="my-5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-white">
                      {formatUsd(plan.priceUsd)}
                    </span>
                    <span className="text-xs text-slate-400">
                      / {plan.durationDays} días ({plan.billingCycle})
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <Zap className="h-3.5 w-3.5" />
                    Catálogo Completo (All-Access a todos los bots)
                  </div>
                </div>

                {/* Lista de Features */}
                <div className="space-y-2 mb-6">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Beneficios del Plan:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botones de Acción Compactos con Tooltips */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-1.5">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setEditingPlan(plan)}
                  className="text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                  tooltip="Editar nombre, precio, duración y beneficios de este plan"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Editar</span>
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setDeletingPlan(plan)}
                  className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                  tooltip="Eliminar permanentemente este plan de membresía"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Eliminar</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para Crear Plan */}
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Modal para Editar Plan */}
      <EditPlanModal
        plan={editingPlan}
        isOpen={editingPlan !== null}
        onClose={() => setEditingPlan(null)}
      />

      {/* Modal de Confirmación para Eliminar Plan */}
      <ConfirmDialog
        open={deletingPlan !== null}
        variant="danger"
        title="Eliminar Plan de Membresía"
        description={`¿Estás seguro de que deseas eliminar permanentemente el plan "${deletingPlan?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar Plan"
        cancelLabel="Cancelar"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPlan(null)}
      />
    </div>
  );
};
