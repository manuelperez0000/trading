import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Cpu,
  Edit3,
  Eye,
  FileCheck2,
  KeyRound,
  MessageCircle,
  Plus,
  PowerOff,
  RefreshCcw,
  Search,
  ShieldAlert,
  Terminal,
  Trash2,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { RemoteSwitch } from '@shared/ui/RemoteSwitch';
import { ConfirmDialog } from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/toast/toastStore';
import { useI18n } from '@core/i18n/useLanguageStore';
import { formatRelativeTime, formatUsd } from '@shared/utils/formatters';
import { container } from '@app/di/container';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import {
  createNewTestClient,
  getEffectiveKycReviewDetails,
  getStoredTestClients,
  type KycVerificationStatus,
  type User as UserEntity,
} from '@features/auth/domain/entities/User';
import {
  buildCleanWhatsAppNumber,
  ClientKycReviewModal,
} from '../components/ClientKycReviewModal';
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
  isSubscriptionExpired,
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
  const navigate = useNavigate();
  const { impersonateTestClient } = useAuthStore();
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
    'ALL' | 'ENABLED' | 'DISABLED' | 'EXPIRED' | 'PENDING_ACK'
  >('ALL');
  const [subCurrentPage, setSubCurrentPage] = useState(1);
  const SUBSCRIPTIONS_PER_PAGE = 5;

  const location = useLocation();
  const isClientsRoute =
    location.pathname.includes('/clients') ||
    location.pathname.includes('/clientes');

  const [activeMainTab, setActiveMainTab] = useState<'SUBSCRIPTIONS' | 'USERS'>(
    () => (isClientsRoute ? 'USERS' : 'SUBSCRIPTIONS')
  );
  const [registeredUsers, setRegisteredUsers] = useState<UserEntity[]>(() =>
    getStoredTestClients()
  );
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientKycFilter, setClientKycFilter] = useState<
    'ALL' | KycVerificationStatus
  >('ALL');
  const [clientCurrentPage, setClientCurrentPage] = useState(1);
  const CLIENTS_PER_PAGE = 5;
  const [reviewingClient, setReviewingClient] = useState<UserEntity | null>(
    null
  );
  const [kycRefreshTick, setKycRefreshTick] = useState(0);
  const [isNewTestClientOpen, setIsNewTestClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientWhatsApp, setNewClientWhatsApp] = useState('+57 315-999-8877');
  const [newClientAddress, setNewClientAddress] = useState(
    'Av. Principal 840, Torre Norte, Piso 4'
  );
  const [newClientPresetStatus, setNewClientPresetStatus] =
    useState<KycVerificationStatus>('EN_REVISION');

  useEffect(() => {
    setActiveMainTab(isClientsRoute ? 'USERS' : 'SUBSCRIPTIONS');
  }, [isClientsRoute]);

  useEffect(() => {
    setIsLoadingUsers(true);
    const localTestClients = getStoredTestClients();
    container.listUsersUseCase
      .execute()
      .then((users) => {
        if (users.length > 0) {
          const existingEmails = new Set(users.map((u) => u.email.toLowerCase()));
          const extras = localTestClients.filter(
            (d) => !existingEmails.has(d.email.toLowerCase())
          );
          setRegisteredUsers([...extras, ...users]);
        } else {
          setRegisteredUsers(localTestClients);
        }
      })
      .catch(() => setRegisteredUsers(localTestClients))
      .finally(() => setIsLoadingUsers(false));
  }, []);

  const handleCreateQuickTestClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) {
      toast.danger('Completa el nombre y correo del cliente de prueba');
      return;
    }
    const created = createNewTestClient({
      fullName: newClientName,
      email: newClientEmail,
      whatsapp: newClientWhatsApp,
      direccion: newClientAddress,
      presetStatus: newClientPresetStatus,
    });
    setRegisteredUsers((prev) => [
      created,
      ...prev.filter((u) => u.email.toLowerCase() !== created.email.toLowerCase()),
    ]);
    setNewClientName('');
    setNewClientEmail('');
    setIsNewTestClientOpen(false);
    setKycRefreshTick((x) => x + 1);
    toast.success(
      'Cliente de prueba creado',
      `${created.fullName} (${created.kycStatus}) ya está disponible en el directorio.`
    );
  };

  const handleSimulateClientView = (client: UserEntity) => {
    impersonateTestClient(client);
    const kyc = getEffectiveKycReviewDetails(client);
    toast.info(
      `Simulando vista de cliente: ${client.fullName}`,
      `Estado KYC: ${kyc.status}. Usa la barra superior para volver a Consola Admin.`
    );
    if (kyc.status === 'VERIFICADO') {
      navigate('/dashboard');
    } else {
      navigate('/profile');
    }
  };

  const handleKycReviewSaved = (
    clientId: string,
    updated: {
      kycStatus: KycVerificationStatus;
      kycNotes: string;
      kycRejectedItems: string[];
    }
  ) => {
    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.id === clientId
          ? {
            ...u,
            kycStatus: updated.kycStatus,
            kycNotes: updated.kycNotes,
            kycRejectedItems: updated.kycRejectedItems,
            estado:
              updated.kycStatus === 'VERIFICADO'
                ? 'verificado'
                : updated.kycStatus === 'OBSERVADO'
                  ? 'observado'
                  : 'en_revision',
          }
          : u
      )
    );
    setKycRefreshTick((t) => t + 1);
  };

  const clientDirectoryStats = useMemo(() => {
    void kycRefreshTick;
    const nonAdminClients = registeredUsers.filter((u) => u.role !== 'ADMIN');
    let pendingReview = 0;
    let observed = 0;
    let verified = 0;
    let incomplete = 0;

    nonAdminClients.forEach((u) => {
      const st = getEffectiveKycReviewDetails(u).status;
      if (st === 'EN_REVISION') pendingReview++;
      else if (st === 'OBSERVADO') observed++;
      else if (st === 'VERIFICADO') verified++;
      else incomplete++;
    });

    return {
      total: registeredUsers.length,
      pendingReview,
      observed,
      verified,
      incomplete,
    };
  }, [registeredUsers, kycRefreshTick]);

  const filteredDirectoryUsers = useMemo(() => {
    void kycRefreshTick;
    const q = clientSearchQuery.trim().toLowerCase();

    const filtered = registeredUsers.filter((u) => {
      const kyc = getEffectiveKycReviewDetails(u);
      if (clientKycFilter !== 'ALL') {
        if (u.role === 'ADMIN' && clientKycFilter !== 'VERIFICADO') return false;
        if (kyc.status !== clientKycFilter) return false;
      }

      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.handle || '').toLowerCase().includes(q) ||
        (u.telefono || '').toLowerCase().includes(q) ||
        (u.whatsapp || '').toLowerCase().includes(q) ||
        (u.direccion || '').toLowerCase().includes(q)
      );
    });

    // Ordenar priorizando los nuevos clientes EN_REVISION arriba, luego OBSERVADO, INCOMPLETO y VERIFICADO
    const priorityOrder: Record<KycVerificationStatus, number> = {
      EN_REVISION: 1,
      OBSERVADO: 2,
      INCOMPLETO: 3,
      VERIFICADO: 4,
    };

    return [...filtered].sort((a, b) => {
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return 1;
      if (a.role !== 'ADMIN' && b.role === 'ADMIN') return -1;
      const stA = getEffectiveKycReviewDetails(a).status;
      const stB = getEffectiveKycReviewDetails(b).status;
      return priorityOrder[stA] - priorityOrder[stB];
    });
  }, [registeredUsers, clientSearchQuery, clientKycFilter, kycRefreshTick]);

  const totalClientPages = Math.max(
    1,
    Math.ceil(filteredDirectoryUsers.length / CLIENTS_PER_PAGE)
  );
  const safeClientPage = Math.min(clientCurrentPage, totalClientPages);
  const paginatedDirectoryUsers = useMemo(() => {
    const startIdx = (safeClientPage - 1) * CLIENTS_PER_PAGE;
    return filteredDirectoryUsers.slice(startIdx, startIdx + CLIENTS_PER_PAGE);
  }, [filteredDirectoryUsers, safeClientPage]);

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
      if (statusFilter === 'EXPIRED') return isSubscriptionExpired(sub);
      if (statusFilter === 'ENABLED') {
        return sub.remoteEnabled && !isSubscriptionExpired(sub);
      }
      if (statusFilter === 'DISABLED') return !sub.remoteEnabled;
      if (statusFilter === 'PENDING_ACK') return sub.syncState === 'PENDING_ACK';
      return true;
    });
  }, [subscriptions, searchQuery, statusFilter]);

  const expiredSubscriptions = useMemo(
    () => subscriptions.filter((s) => isSubscriptionExpired(s)),
    [subscriptions]
  );
  const expiredWithBotsStillOn = useMemo(
    () => expiredSubscriptions.filter((s) => s.remoteEnabled),
    [expiredSubscriptions]
  );

  const handleDeactivateSingleExpired = (sub: Subscription) => {
    toggleMutation.mutate(
      {
        subscriptionId: sub.id,
        enabled: false,
        reason: 'Membresía vencida — Desactivación de todos los bots del usuario',
      },
      {
        onSuccess: () => {
          toast.warning(
            'Bots del usuario desactivados por vencimiento',
            `Se envió orden de apagado a todos los bots de ${sub.traderName} (${sub.licenseKey}).`
          );
        },
        onError: () => toast.danger(t.toast.actionError),
      }
    );
  };

  const handleDeactivateAllExpired = () => {
    if (expiredWithBotsStillOn.length === 0) return;
    expiredWithBotsStillOn.forEach((sub) => {
      toggleMutation.mutate({
        subscriptionId: sub.id,
        enabled: false,
        reason: 'Corte automático por vencimiento de membresía',
      });
    });
    toast.warning(
      'Membresías vencidas desactivadas',
      `Se desactivaron todos los bots de ${expiredWithBotsStillOn.length} usuario(s) con suscripción vencida.`
    );
  };

  const totalSubPages = Math.max(
    1,
    Math.ceil(filteredSubscriptions.length / SUBSCRIPTIONS_PER_PAGE)
  );
  const safeSubPage = Math.min(subCurrentPage, totalSubPages);
  const paginatedSubscriptions = useMemo(() => {
    const startIdx = (safeSubPage - 1) * SUBSCRIPTIONS_PER_PAGE;
    return filteredSubscriptions.slice(
      startIdx,
      startIdx + SUBSCRIPTIONS_PER_PAGE
    );
  }, [filteredSubscriptions, safeSubPage]);

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
      {/* Cabecera Dinámica según Módulo Admin: Suscripciones vs Clientes */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {activeMainTab === 'USERS'
                ? 'Directorio y Gestión de Clientes'
                : 'Control de Suscripciones y Licencias'}
            </h1>
            <Badge variant={activeMainTab === 'USERS' ? 'sky' : 'emerald'} pulse>
              {activeMainTab === 'USERS'
                ? `${registeredUsers.length} Registrados`
                : t.adminSubs.badgePolling}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {activeMainTab === 'USERS'
              ? 'Consulta la base de datos de clientes registrados, revisa sus datos de contacto y asígnales licencias de suscripción.'
              : t.adminSubs.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 text-xs shadow-sm shadow-amber-500/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Crear Suscripción
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isLoading={globalKillSwitchMutation.isPending}
            onClick={() => setKillSwitchDialog('ENABLE_ALL')}
            className="gap-1.5 text-xs"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            Habilitar Todas
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={globalKillSwitchMutation.isPending}
            onClick={() => setKillSwitchDialog('DISABLE_ALL')}
            className="gap-1.5 text-xs"
          >
            <PowerOff className="h-3.5 w-3.5" />
            Apagar Todas
          </Button>
        </div>
      </div>

      {/* Selector de Vista Principal: Suscripciones vs Directorio de Clientes */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveMainTab('SUBSCRIPTIONS')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${activeMainTab === 'SUBSCRIPTIONS'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
        >
          <KeyRound className="h-4 w-4 text-amber-400" />
          <span>Suscripciones & Licencias de Clientes</span>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-mono">
            {subscriptions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('USERS')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${activeMainTab === 'USERS'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
        >
          <Users className="h-4 w-4 text-sky-400" />
          <span>Directorio de Clientes Registrados</span>
          {registeredUsers.length > 0 && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-mono">
              {registeredUsers.length}
            </span>
          )}
        </button>
      </div>

      {activeMainTab === 'USERS' ? (
        <div className="space-y-6">
          <Card className="p-4 sm:p-5 overflow-hidden space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-sky-400" />
                  Directorio de Clientes y Auditoría de Documentación (KYC)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Revisa los documentos enviados por los nuevos clientes, aprueba su perfil o envíales observaciones por plataforma y WhatsApp para que actualicen sus datos.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsNewTestClientOpen((prev) => !prev)}
                  className="gap-1.5 border-amber-500/40 text-amber-300"
                >
                  <UserPlus className="h-4 w-4" />
                  + Crear Cliente de Prueba
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Suscripción
                </Button>
              </div>
            </div>

            {isNewTestClientOpen && (
              <form
                onSubmit={handleCreateQuickTestClient}
                className="rounded-xl border border-amber-500/40 bg-slate-950/90 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Generador Rápido de Clientes de Prueba (Con Expediente KYC)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsNewTestClientOpen(false)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Nombre completo *"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="correo@ejemplo.com *"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={newClientWhatsApp}
                    onChange={(e) => setNewClientWhatsApp(e.target.value)}
                    placeholder="WhatsApp (+57...)"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    placeholder="Dirección física"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                  <select
                    value={newClientPresetStatus}
                    onChange={(e) =>
                      setNewClientPresetStatus(
                        e.target.value as KycVerificationStatus
                      )
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="EN_REVISION">Estado: En Revisión (3 Docs)</option>
                    <option value="OBSERVADO">Estado: Con Observaciones (ID Borroso)</option>
                    <option value="VERIFICADO">Estado: Verificado (Aprobado)</option>
                    <option value="INCOMPLETO">Estado: Incompleto (Sin Docs)</option>
                  </select>
                  <Button type="submit" variant="primary" size="sm" className="justify-center">
                    <UserPlus className="h-3.5 w-3.5" />
                    Agregar Cliente
                  </Button>
                </div>
              </form>
            )}

            {/* Buscador y Filtros Rápidos del Directorio de Clientes */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-t border-slate-800/80 pt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={clientSearchQuery}
                  onChange={(e) => {
                    setClientSearchQuery(e.target.value);
                    setClientCurrentPage(1);
                  }}
                  placeholder="Buscar cliente por nombre, correo, WhatsApp, teléfono o dirección..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/90 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    {
                      key: 'ALL',
                      label: `Todos (${clientDirectoryStats.total})`,
                    },
                    {
                      key: 'EN_REVISION',
                      label: `⏳ En Revisión (${clientDirectoryStats.pendingReview})`,
                    },
                    {
                      key: 'OBSERVADO',
                      label: `⚠️ Con Observaciones (${clientDirectoryStats.observed})`,
                    },
                    {
                      key: 'VERIFICADO',
                      label: `✅ Verificados (${clientDirectoryStats.verified})`,
                    },
                    {
                      key: 'INCOMPLETO',
                      label: `📝 Incompletos (${clientDirectoryStats.incomplete})`,
                    },
                  ] as const
                ).map((pill) => {
                  const isActive = clientKycFilter === pill.key;
                  return (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => {
                        setClientKycFilter(pill.key);
                        setClientCurrentPage(1);
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${isActive
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Cliente / Usuario</th>
                    <th className="py-3 px-4">Contacto & WhatsApp</th>
                    <th className="py-3 px-4">Documentos Cargados</th>
                    <th className="py-3 px-4">Estado Revisión KYC</th>
                    <th className="py-3 px-4 text-right">Acciones de Revisión y Licencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-sm">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Cargando directorio de clientes...
                      </td>
                    </tr>
                  ) : filteredDirectoryUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No se encontraron clientes que coincidan con el filtro o la búsqueda actual.
                      </td>
                    </tr>
                  ) : (
                    paginatedDirectoryUsers.map((u) => {
                      const hasSub = subscriptions.find(
                        (s) => s.email.toLowerCase() === u.email.toLowerCase()
                      );
                      const kyc = getEffectiveKycReviewDetails(u);
                      const cleanWa = buildCleanWhatsAppNumber(
                        u.whatsapp || u.telefono
                      );
                      const docsList = [
                        { label: 'ID', ok: Boolean(u.urlDocumentoIdentidad?.trim()) },
                        { label: 'Recibo', ok: Boolean(u.urlReciboServicio?.trim()) },
                        { label: 'Contrato', ok: Boolean(u.urlContratoDisclaimer?.trim()) },
                      ];
                      const uploadedDocsCount = docsList.filter((d) => d.ok).length;

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-800/30 transition-colors ${kyc.status === 'EN_REVISION' && u.role !== 'ADMIN'
                              ? 'bg-amber-500/5'
                              : ''
                            }`}
                        >
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span>{u.fullName}</span>
                              <Badge variant={u.role === 'ADMIN' ? 'amber' : 'sky'}>
                                {u.role}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              {u.email}
                            </div>
                            {u.direccion && u.role !== 'ADMIN' && (
                              <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                                📍 {u.direccion}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-xs text-slate-300">
                            {u.role === 'ADMIN' ? (
                              <span className="text-slate-500 italic">
                                No requerido (Admin)
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <div className="font-mono">
                                  {u.whatsapp || u.telefono || 'Sin teléfono'}
                                </div>
                                {cleanWa && (
                                  <a
                                    href={`https://wa.me/${cleanWa}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                    WhatsApp
                                  </a>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {u.role === 'ADMIN' ? (
                              <span className="text-xs text-slate-500 italic">
                                Exento de KYC
                              </span>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="text-xs font-bold text-slate-200">
                                  {uploadedDocsCount} / 3 Documentos
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {docsList.map((d) => (
                                    <span
                                      key={d.label}
                                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${d.ok
                                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                                        }`}
                                    >
                                      {d.ok ? '✓' : '○'} {d.label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {u.role === 'ADMIN' ? (
                              <Badge variant="emerald">Acceso Total</Badge>
                            ) : kyc.status === 'VERIFICADO' ? (
                              <Badge variant="emerald">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verificado
                              </Badge>
                            ) : kyc.status === 'EN_REVISION' ? (
                              <Badge variant="amber" pulse>
                                ⏳ En Revisión (Nuevo)
                              </Badge>
                            ) : kyc.status === 'OBSERVADO' ? (
                              <div className="space-y-1 max-w-[220px]">
                                <Badge variant="rose">
                                  ⚠️ Con Observaciones
                                </Badge>
                                {kyc.notes && (
                                  <p
                                    className="text-[11px] text-rose-300/90 truncate"
                                    title={kyc.notes}
                                  >
                                    "{kyc.notes}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Badge variant="sky">📝 Incompleto</Badge>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              {u.role !== 'ADMIN' && (
                                <>
                                  <Button
                                    variant={
                                      kyc.status === 'EN_REVISION'
                                        ? 'primary'
                                        : 'secondary'
                                    }
                                    size="sm"
                                    onClick={() => setReviewingClient(u)}
                                    className="text-xs gap-1.5"
                                  >
                                    <FileCheck2 className="h-3.5 w-3.5" />
                                    {kyc.status === 'EN_REVISION'
                                      ? 'Revisar Documentos'
                                      : 'Ver Expediente KYC'}
                                  </Button>

                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleSimulateClientView(u)}
                                    className="text-xs gap-1 border-sky-500/30 text-sky-300 hover:bg-sky-500/15"
                                    title="Entrar temporalmente como este cliente para probar su vista de Perfil o Dashboard"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Vista Cliente
                                  </Button>
                                </>
                              )}

                              {hasSub ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setActiveMainTab('SUBSCRIPTIONS');
                                    setSearchQuery(u.email);
                                  }}
                                  className="text-xs text-emerald-400 border-emerald-500/30 gap-1.5"
                                >
                                  <KeyRound className="h-3.5 w-3.5" />
                                  Licencia ({hasSub.licenseKey})
                                </Button>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setIsCreateModalOpen(true);
                                  }}
                                  className="text-xs gap-1.5"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Asignar Licencia
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Barra de Paginación (5 en 5 Clientes) */}
            {filteredDirectoryUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
                <div>
                  Mostrando{' '}
                  <span className="font-bold text-white">
                    {(safeClientPage - 1) * CLIENTS_PER_PAGE + 1}
                  </span>{' '}
                  a{' '}
                  <span className="font-bold text-white">
                    {Math.min(
                      safeClientPage * CLIENTS_PER_PAGE,
                      filteredDirectoryUsers.length
                    )}
                  </span>{' '}
                  de{' '}
                  <span className="font-bold text-amber-400">
                    {filteredDirectoryUsers.length}
                  </span>{' '}
                  clientes (5 por página)
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeClientPage <= 1}
                    onClick={() =>
                      setClientCurrentPage((p) => Math.max(1, p - 1))
                    }
                    className={`rounded-lg border px-3 py-1.5 font-semibold transition-all ${safeClientPage <= 1
                        ? 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-amber-500/40 hover:text-amber-300 cursor-pointer'
                      }`}
                  >
                    ← Anterior
                  </button>

                  {Array.from({ length: totalClientPages }, (_, idx) => idx + 1).map(
                    (pageNum) => {
                      const isCurrent = pageNum === safeClientPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setClientCurrentPage(pageNum)}
                          className={`h-8 min-w-8 rounded-lg px-2.5 font-bold transition-all cursor-pointer ${isCurrent
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    type="button"
                    disabled={safeClientPage >= totalClientPages}
                    onClick={() =>
                      setClientCurrentPage((p) =>
                        Math.min(totalClientPages, p + 1)
                      )
                    }
                    className={`rounded-lg border px-3 py-1.5 font-semibold transition-all ${safeClientPage >= totalClientPages
                        ? 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-amber-500/40 hover:text-amber-300 cursor-pointer'
                      }`}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <>
          {/* Barra de Búsqueda y Filtros */}
          <Card className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-lg">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSubCurrentPage(1);
                  }}
                  placeholder={t.adminSubs.searchPlaceholder}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/90 py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {expiredWithBotsStillOn.length > 0 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeactivateAllExpired}
                    className="gap-1.5 text-xs"
                    title="Apagar inmediatamente todos los bots de los clientes cuya membresía ya venció"
                  >
                    <PowerOff className="h-3.5 w-3.5" />
                    Cortar Vencidas ({expiredWithBotsStillOn.length})
                  </Button>
                )}
                {(
                  [
                    { id: 'ALL', label: t.adminSubs.filterAll },
                    { id: 'ENABLED', label: t.adminSubs.filterEnabled },
                    { id: 'DISABLED', label: t.adminSubs.filterDisabled },
                    {
                      id: 'EXPIRED',
                      label: `Vencidas (${expiredSubscriptions.length})`,
                    },
                    { id: 'PENDING_ACK', label: t.adminSubs.filterPending },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setSubCurrentPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${statusFilter === tab.id
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
                    paginatedSubscriptions.map((sub) => (
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
                              <strong
                                className={
                                  isSubscriptionExpired(sub)
                                    ? 'text-rose-400'
                                    : 'text-slate-300'
                                }
                              >
                                {new Date(sub.expiresAt).toLocaleDateString()}
                              </strong>
                            </span>
                            {isSubscriptionExpired(sub) && (
                              <Badge variant="rose">Membresía Vencida</Badge>
                            )}
                            <span className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-sky-300">
                              {t.adminTable.account} {sub.ninjaAccountName}
                            </span>
                          </div>
                        </td>

                        {/* Licencia y MachineID (1 PC Exclusiva) */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-300">
                            <KeyRound className="h-3.5 w-3.5" />
                            {sub.licenseKey}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                            <Cpu className="h-3.5 w-3.5 text-sky-400" />
                            <span className="font-mono text-slate-200">
                              {sub.boundMachineId ?? t.adminTable.unbound}
                            </span>
                            {sub.boundMachineId && (
                              <>
                                <Badge variant="sky">1 PC Bloqueada</Badge>
                                <button
                                  type="button"
                                  onClick={() => handleResetHwid(sub)}
                                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                                  title="Liberar MachineID para permitir cambio de PC del cliente"
                                >
                                  Reset HWID
                                </button>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Cobertura de Membresía y Telemetría */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-emerald-300 text-xs">
                            ✓ Catálogo Completo de Bots
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="slate">{sub.instrument}</Badge>
                            <span
                              className={`text-xs font-mono font-semibold ${sub.dailyPnlUsd >= 0
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
                            {isSubscriptionExpired(sub) && sub.remoteEnabled && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeactivateSingleExpired(sub)}
                                className="gap-1 text-xs"
                                title="La suscripción venció: desactivar inmediatamente todos los bots de este usuario"
                              >
                                <PowerOff className="h-3.5 w-3.5" />
                                Desactivar Bots (Vencida)
                              </Button>
                            )}
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

            {/* Barra de Paginación de Suscripciones y Licencias (5 en 5) */}
            {filteredSubscriptions.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-800/80 px-4 py-3.5 text-xs text-slate-400 bg-slate-950/40">
                <div>
                  Mostrando{' '}
                  <span className="font-bold text-white">
                    {(safeSubPage - 1) * SUBSCRIPTIONS_PER_PAGE + 1}
                  </span>{' '}
                  a{' '}
                  <span className="font-bold text-white">
                    {Math.min(
                      safeSubPage * SUBSCRIPTIONS_PER_PAGE,
                      filteredSubscriptions.length
                    )}
                  </span>{' '}
                  de{' '}
                  <span className="font-bold text-emerald-400">
                    {filteredSubscriptions.length}
                  </span>{' '}
                  suscripciones y licencias (5 por página)
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeSubPage <= 1}
                    onClick={() =>
                      setSubCurrentPage((p) => Math.max(1, p - 1))
                    }
                    className={`rounded-lg border px-3 py-1.5 font-semibold transition-all ${
                      safeSubPage <= 1
                        ? 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300 cursor-pointer'
                    }`}
                  >
                    ← Anterior
                  </button>

                  {Array.from({ length: totalSubPages }, (_, idx) => idx + 1).map(
                    (pageNum) => {
                      const isCurrent = pageNum === safeSubPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setSubCurrentPage(pageNum)}
                          className={`h-8 min-w-8 rounded-lg px-2.5 font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : 'border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    type="button"
                    disabled={safeSubPage >= totalSubPages}
                    onClick={() =>
                      setSubCurrentPage((p) =>
                        Math.min(totalSubPages, p + 1)
                      )
                    }
                    className={`rounded-lg border px-3 py-1.5 font-semibold transition-all ${
                      safeSubPage >= totalSubPages
                        ? 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300 cursor-pointer'
                    }`}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
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
        </>
      )}

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
      {/* Modal de Revisión de Expediente y Documentos KYC del Cliente */}
      <ClientKycReviewModal
        client={reviewingClient}
        onClose={() => setReviewingClient(null)}
        onReviewSaved={handleKycReviewSaved}
      />
    </div>
  );
};
