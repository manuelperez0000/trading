import type {
  HeartbeatAuditEvent,
  HeartbeatRequestPayload,
  HeartbeatResponsePayload,
  Subscription,
} from '@features/subscriptions/domain/entities/Subscription';

/**
 * Contrato de Repositorio (Puerto de Salida en Clean Architecture).
 * La capa de Aplicación y Presentación dependen únicamente de esta interfaz,
 * nunca de si los datos vienen del Simulador en memoria o del servidor Express.
 */
export interface ISubscriptionRepository {
  getAllSubscriptions(): Promise<Subscription[]>;
  getAuditLogs(): Promise<HeartbeatAuditEvent[]>;
  toggleRemoteSubscription(params: {
    subscriptionId: string;
    enabled: boolean;
    reason?: string;
  }): Promise<Subscription>;
  setGlobalKillSwitch(params: {
    enabled: boolean;
    reason: string;
  }): Promise<Subscription[]>;
  resetMachineId(subscriptionId: string): Promise<Subscription>;
  createSubscription(
    subscription: Partial<Subscription>
  ): Promise<Subscription>;
  updateSubscription(
    id: string,
    updates: Partial<Subscription>
  ): Promise<Subscription>;
  deleteSubscription(id: string): Promise<boolean>;
  processNinjaHeartbeat(
    payload: HeartbeatRequestPayload
  ): Promise<HeartbeatResponsePayload>;
}
