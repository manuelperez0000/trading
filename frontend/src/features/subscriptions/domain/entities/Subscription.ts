export type PlanTier = 'PRO_SCALPER' | 'PROP_FIRM_ELITE' | 'INSTITUTIONAL_BOT';

export type RemoteSyncState = 'CONFIRMED_ON' | 'PENDING_ACK' | 'CONFIRMED_OFF';

export type NinjaConnectionStatus =
  | 'ONLINE_TRADING'
  | 'PAUSED_REMOTE'
  | 'OFFLINE'
  | 'SECURITY_BLOCKED';

export type RemoteNinjaCommand =
  | 'CONTINUE_TRADING'
  | 'FLATTEN_AND_DISABLE'
  | 'REVOKE_INVALID_HWID'
  | 'REJECT_SIGNATURE';

export interface Subscription {
  id: string;
  traderName: string;
  email: string;
  ninjaAccountName: string;
  licenseKey: string;
  planTier: PlanTier;
  /** Estado deseado por el Administrador en el Panel Web */
  remoteEnabled: boolean;
  /** Estado de sincronización con el ciclo de Polling HTTP de NinjaTrader */
  syncState: RemoteSyncState;
  /** Estado reportado por el último Heartbeat de NinjaTrader */
  connectionStatus: NinjaConnectionStatus;
  /** Huella de hardware de la PC autorizada en NinjaTrader (System.Environment.MachineName + CPU ID) */
  boundMachineId: string | null;
  activeStrategyName: string;
  instrument: string;
  dailyPnlUsd: number;
  lastHeartbeatAt: string | null;
  lastLatencyMs: number;
  expiresAt: string;
  statusNote: string;
}

export interface HeartbeatRequestPayload {
  licenseKey: string;
  machineId: string;
  strategyName: string;
  accountName: string;
  instrument: string;
  currentSessionPnlUsd: number;
  timestampIso: string;
  hmacSignature: string;
  simulatedLatencyMs?: number;
}

export interface HeartbeatResponsePayload {
  allowedToTrade: boolean;
  remoteCommand: RemoteNinjaCommand;
  syncStateAfterPoll: RemoteSyncState;
  pollIntervalMs: number;
  serverTimestampIso: string;
  message: string;
  subscriptionSnapshot?: Subscription;
}

export interface HeartbeatAuditEvent {
  id: string;
  timestampIso: string;
  licenseKey: string;
  traderName: string;
  eventType:
    | 'ADMIN_TOGGLE_ON'
    | 'ADMIN_TOGGLE_OFF'
    | 'ADMIN_GLOBAL_KILLSWITCH'
    | 'NINJA_HEARTBEAT_ACK'
    | 'SECURITY_ALERT_HWID'
    | 'SECURITY_ALERT_HMAC';
  allowedToTrade: boolean;
  remoteCommand: RemoteNinjaCommand;
  machineId: string;
  details: string;
}

/**
 * Regla pura de Dominio: Evalúa un paquete de Polling HTTP entrante desde NinjaTrader 8
 * y determina si la instancia tiene permiso para seguir operando o debe apagarse inmediatamente.
 */
