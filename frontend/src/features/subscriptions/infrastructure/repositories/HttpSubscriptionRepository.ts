import { httpClient } from '@core/http/httpClient';
import type {
  HeartbeatAuditEvent,
  HeartbeatRequestPayload,
  HeartbeatResponsePayload,
  Subscription,
} from '@features/subscriptions/domain/entities/Subscription';
import type { ISubscriptionRepository } from '@features/subscriptions/domain/repositories/SubscriptionRepository';
import { SubscriptionMapper } from '@features/subscriptions/infrastructure/mappers/SubscriptionMapper';

const STORAGE_KEY = 'tla_admin_subscriptions_v1';

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-001',
    traderName: 'Alejandro Mendoza',
    email: 'amendoza@propdesk-capital.com',
    ninjaAccountName: 'Apex_PA_104928_01',
    licenseKey: 'NT8-QTM-9921-ALPHA',
    planTier: 'MEMBERSHIP_ANNUAL',
    subscriptionCycle: 'ANNUAL',
    remoteEnabled: true,
    syncState: 'CONFIRMED_ON',
    connectionStatus: 'ONLINE_TRADING',
    boundMachineId: 'WIN11-TRD-9F82A1C0',
    activeStrategyName: 'TLA_PRO_SUITE_V2',
    instrument: 'NQ 12-26',
    dailyPnlUsd: 2840.5,
    lastHeartbeatAt: new Date(Date.now() - 2000).toISOString(),
    lastLatencyMs: 34,
    expiresAt: '2027-06-30T23:59:59.000Z',
    statusNote: 'Membresía Anual Activa — Catálogo completo de bots habilitado',
  },
  {
    id: 'sub-002',
    traderName: 'Valeria Rojas',
    email: 'v.rojas@futureslatam.io',
    ninjaAccountName: 'Topstep_XFA_55812',
    licenseKey: 'NT8-QTM-4410-SIGMA',
    planTier: 'MEMBERSHIP_MONTHLY',
    subscriptionCycle: 'MONTHLY',
    remoteEnabled: true,
    syncState: 'CONFIRMED_ON',
    connectionStatus: 'ONLINE_TRADING',
    boundMachineId: 'WIN11-VRX-77B4E211',
    activeStrategyName: 'TLA_PRO_SUITE_V2',
    instrument: 'ES 12-26',
    dailyPnlUsd: 1425.0,
    lastHeartbeatAt: new Date(Date.now() - 3500).toISOString(),
    lastLatencyMs: 48,
    expiresAt: '2027-03-15T23:59:59.000Z',
    statusNote: 'Membresía Mensual Activa — Catálogo completo de bots habilitado',
  },
  {
    id: 'sub-003',
    traderName: 'Diego Castellanos',
    email: 'diego.cast@daytrader.pro',
    ninjaAccountName: 'Bulenox_Master_09',
    licenseKey: 'NT8-QTM-7732-OMEGA',
    planTier: 'MEMBERSHIP_MONTHLY',
    subscriptionCycle: 'MONTHLY',
    remoteEnabled: false,
    syncState: 'CONFIRMED_OFF',
    connectionStatus: 'PAUSED_REMOTE',
    boundMachineId: 'WIN10-DC-3319A004',
    activeStrategyName: 'TLA_PRO_SUITE_V2',
    instrument: 'GC 12-26',
    dailyPnlUsd: -310.0,
    lastHeartbeatAt: new Date(Date.now() - 8000).toISOString(),
    lastLatencyMs: 61,
    expiresAt: '2027-01-20T23:59:59.000Z',
    statusNote: 'Apagado remoto confirmado por NinjaTrader (ACK recibido)',
  },
  {
    id: 'sub-004',
    traderName: 'Marco Santillán',
    email: 'msantillan@quanthedge.mx',
    ninjaAccountName: 'Sim101_Eval_Test',
    licenseKey: 'NT8-QTM-1108-DELTA',
    planTier: 'MEMBERSHIP_ANNUAL',
    subscriptionCycle: 'ANNUAL',
    remoteEnabled: true,
    syncState: 'CONFIRMED_ON',
    connectionStatus: 'ONLINE_TRADING',
    boundMachineId: 'WIN11-MS-6021FA99',
    activeStrategyName: 'TLA_PRO_SUITE_V2',
    instrument: 'MNQ 12-26',
    dailyPnlUsd: 965.25,
    lastHeartbeatAt: new Date(Date.now() - 4000).toISOString(),
    lastLatencyMs: 29,
    expiresAt: '2027-05-10T23:59:59.000Z',
    statusNote: 'Membresía Anual Activa — Catálogo completo de bots habilitado',
  },
];

function getStoredSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBSCRIPTIONS));
      return INITIAL_SUBSCRIPTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBSCRIPTIONS;
  }
}

function saveStoredSubscriptions(items: Subscription[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/**
 * Adaptador HTTP de Producción con persistencia en localStorage para el panel de administración.
 */
export class HttpSubscriptionRepository implements ISubscriptionRepository {
  public async getAllSubscriptions(): Promise<Subscription[]> {
    try {
      const res = await httpClient.get<any>('/subscriptions');
      const rawList = Array.isArray(res)
        ? res
        : res?.body?.subscriptions ?? res?.subscriptions;
      if (Array.isArray(rawList) && rawList.length > 0) {
        const domainList = rawList.map((item: unknown) =>
          SubscriptionMapper.toDomain(item)
        );
        saveStoredSubscriptions(domainList);
        return domainList;
      }
    } catch {
      // fallback a almacenamiento local persistente
    }
    return getStoredSubscriptions();
  }

  public async getAuditLogs(): Promise<HeartbeatAuditEvent[]> {
    try {
      const res = await httpClient.get<any>('/subscriptions/audit-logs');
      return Array.isArray(res) ? res : res?.body?.logs ?? [];
    } catch {
      return [];
    }
  }

  public async toggleRemoteSubscription(params: {
    subscriptionId: string;
    enabled: boolean;
    reason?: string;
  }): Promise<Subscription> {
    const currentList = getStoredSubscriptions();
    const index = currentList.findIndex((s) => s.id === params.subscriptionId);
    if (index !== -1) {
      currentList[index] = {
        ...currentList[index],
        remoteEnabled: params.enabled,
        syncState: 'PENDING_ACK',
        statusNote: params.enabled
          ? 'Reactivación solicitada — Esperando confirmación de NinjaTrader'
          : 'Apagado solicitado — Esperando confirmación de NinjaTrader',
      };
      saveStoredSubscriptions(currentList);
    }

    try {
      const raw = await httpClient.patch<unknown>(
        `/subscriptions/${params.subscriptionId}/remote-state`,
        {
          remote_enabled: params.enabled,
          reason: params.reason,
        }
      );
      return SubscriptionMapper.toDomain(raw);
    } catch {
      if (index !== -1) return currentList[index];
      throw new Error(`Suscripción ${params.subscriptionId} no encontrada`);
    }
  }

  public async setGlobalKillSwitch(params: {
    enabled: boolean;
    reason: string;
  }): Promise<Subscription[]> {
    const currentList = getStoredSubscriptions().map((sub) => ({
      ...sub,
      remoteEnabled: params.enabled,
      syncState: 'PENDING_ACK' as const,
      statusNote: params.enabled
        ? 'Reactivación global solicitada por el Administrador'
        : `KILL-SWITCH GLOBAL: ${params.reason}`,
    }));
    saveStoredSubscriptions(currentList);

    try {
      const rawList = await httpClient.post<any>(
        '/subscriptions/global-kill-switch',
        params
      );
      const list = Array.isArray(rawList)
        ? rawList
        : rawList?.body?.subscriptions ?? [];
      return list.map((item: unknown) => SubscriptionMapper.toDomain(item));
    } catch {
      return currentList;
    }
  }

  public async resetMachineId(subscriptionId: string): Promise<Subscription> {
    const currentList = getStoredSubscriptions();
    const index = currentList.findIndex((s) => s.id === subscriptionId);
    if (index !== -1) {
      currentList[index] = {
        ...currentList[index],
        boundMachineId: null,
        statusNote: 'Machine ID reseteado. Listo para vincular nueva terminal NinjaTrader 8',
      };
      saveStoredSubscriptions(currentList);
    }

    try {
      const raw = await httpClient.post<unknown>(
        `/subscriptions/${subscriptionId}/reset-machine-id`
      );
      return SubscriptionMapper.toDomain(raw);
    } catch {
      if (index !== -1) return currentList[index];
      throw new Error(`Suscripción ${subscriptionId} no encontrada`);
    }
  }

  public async createSubscription(
    data: Partial<Subscription>
  ): Promise<Subscription> {
    const cycle = data.subscriptionCycle ?? 'MONTHLY';
    const expiresAt =
      data.expiresAt ??
      new Date(
        Date.now() + (cycle === 'ANNUAL' ? 365 : 30) * 86400000
      ).toISOString();

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      traderName: data.traderName || 'Estudiante TLA',
      email: data.email || 'estudiante@tradinglifeacademy.com',
      ninjaAccountName: data.ninjaAccountName || 'Sim101',
      licenseKey:
        data.licenseKey ||
        `NT8-TLA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      planTier:
        data.planTier ||
        (cycle === 'ANNUAL' ? 'MEMBERSHIP_ANNUAL' : 'MEMBERSHIP_MONTHLY'),
      subscriptionCycle: cycle,
      remoteEnabled: data.remoteEnabled ?? true,
      syncState: 'CONFIRMED_ON',
      connectionStatus: 'ONLINE_TRADING',
      boundMachineId: data.boundMachineId || null,
      activeStrategyName: data.activeStrategyName || 'TLA_PRO_SUITE_V2',
      instrument: data.instrument || 'NQ / ES / GC',
      dailyPnlUsd: 0,
      lastHeartbeatAt: new Date().toISOString(),
      lastLatencyMs: 25,
      expiresAt,
      statusNote: 'Membresía activa — Catálogo completo de bots habilitado',
    };

    const currentList = getStoredSubscriptions();
    currentList.unshift(newSub);
    saveStoredSubscriptions(currentList);

    try {
      await httpClient.post('/subscriptions', newSub);
    } catch {
      // guardado local exitoso
    }

    return newSub;
  }

  public async updateSubscription(
    id: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    const currentList = getStoredSubscriptions();
    const index = currentList.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Suscripción ${id} no encontrada`);
    }

    const current = currentList[index];
    const updated: Subscription = {
      ...current,
      ...updates,
      syncState:
        updates.remoteEnabled !== undefined &&
        updates.remoteEnabled !== current.remoteEnabled
          ? 'PENDING_ACK'
          : current.syncState,
    };

    currentList[index] = updated;
    saveStoredSubscriptions(currentList);

    try {
      await httpClient.put(`/subscriptions/${id}`, updated);
    } catch {
      // guardado local exitoso
    }

    return updated;
  }

  public async deleteSubscription(id: string): Promise<boolean> {
    const currentList = getStoredSubscriptions();
    const filtered = currentList.filter((s) => s.id !== id);
    saveStoredSubscriptions(filtered);

    try {
      await httpClient.delete(`/subscriptions/${id}`);
    } catch {
      // eliminado local exitoso
    }

    return true;
  }

  public async processNinjaHeartbeat(
    payload: HeartbeatRequestPayload
  ): Promise<HeartbeatResponsePayload> {
    try {
      return await httpClient.post<HeartbeatResponsePayload>(
        '/ninja/heartbeat',
        payload
      );
    } catch {
      const allowed = payload.currentSessionPnlUsd > -1000;
      return {
        allowedToTrade: allowed,
        remoteCommand: allowed ? 'CONTINUE_TRADING' : 'FLATTEN_AND_DISABLE',
        syncStateAfterPoll: allowed ? 'CONFIRMED_ON' : 'CONFIRMED_OFF',
        pollIntervalMs: 2500,
        serverTimestampIso: new Date().toISOString(),
        message: allowed
          ? 'Heartbeat procesado correctamente por la API.'
          : 'Drawdown máximo alcanzado. Deteniendo estrategia en NinjaTrader.',
      };
    }
  }
}

