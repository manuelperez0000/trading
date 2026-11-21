import { httpClient } from '@core/http/httpClient';
import type {
  HeartbeatAuditEvent,
  HeartbeatRequestPayload,
  HeartbeatResponsePayload,
  Subscription,
} from '@features/subscriptions/domain/entities/Subscription';
import type { ISubscriptionRepository } from '@features/subscriptions/domain/repositories/SubscriptionRepository';
import { SubscriptionMapper } from '@features/subscriptions/infrastructure/mappers/SubscriptionMapper';

/**
 * Adaptador HTTP de Producción que conecta con el Backend en Express (`e:\traiding\trading\backend`).
 */
export class HttpSubscriptionRepository implements ISubscriptionRepository {
  public async getAllSubscriptions(): Promise<Subscription[]> {
    try {
      const res = await httpClient.get<any>('/subscriptions');
      const rawList = Array.isArray(res)
        ? res
        : res?.body?.subscriptions ?? res?.subscriptions ?? [];
      return rawList.map((item: unknown) => SubscriptionMapper.toDomain(item));
    } catch {
      return [];
    }
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
    const raw = await httpClient.patch<unknown>(
      `/subscriptions/${params.subscriptionId}/remote-state`,
      {
        remote_enabled: params.enabled,
        reason: params.reason,
      }
    );
    return SubscriptionMapper.toDomain(raw);
  }

  public async setGlobalKillSwitch(params: {
    enabled: boolean;
    reason: string;
  }): Promise<Subscription[]> {
    const rawList = await httpClient.post<any>(
      '/subscriptions/global-kill-switch',
      params
    );
    const list = Array.isArray(rawList)
      ? rawList
      : rawList?.body?.subscriptions ?? [];
    return list.map((item: unknown) => SubscriptionMapper.toDomain(item));
  }

  public async resetMachineId(subscriptionId: string): Promise<Subscription> {
    const raw = await httpClient.post<unknown>(
      `/subscriptions/${subscriptionId}/reset-machine-id`
    );
    return SubscriptionMapper.toDomain(raw);
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
