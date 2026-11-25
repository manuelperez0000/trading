import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  KeyRound,
  RefreshCcw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { container } from '@app/di/container';
import type { User as UserEntity } from '@features/auth/domain/entities/User';
import type {
  Subscription,
  SubscriptionCycle,
} from '@features/subscriptions/domain/entities/Subscription';
import type { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';
import { useSubscriptionPlansQuery } from '../../application/hooks/useSubscriptionPlans';

function generateRandomLicenseKey(prefix = 'TLA'): string {
  const seg1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NT8-${prefix}-${seg1}-${seg2}`;
}

function calculateExpirationIso(cycle: SubscriptionCycle, baseDate = new Date()): string {
  const days = cycle === 'ANNUAL' ? 365 : 30;
  const target = new Date(baseDate.getTime() + days * 86400000);
  return target.toISOString().split('T')[0];
}

interface CreateSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (subData: Partial<Subscription>) => void;
  isLoading?: boolean;
}

export const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { data: dynamicPlans = [] } = useSubscriptionPlansQuery();
  const availablePlans = dynamicPlans.filter((p: SubscriptionPlan) => p.isActive);

  const [registeredUsers, setRegisteredUsers] = useState<UserEntity[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('manual');
  const [traderName, setTraderName] = useState('');
  const [email, setEmail] = useState('');
  const [subscriptionCycle, setSubscriptionCycle] = useState<SubscriptionCycle>('MONTHLY');
  const [licenseKey, setLicenseKey] = useState(() => generateRandomLicenseKey());
  const [expiresAtDate, setExpiresAtDate] = useState(() => calculateExpirationIso('MONTHLY'));
  const [ninjaAccountName, setNinjaAccountName] = useState('Sim101');
  const [boundMachineId, setBoundMachineId] = useState('');
  const [remoteEnabled, setRemoteEnabled] = useState(true);

  useEffect(() => {
    if (open) {
      container.listUsersUseCase
        .execute()
        .then((users) => setRegisteredUsers(users))
        .catch(() => setRegisteredUsers([]));
      setLicenseKey(generateRandomLicenseKey());
      setExpiresAtDate(calculateExpirationIso('MONTHLY'));
    }
  }, [open]);

  const handleSelectUser = (val: string) => {
    setSelectedUserId(val);
    if (val === 'manual') return;
    const found = registeredUsers.find((u) => u.id === val);
    if (found) {
      setTraderName(found.fullName);
      setEmail(found.email);
    }
  };

  const handleCycleChange = (cycle: SubscriptionCycle) => {
    setSubscriptionCycle(cycle);
    setExpiresAtDate(calculateExpirationIso(cycle));
  };

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalExpiresAt = new Date(`${expiresAtDate}T23:59:59.000Z`).toISOString();
    onSubmit({
      traderName: traderName.trim(),
      email: email.trim().toLowerCase(),
      subscriptionCycle,
      planTier: subscriptionCycle === 'ANNUAL' ? 'MEMBERSHIP_ANNUAL' : 'MEMBERSHIP_MONTHLY',
      licenseKey: licenseKey.trim(),
      expiresAt: finalExpiresAt,
      ninjaAccountName: ninjaAccountName.trim() || 'Sim101',
      boundMachineId: boundMachineId.trim() || null,
      remoteEnabled,
      activeStrategyName: 'TLA_PRO_SUITE_V2',
      instrument: 'NQ / ES / GC (All-Access)',
      statusNote: `Membresía ${subscriptionCycle === 'ANNUAL' ? 'Anual' : 'Mensual'} creada por el Administrador`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Crear Nueva Suscripción y Licencia NT8
              </h2>
              <p className="text-xs text-slate-400">
                Otorga acceso al catálogo completo de bots (Proton, Nova, Pulsar) y genera su LicenseKey.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Selector de Cliente Registrado */}
          {registeredUsers.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Vincular a Usuario Registrado en la Plataforma
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => handleSelectUser(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="manual">-- Escribir datos manualmente --</option>
                {registeredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email}) [ID #{u.id}]
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nombre del Trader / Estudiante *
              </label>
              <input
                type="text"
                value={traderName}
                onChange={(e) => setTraderName(e.target.value)}
                placeholder="Ej. Carlos Mendoza"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@correo.com"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Selector de Plan Dinámico */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Tipo de Membresía / Plan *
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availablePlans.length > 0 ? (
                availablePlans.map((plan: SubscriptionPlan) => {
                  const isSelected =
                    (plan.billingCycle === 'ANNUAL' && subscriptionCycle === 'ANNUAL') ||
                    (plan.billingCycle !== 'ANNUAL' && subscriptionCycle === 'MONTHLY');
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        const cycle = plan.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
                        setSubscriptionCycle(cycle);
                        const target = new Date(Date.now() + plan.durationDays * 86400000);
                        setExpiresAtDate(target.toISOString().split('T')[0]);
                      }}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-500/40'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{plan.name}</span>
                        <Badge variant={isSelected ? 'amber' : 'slate'}>{plan.durationDays}d</Badge>
                      </div>
                      <div className="mt-1 text-xs text-amber-300 font-semibold font-mono">
                        ${plan.priceUsd} {plan.currency}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                        {plan.description}
                      </div>
                    </button>
                  );
                })
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleCycleChange('MONTHLY')}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      subscriptionCycle === 'MONTHLY'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Membresía Mensual</span>
                      <Badge variant={subscriptionCycle === 'MONTHLY' ? 'emerald' : 'slate'}>30 Días</Badge>
                    </div>
                    <div className="mt-1 text-xs text-emerald-400 font-semibold">$149 USD / mes</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCycleChange('ANNUAL')}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      subscriptionCycle === 'ANNUAL'
                        ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        Membresía Anual <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      </span>
                      <Badge variant={subscriptionCycle === 'ANNUAL' ? 'amber' : 'slate'}>365 Días</Badge>
                    </div>
                    <div className="mt-1 text-xs text-amber-300 font-semibold">$1,190 USD / año</div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* LicenseKey y Vencimiento */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-400">LicenseKey de NinjaTrader 8 *</label>
                <button
                  type="button"
                  onClick={() => setLicenseKey(generateRandomLicenseKey())}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCcw className="h-3 w-3" /> Regenerar
                </button>
              </div>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 font-mono text-xs text-amber-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Fecha de Vencimiento / Expiración *
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="date"
                  value={expiresAtDate}
                  onChange={(e) => setExpiresAtDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Configuración Técnica NT8 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Cuenta de Trading en NinjaTrader 8
              </label>
              <input
                type="text"
                value={ninjaAccountName}
                onChange={(e) => setNinjaAccountName(e.target.value)}
                placeholder="Ej. Apex_PA_1001 o Sim101"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Machine ID Vinculado (Opcional)
              </label>
              <input
                type="text"
                value={boundMachineId}
                onChange={(e) => setBoundMachineId(e.target.value)}
                placeholder="Auto-vincular en primera conexión"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer">
            <input
              type="checkbox"
              checked={remoteEnabled}
              onChange={(e) => setRemoteEnabled(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
            <div>
              <div className="text-xs font-semibold text-white">Activar de inmediato el permiso de operativa</div>
              <div className="text-[11px] text-slate-400">Si está marcado, NinjaTrader 8 autorizará la ejecución de las estrategias.</div>
            </div>
          </label>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button variant="ghost" size="md" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isLoading} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Crear y Activar Suscripción
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditSubscriptionModalProps {
  subscription: Subscription | null;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Subscription>) => void;
  isLoading?: boolean;
}

export const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  subscription,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { data: dynamicPlans = [] } = useSubscriptionPlansQuery();
  const availablePlans = dynamicPlans.filter((p: SubscriptionPlan) => p.isActive);

  const [traderName, setTraderName] = useState('');
  const [email, setEmail] = useState('');
  const [subscriptionCycle, setSubscriptionCycle] = useState<SubscriptionCycle>('MONTHLY');
  const [expiresAtDate, setExpiresAtDate] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [ninjaAccountName, setNinjaAccountName] = useState('');
  const [boundMachineId, setBoundMachineId] = useState('');
  const [remoteEnabled, setRemoteEnabled] = useState(true);
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    if (subscription) {
      setTraderName(subscription.traderName);
      setEmail(subscription.email);
      setSubscriptionCycle(subscription.subscriptionCycle ?? 'MONTHLY');
      setLicenseKey(subscription.licenseKey);
      setNinjaAccountName(subscription.ninjaAccountName);
      setBoundMachineId(subscription.boundMachineId ?? '');
      setRemoteEnabled(subscription.remoteEnabled);
      setStatusNote(subscription.statusNote || '');
      const d = subscription.expiresAt
        ? new Date(subscription.expiresAt).toISOString().split('T')[0]
        : calculateExpirationIso('MONTHLY');
      setExpiresAtDate(d);
    }
  }, [subscription]);

  if (!subscription) return null;

  const handleAddDays = (days: number) => {
    const base = expiresAtDate ? new Date(expiresAtDate) : new Date();
    const target = new Date(base.getTime() + days * 86400000);
    setExpiresAtDate(target.toISOString().split('T')[0]);
  };

  const handleResetHwid = () => {
    setBoundMachineId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalExpiresAt = new Date(`${expiresAtDate}T23:59:59.000Z`).toISOString();
    onSubmit(subscription.id, {
      traderName: traderName.trim(),
      email: email.trim().toLowerCase(),
      subscriptionCycle,
      planTier: subscriptionCycle === 'ANNUAL' ? 'MEMBERSHIP_ANNUAL' : 'MEMBERSHIP_MONTHLY',
      licenseKey: licenseKey.trim(),
      expiresAt: finalExpiresAt,
      ninjaAccountName: ninjaAccountName.trim() || 'Sim101',
      boundMachineId: boundMachineId.trim() || null,
      remoteEnabled,
      statusNote: statusNote.trim() || 'Actualizado por el Administrador',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Editar Suscripción: {subscription.traderName}
              </h2>
              <p className="text-xs text-slate-400">
                Ajusta plan, vigencia, estado de operativa o resetea el Machine ID.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del Trader</label>
              <input
                type="text"
                value={traderName}
                onChange={(e) => setTraderName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Selector de Plan Dinámico */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Membresía / Plan</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {availablePlans.length > 0 ? (
                availablePlans.map((plan: SubscriptionPlan) => {
                  const isSelected =
                    (plan.billingCycle === 'ANNUAL' && subscriptionCycle === 'ANNUAL') ||
                    (plan.billingCycle !== 'ANNUAL' && subscriptionCycle === 'MONTHLY');
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        const cycle = plan.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
                        setSubscriptionCycle(cycle);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-white font-bold ring-1 ring-amber-500/30'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-semibold truncate text-white">{plan.name}</div>
                      <div className="text-[11px] text-amber-300 font-mono">${plan.priceUsd} / {plan.durationDays}d</div>
                    </button>
                  );
                })
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setSubscriptionCycle('MONTHLY')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      subscriptionCycle === 'MONTHLY'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Membresía Mensual ($149/m)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubscriptionCycle('ANNUAL')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      subscriptionCycle === 'ANNUAL'
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Membresía Anual ($1,190/a)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Vencimiento y Extensiones */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-400">Fecha de Expiración</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddDays(30)}
                  className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-emerald-300 hover:bg-slate-700"
                >
                  +30 días
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDays(90)}
                  className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-sky-300 hover:bg-slate-700"
                >
                  +90 días
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDays(365)}
                  className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-amber-300 hover:bg-slate-700"
                >
                  +1 año
                </button>
              </div>
            </div>
            <input
              type="date"
              value={expiresAtDate}
              onChange={(e) => setExpiresAtDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* LicenseKey & MachineID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">LicenseKey NT8</label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-amber-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-400">Machine ID Vinculado</label>
                {boundMachineId && (
                  <button
                    type="button"
                    onClick={handleResetHwid}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Reset HWID
                  </button>
                )}
              </div>
              <input
                type="text"
                value={boundMachineId}
                onChange={(e) => setBoundMachineId(e.target.value)}
                placeholder="Sin vincular (auto-detectar)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Estado Remoto */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Estado de la Operativa (Kill Switch)</div>
              <div className="text-[11px] text-slate-400">
                {remoteEnabled ? 'Trading Habilitado (Activo)' : 'Trading Detenido Remotamente (Pausado)'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRemoteEnabled(!remoteEnabled)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                remoteEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {remoteEnabled ? 'ACTIVA' : 'PAUSADA'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Observaciones / Nota de Estado</label>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Ej. Membresía renovada por transferencia bancaria"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button variant="ghost" size="md" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isLoading} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
