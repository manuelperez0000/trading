import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Cpu,
  Download,
  Lock,
  LogIn,
  Plus,
  PlusCircle,
  ShieldCheck,
  ShoppingCart,
  Sliders,
  Sparkles,
  Trash2,
  TrendingUp,
  UserPlus,
  X,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { StatCard } from '@shared/ui/StatCard';
import { useI18n } from '@core/i18n/useLanguageStore';
import { formatUsd } from '@shared/utils/formatters';
import {
  useBotDetailQuery,
  useBotsQuery,
  useCreateBotMutation,
  useLinkBotToLicenseMutation,
} from '@features/bots-catalog/application/hooks/useBots';
import type { TradingBot } from '@features/bots-catalog/domain/entities/TradingBot';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import { toast } from '@shared/ui/toast/toastStore';

export interface PurchasedBotItem {
  id: string;
  botId: string;
  botName: string;
  codeName: string;
  instrument: string;
  billingCycle: 'MONTHLY' | 'ANNUAL' | 'LIFETIME';
  riskProfile: 'LUCID' | 'MFFU' | 'TRADEIFY' | 'LIVE';
  licenseKey: string;
  machineId: string;
  status: 'ACTIVE' | 'PENDING_BIND' | 'EXPIRED';
  purchasedAt: string;
}

const STORAGE_KEY_PURCHASED_BOTS = 'tla_purchased_bots_v1';

const INITIAL_PURCHASED_BOTS: PurchasedBotItem[] = [
  {
    id: 'pb-pulsar-01',
    botId: 'bot-pulsar',
    botName: 'Pulsar (El Más Eficiente)',
    codeName: 'TLA_PULSAR_V2',
    instrument: 'NQ (E-mini Nasdaq)',
    billingCycle: 'MONTHLY',
    riskProfile: 'LUCID',
    licenseKey: 'NT8-QTM-9921-ALPHA',
    machineId: 'WIN11-TRD-9F82A1C0',
    status: 'ACTIVE',
    purchasedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export function getStoredPurchasedBots(): PurchasedBotItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PURCHASED_BOTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PURCHASED_BOTS, JSON.stringify(INITIAL_PURCHASED_BOTS));
      return INITIAL_PURCHASED_BOTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PURCHASED_BOTS;
  }
}

export function saveStoredPurchasedBots(items: PurchasedBotItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PURCHASED_BOTS, JSON.stringify(items));
  } catch {
    // ignore
  }
}

interface PurchaseGateModalProps {
  bot: TradingBot | null;
  onClose: () => void;
  onSuccessActivated?: () => void;
}

