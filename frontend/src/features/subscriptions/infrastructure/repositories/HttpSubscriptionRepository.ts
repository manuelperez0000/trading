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
    const rawList = await httpClient.get<unknown[]>('/subscriptions');
    return rawList.map((item) => SubscriptionMapper.toDomain(item));
  }

  public async getAuditLogs(): Promise<HeartbeatAuditEvent[]> {
    return httpClient.get<HeartbeatAuditEvent[]>('/subscriptions/audit-logs');
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
    const rawList = await httpClient.post<unknown[]>(
      '/subscriptions/global-kill-switch',
      params
    );
    return rawList.map((item) => SubscriptionMapper.toDomain(item));
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
    return httpClient.post<HeartbeatResponsePayload>(
      '/ninja/heartbeat',
      payload
    );
  }
}