export function evaluateNinjaHeartbeatDomainRule(params: {
  subscription: Subscription;
  payload: HeartbeatRequestPayload;
  isValidHmac: boolean;
  pollIntervalMs: number;
}): {
  updatedSubscription: Subscription;
  response: HeartbeatResponsePayload;
  auditEvent: Omit<HeartbeatAuditEvent, 'id'>;
} {
  const { subscription, payload, isValidHmac, pollIntervalMs } = params;
  const nowIso = new Date().toISOString();

  // 1. Verificación criptográfica HMAC-SHA256
  if (!isValidHmac) {
    const updated: Subscription = {
      ...subscription,
      connectionStatus: 'SECURITY_BLOCKED',
      statusNote: 'Alerta: Firma HMAC-SHA256 inválida rechazada',
    };
    return {
      updatedSubscription: updated,
      response: {
        allowedToTrade: false,
        remoteCommand: 'REJECT_SIGNATURE',
        syncStateAfterPoll: subscription.syncState,
        pollIntervalMs,
        serverTimestampIso: nowIso,
        message: 'Firma criptográfica HMAC-SHA256 inválida. Operativa bloqueada.',
        subscriptionSnapshot: updated,
      },
      auditEvent: {
        timestampIso: nowIso,
        licenseKey: subscription.licenseKey,
        traderName: subscription.traderName,
        eventType: 'SECURITY_ALERT_HMAC',
        allowedToTrade: false,
        remoteCommand: 'REJECT_SIGNATURE',
        machineId: payload.machineId,
        details: 'Intento de conexión con firma HMAC manipulada o clave incorrecta.',
      },
    };
  }

  // 2. Verificación de MachineID (Bloqueo por Hardware para evitar compartir licencias)
  const effectiveMachineId = subscription.boundMachineId ?? payload.machineId;
  if (
    subscription.boundMachineId !== null &&
    subscription.boundMachineId !== payload.machineId
  ) {
    const updated: Subscription = {
      ...subscription,
      connectionStatus: 'SECURITY_BLOCKED',
      statusNote: `Bloqueo HWID: intentó conectar desde ${payload.machineId}`,
    };
    return {
      updatedSubscription: updated,
      response: {
        allowedToTrade: false,
        remoteCommand: 'REVOKE_INVALID_HWID',
        syncStateAfterPoll: subscription.syncState,
        pollIntervalMs,
        serverTimestampIso: nowIso,
        message: `MachineID no autorizado (${payload.machineId}). Licencia vinculada a ${subscription.boundMachineId}.`,
        subscriptionSnapshot: updated,
      },
      auditEvent: {
        timestampIso: nowIso,
        licenseKey: subscription.licenseKey,
        traderName: subscription.traderName,
        eventType: 'SECURITY_ALERT_HWID',
        allowedToTrade: false,
        remoteCommand: 'REVOKE_INVALID_HWID',
        machineId: payload.machineId,
        details: `Colisión de Hardware ID: esperado ${subscription.boundMachineId}, recibido ${payload.machineId}.`,
      },
    };
  }

  // 3. Verificación de vencimiento de suscripción
  const isExpired = new Date(subscription.expiresAt).getTime() < Date.now();
  const allowedToTrade = subscription.remoteEnabled && !isExpired;
  const remoteCommand: RemoteNinjaCommand = allowedToTrade
    ? 'CONTINUE_TRADING'
    : 'FLATTEN_AND_DISABLE';
  const nextSyncState: RemoteSyncState = allowedToTrade
    ? 'CONFIRMED_ON'
    : 'CONFIRMED_OFF';

  const updatedSubscription: Subscription = {
    ...subscription,
    boundMachineId: effectiveMachineId,
    activeStrategyName: payload.strategyName || subscription.activeStrategyName,
    instrument: payload.instrument || subscription.instrument,
    dailyPnlUsd: payload.currentSessionPnlUsd,
    lastHeartbeatAt: nowIso,
    lastLatencyMs: payload.simulatedLatencyMs ?? 42,
    syncState: nextSyncState,
    connectionStatus: allowedToTrade ? 'ONLINE_TRADING' : 'PAUSED_REMOTE',
    statusNote: allowedToTrade
      ? 'Heartbeat OK — Estrategia autorizada en NinjaTrader 8'
      : isExpired
      ? 'Suscripción expirada — Operativa deshabilitada remotamente'
      : 'Apagado remoto confirmado por NinjaTrader (ACK recibido)',
  };

  return {
    updatedSubscription,
    response: {
      allowedToTrade,
      remoteCommand,
      syncStateAfterPoll: nextSyncState,
      pollIntervalMs,
      serverTimestampIso: nowIso,
      message: allowedToTrade
        ? 'ACK: Suscripción activa. Permiso de trading renovado hasta el próximo ciclo.'
        : 'KILL-SWITCH ACTIVO: NinjaTrader debe cerrar/pausar la estrategia inmediatamente.',
      subscriptionSnapshot: updatedSubscription,
    },
    auditEvent: {
      timestampIso: nowIso,
      licenseKey: subscription.licenseKey,
      traderName: subscription.traderName,
      eventType: 'NINJA_HEARTBEAT_ACK',
      allowedToTrade,
      remoteCommand,
      machineId: payload.machineId,
      details: allowedToTrade
        ? `Polling HTTP OK (${updatedSubscription.lastLatencyMs}ms) — Estrategia ${updatedSubscription.activeStrategyName} operando ${updatedSubscription.instrument}.`
        : `ACK de Apagado Remoto ejecutado en NinjaTrader (${updatedSubscription.activeStrategyName} detenida).`,
    },
  };
}