const PurchaseGateModal: React.FC<PurchaseGateModalProps> = ({
  bot,
  onClose,
  onSuccessActivated,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const linkMutation = useLinkBotToLicenseMutation();

  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL' | 'LIFETIME'>('MONTHLY');
  const [riskProfile, setRiskProfile] = useState<'LUCID' | 'MFFU' | 'TRADEIFY' | 'LIVE'>('LUCID');

  if (!bot) return null;

  const redirectUrl = `/catalog/${bot.id}?intent=buy`;
  const loginHref = `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`;
  const registerHref = `/auth/register?redirect=${encodeURIComponent(redirectUrl)}`;

  const computedPriceUsd =
    billingCycle === 'MONTHLY'
      ? bot.monthlyPriceUsd
      : billingCycle === 'ANNUAL'
      ? Math.round(bot.monthlyPriceUsd * 12 * 0.8)
      : Math.round(bot.monthlyPriceUsd * 6);

  const handleConfirmPurchase = () => {
    linkMutation.mutate(
      { botId: bot.id, licenseKey: 'NT8-QTM-9921-ALPHA' },
      {
        onSuccess: () => {
          const current = getStoredPurchasedBots();
          const newItem: PurchasedBotItem = {
            id: `pb-${Date.now()}`,
            botId: bot.id,
            botName: bot.name,
            codeName: bot.codeName,
            instrument: bot.primaryInstrument,
            billingCycle,
            riskProfile,
            licenseKey: 'NT8-QTM-9921-ALPHA',
            machineId: 'WIN11-TRD-9F82A1C0',
            status: 'ACTIVE',
            purchasedAt: new Date().toISOString(),
          };
          saveStoredPurchasedBots([newItem, ...current.filter((b) => b.botId !== bot.id)]);
          toast.success(
            '¡Suscripción Activada con Éxito!',
            `${bot.name} (${riskProfile}) vinculado a tu LicenseKey de NinjaTrader 8.`
          );
          onSuccessActivated?.();
          onClose();
          navigate('/my-bots');
        },
        onError: () => {
          toast.danger('Error al procesar la suscripción');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/70 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                isAuthenticated
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              }`}
            >
              {isAuthenticated ? (
                <ShoppingCart className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isAuthenticated
                  ? 'Confirmar Suscripción y Activar Licencia NT8'
                  : 'Inicia Sesión para Proceder con la Compra'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAuthenticated
                  ? `Cuenta activa: ${user.fullName} (${user.email})`
                  : 'La exploración es pública, pero la compra requiere una cuenta registrada'}
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

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Resumen del Bot Seleccionado */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{bot.name}</span>
                  <Badge variant="emerald">{bot.primaryInstrument}</Badge>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  {bot.codeName} • Win Rate {bot.winRatePercent}% • PF {bot.profitFactor}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-extrabold text-emerald-400">
                {formatUsd(bot.monthlyPriceUsd)}
              </div>
              <div className="text-[11px] text-slate-400">por mes</div>
            </div>
          </div>

          {!isAuthenticated ? (
            <>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2.5">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                  ¿Por qué necesitas iniciar sesión antes de comprar?
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Al adquirir la suscripción de <strong>{bot.name}</strong>, el sistema genera automáticamente tu <strong>LicenseKey remota única</strong> vinculada a tu usuario y habilita la descarga del paquete <code className="text-amber-300">.zip</code> para NinjaTrader 8 con los perfiles de riesgo para <strong>Lucid Trading, My Funded Futures (MFFU), Tradeify y Cuenta Real</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(loginHref)}
                >
                  <LogIn className="h-4 w-4" />
                  Iniciar Sesión y Comprar
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/15"
                  onClick={() => navigate(registerHref)}
                >
                  <UserPlus className="h-4 w-4" />
                  Crear Cuenta Nueva
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Selector de Ciclo de Facturación */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  1. Selecciona tu Plan de Suscripción
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      {
                        id: 'MONTHLY',
                        title: 'Mensual',
                        price: `${formatUsd(bot.monthlyPriceUsd)}/mes`,
                        tag: 'Flexible',
                      },
                      {
                        id: 'ANNUAL',
                        title: 'Anual (-20%)',
                        price: `${formatUsd(Math.round(bot.monthlyPriceUsd * 12 * 0.8))}/año`,
                        tag: 'Más Popular',
                      },
                      {
                        id: 'LIFETIME',
                        title: 'Vitalicio',
                        price: `${formatUsd(Math.round(bot.monthlyPriceUsd * 6))} único`,
                        tag: 'Pago Único',
                      },
                    ] as const
                  ).map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setBillingCycle(plan.id)}
                      className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        billingCycle === plan.id
                          ? 'border-emerald-500 bg-emerald-500/15 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase text-amber-400">
                        {plan.tag}
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {plan.title}
                      </div>
                      <div className="text-xs font-mono text-emerald-400 mt-1">
                        {plan.price}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Perfil Preconfigurado */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Perfil de Riesgo Preconfigurado Inicial
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'LUCID', label: 'Lucid Trading', sub: 'Trailing Intradía' },
                      { id: 'MFFU', label: 'MFFU', sub: 'My Funded Futures' },
                      { id: 'TRADEIFY', label: 'Tradeify', sub: 'Stop Diario Estricto' },
                      { id: 'LIVE', label: 'Cuenta Real', sub: 'Capital Propio Live' },
                    ] as const
                  ).map((prof) => (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setRiskProfile(prof.id)}
                      className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                        riskProfile === prof.id
                          ? 'border-amber-500 bg-amber-500/15 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{prof.label}</div>
                      <div className="text-[10px] text-slate-400">{prof.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumen de Activación */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="text-slate-300">
                    LicenseKey Asignada:{' '}
                    <span className="font-mono font-bold text-emerald-300">
                      NT8-QTM-9921-ALPHA
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Activación remota inmediata para NinjaTrader 8 (64-bit)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Total a Pagar</div>
                  <div className="text-lg font-extrabold text-white">
                    {formatUsd(computedPriceUsd)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button variant="ghost" size="md" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={linkMutation.isPending}
                  onClick={handleConfirmPurchase}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar Compra y Activar Bot
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface CreateBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateBotModal: React.FC<CreateBotModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const createMutation = useCreateBotMutation();

  const [name, setName] = useState('Alpha Volume Profile Scalper');
  const [codeName, setCodeName] = useState('AlphaVolumeProfileScalper');
  const [version, setVersion] = useState('v1.0.0 (NT8 64-bit)');
  const [category, setCategory] = useState<
    'ORDER_FLOW_SCALPING' | 'MOMENTUM_BREAKOUT' | 'MEAN_REVERSION'
  >('ORDER_FLOW_SCALPING');
  const [primaryInstrument, setPrimaryInstrument] = useState('NQ 12-26');
  const [supportedInstruments, setSupportedInstruments] = useState('NQ, MNQ, ES');
  const [monthlyPriceUsd, setMonthlyPriceUsd] = useState(149);
  const [winRatePercent, setWinRatePercent] = useState(72.5);
  const [profitFactor, setProfitFactor] = useState(2.45);
  const [maxDrawdownUsd, setMaxDrawdownUsd] = useState(950);
  const [avgDailyTrades, setAvgDailyTrades] = useState('3 - 6 trades / sesión NY');
  const [recommendedAccountSizeUsd, setRecommendedAccountSizeUsd] = useState(50000);
  const [propFirmReady, setPropFirmReady] = useState(true);
  const [shortDescription, setShortDescription] = useState(
    'Estrategia algorítmica para NinjaTrader 8 basada en desequilibrios de volumen y Value Area.'
  );
  const [fullDescription, setFullDescription] = useState(
    'Diseñada para operar futuros (NQ y MNQ) con protección de capital para evaluaciones de fondeo y cuentas reales. Ejecuta entradas con confirmación de Order Flow y trailing stop dinámico.'
  );

  const [parameters, setParameters] = useState<
    Array<{ name: string; defaultValue: string; description: string }>
  >([
    {
      name: 'StopLossTicks',
      defaultValue: '36',
      description: 'Stop Loss máximo por operación en ticks',
    },
    {
      name: 'TakeProfitTicks',
      defaultValue: '64',
      description: 'Objetivo de ganancia en ticks',
    },
    {
      name: 'MaxDailyLossUsd',
      defaultValue: '600',
      description: 'Kill-switch interno por pérdida diaria',
    },
  ]);

  const [newParamName, setNewParamName] = useState('');
  const [newParamDefault, setNewParamDefault] = useState('');
  const [newParamDesc, setNewParamDesc] = useState('');

  if (!isOpen) return null;

  const handleAddParameter = () => {
    if (!newParamName.trim()) return;
    setParameters((prev) => [
      ...prev,
      {
        name: newParamName.trim(),
        defaultValue: newParamDefault.trim() || '10',
        description: newParamDesc.trim() || 'Parámetro de configuración',
      },
    ]);
    setNewParamName('');
    setNewParamDefault('');
    setNewParamDesc('');
  };

  const handleRemoveParameter = (index: number) => {
    setParameters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.danger('Campo requerido', 'El nombre comercial del bot es obligatorio.');
      return;
    }
    if (!codeName.trim()) {
      toast.danger('Campo requerido', 'El nombre de código en C# (NinjaScript) es obligatorio.');
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        name: name.trim(),
        codeName: codeName.trim(),
        version: version.trim() || 'v1.0.0 (NT8 64-bit)',
        category,
        primaryInstrument: primaryInstrument.trim() || 'NQ 12-26',
        supportedInstruments: supportedInstruments
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean),
        monthlyPriceUsd: Number(monthlyPriceUsd) || 0,
        winRatePercent: Number(winRatePercent) || 70,
        profitFactor: Number(profitFactor) || 2.0,
        maxDrawdownUsd: Number(maxDrawdownUsd) || 1000,
        avgDailyTrades: avgDailyTrades.trim() || '3 - 5 trades / sesión',
        propFirmReady,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        recommendedAccountSizeUsd: Number(recommendedAccountSizeUsd) || 50000,
        ninjaParameters: parameters,
      });

      toast.success(
        t.catalog.botCreatedSuccess,
        `"${created.name}" ya se encuentra activo en el catálogo y listo para ser activado.`
      );
      onClose();
    } catch (err) {
      toast.danger(
        'Error al crear el bot',
        err instanceof Error ? err.message : 'No se pudo guardar la estrategia.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {t.catalog.createModalTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.catalog.createModalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Sección 1: Identificación y NinjaScript */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              1. Identificación Comercial & Clase C# NinjaScript
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre Comercial del Bot *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej: Alpha Volume Profile Scalper"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre de Clase C# / NinjaScript *
                </label>
                <input
                  type="text"
                  required
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  placeholder="ej: AlphaVolumeProfileScalper"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-emerald-300 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Versión del Algoritmo
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0.0 (NT8 64-bit)"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Categoría de Trading
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as
                        | 'ORDER_FLOW_SCALPING'
                        | 'MOMENTUM_BREAKOUT'
                        | 'MEAN_REVERSION'
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="ORDER_FLOW_SCALPING">Order Flow & Scalping</option>
                  <option value="MOMENTUM_BREAKOUT">Momentum & Rupturas</option>
                  <option value="MEAN_REVERSION">Reversión a la Media</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección 2: Mercados, Precios y Cuentas de Fondeo */}
          <div className="space-y-4 border-t border-slate-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5" />
              2. Mercados, Suscripción & Prop Firms
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Instrumento Principal *
                </label>
                <input
                  type="text"
                  required
                  value={primaryInstrument}
                  onChange={(e) => setPrimaryInstrument(e.target.value)}
                  placeholder="NQ 12-26"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mercados Soportados (Comas)
                </label>
                <input
                  type="text"
                  value={supportedInstruments}
                  onChange={(e) => setSupportedInstruments(e.target.value)}
                  placeholder="NQ, MNQ, ES"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Precio Mensual (USD) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={monthlyPriceUsd}
                  onChange={(e) => setMonthlyPriceUsd(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-emerald-400 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Capital Recomendado (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={recommendedAccountSizeUsd}
                  onChange={(e) =>
                    setRecommendedAccountSizeUsd(Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="propFirmCheckbox"
                  checked={propFirmReady}
                  onChange={(e) => setPropFirmReady(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label
                  htmlFor="propFirmCheckbox"
                  className="text-xs text-slate-200 font-medium cursor-pointer"
                >
                  Compatible con Evaluaciones de Fondeo y Cuentas Reales
                </label>
              </div>
            </div>
          </div>

          {/* Sección 3: Métricas de Rendimiento Auditadas */}
          <div className="space-y-4 border-t border-slate-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              3. Métricas de Performance Auditadas
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Win Rate %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={winRatePercent}
                  onChange={(e) => setWinRatePercent(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Profit Factor
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={profitFactor}
                  onChange={(e) => setProfitFactor(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-sky-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Max Drawdown (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={maxDrawdownUsd}
                  onChange={(e) => setMaxDrawdownUsd(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-rose-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Frecuencia de Trades
                </label>
                <input
                  type="text"
                  value={avgDailyTrades}
                  onChange={(e) => setAvgDailyTrades(e.target.value)}
                  placeholder="ej: 3 - 5 trades / sesión"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sección 4: Descripciones */}
          <div className="space-y-4 border-t border-slate-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5" />
              4. Pitch y Descripción Estratégica
            </h3>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Descripción Corta (Tarjeta del Catálogo) *
              </label>
              <textarea
                rows={2}
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Descripción Técnica Completa (Página de Detalle) *
              </label>
              <textarea
                rows={3}
                required
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Sección 5: Parámetros NinjaScript */}
          <div className="space-y-4 border-t border-slate-800 pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5" />
                5. Parámetros NinjaScript Configurables
              </h3>
              <Badge variant="slate">{parameters.length} parámetros</Badge>
            </div>

            <div className="space-y-2">
              {parameters.map((param, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/80 p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-emerald-300">
                      {param.name}:
                    </span>
                    <Badge variant="slate">{param.defaultValue}</Badge>
                    <span className="truncate text-slate-400">
                      {param.description}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveParameter(index)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    title="Eliminar parámetro"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Añadir nuevo parámetro */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
              <input
                type="text"
                placeholder="Nombre (ej: TrailingTicks)"
                value={newParamName}
                onChange={(e) => setNewParamName(e.target.value)}
                className="rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Valor por Defecto (ej: 25)"
                value={newParamDefault}
                onChange={(e) => setNewParamDefault(e.target.value)}
                className="rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Descripción rápida"
                  value={newParamDesc}
                  onChange={(e) => setNewParamDesc(e.target.value)}
                  className="flex-1 rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddParameter}
                  className="rounded bg-slate-800 hover:bg-slate-700 px-3 py-1 text-xs font-semibold text-white cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Footer con Botones */}
        <div className="sticky bottom-0 border-t border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={createMutation.isPending}
            onClick={handleSubmit}
          >
            <CheckCircle2 className="h-4 w-4" />
            Publicar Bot en el Catálogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export const BotsCatalogPage: React.FC = () => {
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const [selectedInstrument, setSelectedInstrument] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [botForPurchase, setBotForPurchase] = useState<TradingBot | null>(null);
  const { data: bots = [], isLoading } = useBotsQuery();

  const filteredBots = useMemo(() => {
    if (selectedInstrument === 'ALL') return bots;
    return bots.filter((bot) =>
      bot.supportedInstruments.includes(selectedInstrument)
    );
  }, [bots, selectedInstrument]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t.catalog.title}
            </h1>
            <Badge variant="emerald">{t.catalog.badge}</Badge>
            {!isAuthenticated && (
              <Badge variant="amber">Exploración Pública • Sin Login</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {t.catalog.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'NQ', 'ES', 'MNQ', 'GC'] as const).map((inst) => (
              <button
                key={inst}
                type="button"
                onClick={() => setSelectedInstrument(inst)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedInstrument === inst
                    ? 'bg-emerald-500 text-[#020617]'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {inst === 'ALL' ? t.catalog.allMarkets : `Futures ${inst}`}
              </button>
            ))}
          </div>

          {isAuthenticated && user.role === 'ADMIN' && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              className="cursor-pointer shadow-md shadow-amber-500/20"
            >
              <PlusCircle className="h-4 w-4" />
              {t.catalog.addBotButton}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-slate-400">
          Cargando catálogo de bots...
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredBots.map((bot) => (
            <Card
              key={bot.id}
              className="p-6 flex flex-col justify-between space-y-5 hover:border-emerald-500/40 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{bot.name}</h2>
                      <div className="text-xs font-mono text-slate-400">
                        {bot.codeName} • {bot.version}
                      </div>
                    </div>
                  </div>
                  <Badge variant="emerald">{bot.primaryInstrument}</Badge>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {bot.shortDescription}
                </p>

                {/* Etiquetas de Perfiles Soportados */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
                    Perfiles:
                  </span>
                  <Badge variant="amber">Lucid Trading</Badge>
                  <Badge variant="sky">MFFU</Badge>
                  <Badge variant="emerald">Tradeify</Badge>
                  <Badge variant="slate">Cuenta Real Live</Badge>
                </div>

                {/* Métricas Clave */}
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 text-center">
                  <div>
                    <div className="text-[11px] uppercase text-slate-400">
                      Win Rate
                    </div>
                    <div className="mt-0.5 text-base font-bold font-mono text-emerald-400">
                      {bot.winRatePercent}%
                    </div>
                  </div>
                  <div className="border-x border-slate-800">
                    <div className="text-[11px] uppercase text-slate-400">
                      Profit Factor
                    </div>
                    <div className="mt-0.5 text-base font-bold font-mono text-sky-400">
                      {bot.profitFactor}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-slate-400">
                      Max Drawdown
                    </div>
                    <div className="mt-0.5 text-base font-bold font-mono text-rose-400 tabular-nums">
                      {formatUsd(bot.maxDrawdownUsd)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
                <div>
                  <span className="text-xl font-extrabold text-white">
                    {formatUsd(bot.monthlyPriceUsd)}
                  </span>
                  <span className="text-xs text-slate-400"> {t.catalog.perMonth}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/catalog/${bot.id}`}>
                    <Button variant="secondary" size="md">
                      {t.catalog.viewDetails}
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setBotForPurchase(bot)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Comprar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Interactivo para Crear / Publicar Nuevo Bot (Solo Admin) */}
      <CreateBotModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Modal de Compra / Gate de Autenticación */}
      <PurchaseGateModal
        bot={botForPurchase}
        onClose={() => setBotForPurchase(null)}
      />
    </div>
  );
};

