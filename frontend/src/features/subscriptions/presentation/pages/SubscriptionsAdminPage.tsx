import React, { useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  Cpu,
  Edit3,
  KeyRound,
  Plus,
  PowerOff,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trash2,
  Zap,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { RemoteSwitch } from '@shared/ui/RemoteSwitch';
import { StatCard } from '@shared/ui/StatCard';
import { ConfirmDialog } from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/toast/toastStore';
import { useI18n } from '@core/i18n/useLanguageStore';
import { formatRelativeTime, formatUsd } from '@shared/utils/formatters';
import {
  useAuditLogsPolling,
  useCreateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useGlobalKillSwitchMutation,
  useResetMachineIdMutation,
  useSimulateNinjaHeartbeatMutation,
  useSubscriptionsPolling,
  useToggleRemoteSubscriptionMutation,
  useUpdateSubscriptionMutation,
} from '@features/subscriptions/application/hooks/useSubscriptionsPolling';
import {
  getSubscriptionPlanLabel,
  type Subscription,
} from '@features/subscriptions/domain/entities/Subscription';
import {
  CreateSubscriptionModal,
  EditSubscriptionModal,
} from '../components/SubscriptionAdminModals';

interface SubscriptionsAdminPageProps {
  onSelectLicenseForLab: (licenseKey: string) => void;
}

export const SubscriptionsAdminPage: React.FC<SubscriptionsAdminPageProps> = ({
  onSelectLicenseForLab,
}) => {
  const { t } = useI18n();
  const { data: subscriptions = [], isLoading } = useSubscriptionsPolling();
  const { data: auditLogs = [] } = useAuditLogsPolling();

  const toggleMutation = useToggleRemoteSubscriptionMutation();
  const globalKillSwitchMutation = useGlobalKillSwitchMutation();
  const resetMachineIdMutation = useResetMachineIdMutation();
  const simulateHeartbeatMutation = useSimulateNinjaHeartbeatMutation();
  const createMutation = useCreateSubscriptionMutation();
  const updateMutation = useUpdateSubscriptionMutation();
  const deleteMutation = useDeleteSubscriptionMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ENABLED' | 'DISABLED' | 'PENDING_ACK'
  >('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [deletingSubscription, setDeletingSubscription] =
    useState<Subscription | null>(null);

  const handleCreateSubscription = (subData: Partial<Subscription>) => {
    createMutation.mutate(subData, {
      onSuccess: (created) => {
        setIsCreateModalOpen(false);
        toast.success(
          'Suscripción creada con éxito',
          `${created.traderName} ahora tiene acceso al catálogo completo de bots.`
        );
      },
      onError: (err) => {
        toast.danger(
          'Error al crear suscripción',
          err instanceof Error ? err.message : 'No se pudo crear la suscripción.'
        );
      },
    });
  };

  const handleUpdateSubscription = (
    id: string,
    updates: Partial<Subscription>
  ) => {
    updateMutation.mutate(
      { id, updates },
      {
        onSuccess: (updated) => {
          setEditingSubscription(null);
          toast.success(
            'Suscripción actualizada',
            `Cambios guardados para ${updated.traderName}.`
          );
        },
        onError: (err) => {
          toast.danger(
            'Error al actualizar',
            err instanceof Error
              ? err.message
              : 'No se pudo actualizar la suscripción.'
          );
        },
      }
    );
  };

  const handleDeleteSubscription = () => {
    if (!deletingSubscription) return;
    const target = deletingSubscription;
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        setDeletingSubscription(null);
        toast.success(
          'Suscripción eliminada',
          `Se ha revocado la suscripción de ${target.traderName}.`
        );
      },
      onError: () => {
        toast.danger('Error al eliminar la suscripción');
      },
    });
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.traderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.licenseKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.ninjaAccountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.instrument.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'ENABLED') return sub.remoteEnabled;
      if (statusFilter === 'DISABLED') return !sub.remoteEnabled;
      if (statusFilter === 'PENDING_ACK') return sub.syncState === 'PENDING_ACK';
      return true;
    });
  }, [subscriptions, searchQuery, statusFilter]);

  const metrics = useMemo(() => {
    const activeCount = subscriptions.filter((s) => s.remoteEnabled).length;
    const confirmedTrading = subscriptions.filter(
      (s) => s.connectionStatus === 'ONLINE_TRADING'
    ).length;
    const pendingAck = subscriptions.filter(
      (s) => s.syncState === 'PENDING_ACK'
    ).length;
    const totalDailyPnl = subscriptions.reduce(
      (acc, item) => acc + item.dailyPnlUsd,
      0
    );

    return {
      activeCount,
      confirmedTrading,
      pendingAck,
      totalDailyPnl,
    };
  }, [subscriptions]);

  const handleForceImmediateHeartbeat = (sub: Subscription) => {
    simulateHeartbeatMutation.mutate({
      licenseKey: sub.licenseKey,
      machineId: sub.boundMachineId ?? 'WIN11-NEW-BIND-01',
      strategyName: sub.activeStrategyName,
      accountName: sub.ninjaAccountName,
      instrument: sub.instrument,
      currentSessionPnlUsd: sub.dailyPnlUsd,
      tamperHmacSignature: false,
      simulatedLatencyMs: 31,
    });
  };

  const [killSwitchDialog, setKillSwitchDialog] = useState<
    null | 'DISABLE_ALL' | 'ENABLE_ALL'
  >(null);

  const handleToggle = (sub: Subscription) => {
    const nextEnabled = !sub.remoteEnabled;
    toggleMutation.mutate(
      {
        subscriptionId: sub.id,
        enabled: nextEnabled,
        reason: nextEnabled
          ? 'Reactivación manual desde Panel Admin'
          : 'Desactivación manual desde Panel Admin',
      },
      {
        onSuccess: () => {
          const description = `${sub.traderName} — ${t.toast.pendingAckDesc}`;
          if (nextEnabled) {
            toast.success(t.toast.subscriptionOn, description);
          } else {
            toast.warning(t.toast.subscriptionOff, description);
          }
        },
        onError: () => toast.danger(t.toast.actionError),
      }
    );
  };

  const handleResetHwid = (sub: Subscription) => {
    resetMachineIdMutation.mutate(sub.id, {
      onSuccess: () =>
        toast.info(t.toast.hwidReset, `${sub.traderName} — ${t.toast.hwidResetDesc}`),
      onError: () => toast.danger(t.toast.actionError),
    });
  };

  const handleConfirmKillSwitch = (reason: string) => {
    const enabled = killSwitchDialog === 'ENABLE_ALL';
    globalKillSwitchMutation.mutate(
      { enabled, reason },
      {
        onSuccess: () => {
          setKillSwitchDialog(null);
          if (enabled) {
            toast.success(t.toast.enableAllExecuted, reason);
          } else {
            toast.danger(t.toast.killSwitchExecuted, reason);
          }
        },
        onError: () => toast.danger(t.toast.actionError),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabecera de Control Remoto */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t.adminSubs.title}
            </h1>
            <Badge variant="emerald" pulse>
              {t.adminSubs.badgePolling}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {t.adminSubs.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 shadow-md shadow-emerald-500/10"
          >
            <Plus className="h-4 w-4" />
            + Crear Suscripción
          </Button>
          <Button
            variant="danger"
            size="md"
            isLoading={globalKillSwitchMutation.isPending}
            onClick={() => setKillSwitchDialog('DISABLE_ALL')}
          >
            <PowerOff className="h-4 w-4" />
            {t.adminSubs.globalKillSwitch}
          </Button>
          <Button
            variant="secondary"
            size="md"
            isLoading={globalKillSwitchMutation.isPending}
            onClick={() => setKillSwitchDialog('ENABLE_ALL')}
          >
            <Zap className="h-4 w-4 text-emerald-400" />
            {t.adminSubs.enableAll}
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t.adminSubs.kpiAuthorizedTitle}
          value={`${metrics.activeCount} / ${subscriptions.length}`}
          subtitle={t.adminSubs.kpiAuthorizedSub}
          icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
          accent="emerald"
        />
        <StatCard
          title={t.adminSubs.kpiTerminalsTitle}
          value={metrics.confirmedTrading}
          subtitle={t.adminSubs.kpiTerminalsSub}
          icon={<Activity className="h-5 w-5 text-sky-400" />}
          accent="sky"
        />
        <StatCard
          title={t.adminSubs.kpiPendingTitle}
          value={metrics.pendingAck}
          subtitle={
            metrics.pendingAck > 0
              ? t.adminSubs.kpiPendingSubActive
              : t.adminSubs.kpiPendingSubIdle
          }
          icon={<RefreshCcw className="h-5 w-5 text-amber-400" />}
          accent="amber"
        />
        <StatCard
          title={t.adminSubs.kpiPnlTitle}
          value={formatUsd(metrics.totalDailyPnl, true)}
          subtitle={t.adminSubs.kpiPnlSub}
          icon={<Zap className="h-5 w-5 text-emerald-400" />}
          accent={metrics.totalDailyPnl >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.adminSubs.searchPlaceholder}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/90 py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'ALL', label: t.adminSubs.filterAll },
                { id: 'ENABLED', label: t.adminSubs.filterEnabled },
                { id: 'DISABLED', label: t.adminSubs.filterDisabled },
                { id: 'PENDING_ACK', label: t.adminSubs.filterPending },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabla Principal de Suscripciones y Apagado/Encendido Remoto */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">{t.adminSubs.colTrader}</th>
                <th className="py-3.5 px-4">{t.adminSubs.colLicense}</th>
                <th className="py-3.5 px-4">{t.adminSubs.colStrategy}</th>
                <th className="py-3.5 px-4">{t.adminSubs.colStatus}</th>
                <th className="py-3.5 px-4">{t.adminSubs.colLastPoll}</th>
                <th className="py-3.5 px-4 text-right">
                  {t.adminSubs.colActions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    {t.adminTable.loading}
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    {t.adminTable.empty}
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Trader y Cuenta */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {sub.traderName}
                        </span>
                        {(() => {
                          const planInfo = getSubscriptionPlanLabel(sub);
                          return (
                            <Badge
                              variant={
                                planInfo.cycle === 'ANNUAL' ? 'amber' : 'sky'
                              }
                            >
                              {planInfo.label}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="text-xs text-slate-400">{sub.email}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          Vence:{' '}
                          <strong className="text-slate-300">
                            {new Date(sub.expiresAt).toLocaleDateString()}
                          </strong>
                        </span>
                        <span className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-sky-300">
                          {t.adminTable.account} {sub.ninjaAccountName}
                        </span>
                      </div>
                    </td>

                    {/* Licencia y MachineID */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-300">
                        <KeyRound className="h-3.5 w-3.5" />
                        {sub.licenseKey}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <Cpu className="h-3.5 w-3.5 text-slate-500" />
                        <span className="font-mono">
                          {sub.boundMachineId ?? t.adminTable.unbound}
                        </span>
                        {sub.boundMachineId && (
                          <button
                            type="button"
                            onClick={() => handleResetHwid(sub)}
                            className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                            title="Liberar MachineID para permitir cambio de PC del cliente"
                          >
                            Reset HWID
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Estrategia y PnL */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-200">
                        {sub.activeStrategyName}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="slate">{sub.instrument}</Badge>
                        <span
                          className={`text-xs font-mono font-semibold ${
                            sub.dailyPnlUsd >= 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {formatUsd(sub.dailyPnlUsd, true)} {t.adminTable.today}
                        </span>
                      </div>
                    </td>

                    {/* Estado de Sincronización con NinjaTrader */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-start gap-1">
                        {sub.connectionStatus === 'ONLINE_TRADING' && (
                          <Badge variant="emerald" pulse>
                            {t.adminSubs.statusLive}
                          </Badge>
                        )}
                        {sub.connectionStatus === 'PAUSED_REMOTE' && (
                          <Badge variant="rose">{t.adminSubs.statusPaused}</Badge>
                        )}
                        {sub.connectionStatus === 'SECURITY_BLOCKED' && (
                          <Badge variant="amber" pulse>
                            {t.adminSubs.statusBlocked}
                          </Badge>
                        )}
                        {sub.connectionStatus === 'OFFLINE' && (
                          <Badge variant="slate">{t.adminSubs.statusOffline}</Badge>
                        )}
                        <span className="text-[11px] text-slate-400 max-w-sm xl:max-w-md leading-tight">
                          {sub.statusNote}
                        </span>
                      </div>
                    </td>

                    {/* Último Poll HTTP */}
                    <td className="py-4 px-4">
                      <div className="text-xs font-medium text-slate-200 tabular-nums">
                        {formatRelativeTime(sub.lastHeartbeatAt)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {t.adminTable.latency} {sub.lastLatencyMs} ms
                      </div>
                    </td>

                    {/* Acciones Remotas */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <RemoteSwitch
                          isEnabled={sub.remoteEnabled}
                          syncState={sub.syncState}
                          onToggle={() => handleToggle(sub)}
                        />

                        {sub.syncState === 'PENDING_ACK' && (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleForceImmediateHeartbeat(sub)}
                            title="Forzar ciclo inmediato de Polling"
                          >
                            <RefreshCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingSubscription(sub)}
                          className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 gap-1.5 cursor-pointer text-xs"
                          title="Editar suscripción, plan y vigencia"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Editar
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDeletingSubscription(sub)}
                          className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 gap-1.5 cursor-pointer text-xs"
                          title="Eliminar o revocar suscripción"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Revocar
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectLicenseForLab(sub.licenseKey)}
                          title="Probar en simulador de telemetría"
                        >
                          <Terminal className="h-3.5 w-3.5 text-sky-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Registro de Auditoría en Tiempo Real */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              {t.adminSubs.auditTitle}
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {auditLogs.length} {t.adminSubs.auditCount}
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500">
                  {new Date(log.timestampIso).toLocaleTimeString('es-ES')}
                </span>
                <Badge
                  variant={
                    log.eventType.includes('SECURITY')
                      ? 'amber'
                      : log.allowedToTrade
                      ? 'emerald'
                      : 'rose'
                  }
                >
                  {log.remoteCommand}
                </Badge>
                <span className="font-semibold text-slate-200">
                  {log.licenseKey}
                </span>
                <span className="text-slate-400">({log.traderName})</span>
              </div>
              <div className="text-slate-300 sm:text-right">{log.details}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal de confirmación del Kill-Switch Global (acción crítica) */}
      <ConfirmDialog
        open={killSwitchDialog !== null}
        variant={killSwitchDialog === 'ENABLE_ALL' ? 'primary' : 'danger'}
        title={
          killSwitchDialog === 'ENABLE_ALL'
            ? t.dialog.enableTitle
            : t.dialog.killTitle
        }
        description={
          killSwitchDialog === 'ENABLE_ALL'
            ? t.dialog.enableDesc
            : t.dialog.killDesc
        }
        confirmLabel={
          killSwitchDialog === 'ENABLE_ALL'
            ? t.dialog.enableConfirm
            : t.dialog.killConfirm
        }
        cancelLabel={t.dialog.cancel}
        requireReason
        reasonLabel={t.dialog.reasonLabel}
        reasonPlaceholder={t.dialog.reasonPlaceholder}
        reasonRequiredMessage={t.dialog.reasonRequired}
        quickReasons={t.dialog.quickReasons}
        isLoading={globalKillSwitchMutation.isPending}
        onConfirm={handleConfirmKillSwitch}
        onCancel={() => setKillSwitchDialog(null)}
      />

      {/* Modal para Crear Nueva Suscripción */}
      <CreateSubscriptionModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubscription}
        isLoading={createMutation.isPending}
      />

      {/* Modal para Editar Suscripción Existente */}
      <EditSubscriptionModal
        subscription={editingSubscription}
        onClose={() => setEditingSubscription(null)}
        onSubmit={handleUpdateSubscription}
        isLoading={updateMutation.isPending}
      />

      {/* Modal de Confirmación para Eliminar Suscripción */}
      <ConfirmDialog
        open={deletingSubscription !== null}
        variant="danger"
        title="Revocar y Eliminar Suscripción"
        description={
          deletingSubscription
            ? `¿Estás seguro de que deseas revocar y eliminar la suscripción de ${deletingSubscription.traderName} (${deletingSubscription.email})? Se suspenderá su acceso al catálogo de bots y a la LicenseKey ${deletingSubscription.licenseKey}.`
            : ''
        }
        confirmLabel="Eliminar Suscripción"
        cancelLabel="Cancelar"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteSubscription}
        onCancel={() => setDeletingSubscription(null)}
      />
    </div>
  );
};