export const BotDetailPage: React.FC = () => {
  const { botId } = useParams<{ botId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [activatedBanner, setActivatedBanner] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const { data: bot, isLoading } = useBotDetailQuery(botId);

  // Si el usuario vuelve del Login con ?intent=buy, abrimos el modal de compra automáticamente
  useEffect(() => {
    if (bot && searchParams.get('intent') === 'buy') {
      setIsPurchaseModalOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('intent');
      setSearchParams(nextParams, { replace: true });
    }
  }, [bot, searchParams, setSearchParams]);

  if (isLoading) {
    return (
      <Card className="p-8 text-center text-slate-400">
        Cargando detalles de la estrategia...
      </Card>
    );
  }

  if (!bot) {
    return (
      <Card className="p-12 text-center text-slate-400 space-y-4 max-w-lg mx-auto my-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 mx-auto text-slate-500">
          <Bot className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-white">Bot no encontrado</h2>
        <p className="text-xs text-slate-400">
          El identificador de estrategia solicitado no existe en el catálogo o no está disponible actualmente.
        </p>
        <div className="pt-2">
          <Link to="/catalog">
            <Button variant="primary" size="md">
              <ArrowLeft className="h-4 w-4" />
              Volver al Catálogo de Bots
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Catálogo de Bots
        </Link>
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <Badge variant="amber">
              Vista Pública • Requiere Iniciar Sesión para Comprar
            </Badge>
          ) : (
            <Badge variant="emerald">
              Sesión Activa: {user.fullName}
            </Badge>
          )}
          <Badge variant="emerald">Licencia Remota Integrada</Badge>
        </div>
      </div>

      {/* Cabecera Técnica del Bot */}
      <Card className="p-6 border-emerald-500/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="sky">{bot.version}</Badge>
              <Badge variant="emerald">
                Mercados: {bot.supportedInstruments.join(', ')}
              </Badge>
              <Badge variant="slate">{bot.avgDailyTrades}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-white">{bot.name}</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {bot.fullDescription}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-400">
                Plantillas de Riesgo Incluidas:
              </span>
              <Badge variant="amber">Lucid Trading</Badge>
              <Badge variant="sky">My Funded Futures (MFFU)</Badge>
              <Badge variant="emerald">Tradeify</Badge>
              <Badge variant="slate">Cuenta Real Personal (Live)</Badge>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 rounded-xl border border-slate-800 bg-slate-950 p-5">
            <div className="text-xs text-slate-400">Suscripción Mensual</div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {formatUsd(bot.monthlyPriceUsd)}
              <span className="text-xs font-normal text-slate-400"> / mes</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsPurchaseModalOpen(true)}
              >
                <ShoppingCart className="h-4 w-4" />
                {isAuthenticated
                  ? 'Comprar Suscripción / Vincular Licencia'
                  : 'Comprar Suscripción (Requiere Login)'}
              </Button>
              {isAuthenticated ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/my-subscriptions')}
                >
                  <Download className="h-4 w-4" />
                  Ir a Mis Licencias
                </Button>
              ) : (
                <Link
                  to={`/auth/login?redirect=${encodeURIComponent(`/catalog/${bot.id}?intent=buy`)}`}
                >
                  <Button variant="secondary" size="md">
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {activatedBanner && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>
                ¡Estrategia <strong>{bot.codeName}</strong> habilitada en tu licencia activa! Ya puedes cargarla desde NinjaTrader 8.
              </span>
            </div>
            <Link
              to="/my-subscriptions"
              className="font-semibold underline text-emerald-300"
            >
              Ver mi LicenseKey →
            </Link>
          </div>
        )}
      </Card>

      {/* KPIs de Rendimiento del Bot */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Win Rate Certificado"
          value={`${bot.winRatePercent}%`}
          subtitle="Estadística en sesiones NY"
          icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          accent="emerald"
        />
        <StatCard
          title="Profit Factor"
          value={bot.profitFactor}
          subtitle="Relación Ganancia Bruta / Pérdida"
          icon={<Sparkles className="h-5 w-5 text-sky-400" />}
          accent="sky"
        />
        <StatCard
          title="Max Drawdown Histórico"
          value={formatUsd(bot.maxDrawdownUsd)}
          subtitle="Apto para cuentas de $50k+"
          icon={<Sliders className="h-5 w-5 text-rose-400" />}
          accent="rose"
        />
        <StatCard
          title="Capital Recomendado"
          value={formatUsd(bot.recommendedAccountSizeUsd)}
          subtitle="Cuentas de Fondeo o Live"
          icon={<Cpu className="h-5 w-5 text-emerald-400" />}
          accent="emerald"
        />
      </div>

      {/* Parámetros de Configuración en NinjaTrader 8 */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Parámetros NinjaScript Incluidos en {bot.codeName}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {bot.ninjaParameters.map((param) => (
            <div
              key={param.name}
              className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 flex items-start justify-between gap-4"
            >
              <div>
                <div className="font-mono text-xs font-bold text-emerald-300">
                  {param.name}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {param.description}
                </p>
              </div>
              <Badge variant="slate">{param.defaultValue}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal de Compra / Gate de Autenticación en Detalle del Bot */}
      <PurchaseGateModal
        bot={isPurchaseModalOpen ? bot : null}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccessActivated={() => setActivatedBanner(true)}
      />
    </div>
  );
};

export const MyBotsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [bots, setBots] = useState<PurchasedBotItem[]>([]);

  useEffect(() => {
    setBots(getStoredPurchasedBots());
  }, []);

  const handleDownloadStrategy = (botItem: PurchasedBotItem) => {
    const csContent = `// =====================================================================
// Trading Life Academy - NinjaScript Strategy Export
// Bot: ${botItem.botName} (${botItem.codeName})
// Instrumento: ${botItem.instrument}
// Perfil de Riesgo: ${botItem.riskProfile}
// LicenseKey: ${botItem.licenseKey}
// Machine ID: ${botItem.machineId}
// Licenciatario: ${user.fullName} (${user.email})
// =====================================================================

#region Using declarations
using System;
using System.ComponentModel;
using NinjaTrader.Cbi;
using NinjaTrader.Gui;
using NinjaTrader.NinjaScript;
using NinjaTrader.NinjaScript.Strategies;
#endregion

namespace NinjaTrader.NinjaScript.Strategies.TradingLifeAcademy
{
    public class ${botItem.codeName.replace(/[^a-zA-Z0-9]/g, '_')} : Strategy
    {
        [NinjaScriptProperty]
        [Display(Name = "License Key", GroupName = "TLA Security", Order = 1)]
        public string LicenseKey { get; set; } = "${botItem.licenseKey}";

        [NinjaScriptProperty]
        [Display(Name = "Risk Profile", GroupName = "TLA Parameters", Order = 2)]
        public string RiskProfile { get; set; } = "${botItem.riskProfile}";

        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = "Algoritmo ${botItem.botName} provisto por Trading Life Academy.";
                Name = "${botItem.codeName}";
                Calculate = Calculate.OnBarClose;
                EntriesPerDirection = 1;
                EntryHandling = EntryHandling.AllEntries;
                IsExitOnSessionCloseStrategy = true;
                ExitOnSessionCloseSeconds = 30;
                IsFillLimitOnTouch = false;
                MaximumBarsLookBack = MaximumBarsLookBack.TwoHundredFiftySix;
                OrderFillResolution = OrderFillResolution.Standard;
                Slippage = 1;
                StartBehavior = StartBehavior.WaitUntilFlat;
                TimeInForce = TimeInForce.Gtc;
                TraceOrders = false;
                RealtimeErrorHandling = RealtimeErrorHandling.StopCancelClose;
                StopTargetHandling = StopTargetHandling.PerEntryExecution;
                BarsRequiredToTrade = 20;
            }
        }
    }
}
`;
    const blob = new Blob([csContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${botItem.codeName}.cs`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(
      'Archivo NinjaScript generado',
      `Descargando ${botItem.codeName}.cs para NinjaTrader 8.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="amber">Trading Life Academy • Estudiante</Badge>
            <Badge variant="emerald">NinjaTrader 8</Badge>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bot className="h-7 w-7 text-emerald-400" />
            Mis Bots Adquiridos
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Administra los algoritmos algorítmicos vinculados a tu cuenta y descarga tus archivos NinjaScript (.cs) compilables.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate('/catalog')}
          className="self-start sm:self-auto gap-2"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          Explorar Más Bots
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Bots en mi Colección"
          value={String(bots.length)}
          subtitle="Algoritmos con licencia activa"
          icon={<Bot className="h-5 w-5 text-emerald-400" />}
          accent="emerald"
        />
        <StatCard
          title="Terminal Vinculada"
          value="WIN11-TRD-9F82A1C0"
          subtitle="NinjaTrader 8.1.3.1 (64-bit)"
          icon={<Cpu className="h-5 w-5 text-sky-400" />}
          accent="sky"
        />
        <StatCard
          title="LicenseKey Principal"
          value="NT8-QTM-9921-ALPHA"
          subtitle="Sincronización remota activa"
          icon={<CheckCircle2 className="h-5 w-5 text-amber-400" />}
          accent="amber"
        />
      </div>

      {/* Grid de Bots Adquiridos */}
      {bots.length === 0 ? (
        <Card className="p-12 text-center border-slate-800 bg-slate-900/60 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Aún no tienes bots adquiridos</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              Explora nuestro catálogo de algoritmos para futuros (Proton, Nova, Pulsar) y adquiere tu primera licencia.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/catalog')}>
            Ir al Catálogo de Bots
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((botItem) => (
            <Card
              key={botItem.id}
              className="p-5 border-slate-800 bg-slate-900/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{botItem.botName}</h3>
                      <span className="font-mono text-xs text-slate-400">{botItem.codeName}</span>
                    </div>
                  </div>
                  <Badge variant="emerald">Activo en NT8</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Instrumento:</span>
                    <span className="font-semibold text-slate-200">{botItem.instrument}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Prop Firm / Regla:</span>
                    <Badge variant="amber">{botItem.riskProfile}</Badge>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Ciclo:</span>
                    <span className="text-slate-300">
                      {botItem.billingCycle === 'MONTHLY'
                        ? 'Mensual'
                        : botItem.billingCycle === 'ANNUAL'
                        ? 'Anual'
                        : 'Vitalicio'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">LicenseKey:</span>
                    <span className="font-mono text-amber-300 font-semibold">{botItem.licenseKey}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Machine ID:</span>
                    <span className="font-mono text-slate-300">{botItem.machineId}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownloadStrategy(botItem)}
                  className="w-full gap-2 justify-center"
                >
                  <Download className="h-4 w-4" />
                  Descargar AddOn (.cs)
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/catalog/${botItem.botId}`)}
                    className="w-full text-xs"
                  >
                    Ver Parámetros
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/my-subscriptions')}
                    className="w-full text-xs"
                  >
                    Licencia NT8
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

