import { env } from '@core/config/env';
import { verifyNinjaHmacSignature } from '@core/crypto/hmacValidator';
import {
  evaluateNinjaHeartbeatDomainRule,
  type HeartbeatAuditEvent,
  type HeartbeatRequestPayload,
  type HeartbeatResponsePayload,
  type Subscription,
} from '@features/subscriptions/domain/entities/Subscription';
import type { ISubscriptionRepository } from '@features/subscriptions/domain/repositories/SubscriptionRepository';

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-001',
    traderName: 'Alejandro Mendoza',
    email: 'amendoza@propdesk-capital.com',
    ninjaAccountName: 'Apex_PA_104928_01',
    licenseKey: 'NT8-QTM-9921-ALPHA',
    planTier: 'INSTITUTIONAL_BOT',
    remoteEnabled: true,
    syncState: 'CONFIRMED_ON',
    connectionStatus: 'ONLINE_TRADING',
    boundMachineId: 'WIN11-TRD-9F82A1C0',
    activeStrategyName: 'QuantumOrderFlowScalperV4',
    instrument: 'NQ 12-26',
    dailyPnlUsd: 2840.5,
    lastHeartbeatAt: new Date(Date.now() - 2000).toISOString(),
    lastLatencyMs: 34,
    expiresAt: '2027-06-30T23:59:59.000Z',
    statusNote: 'Heartbeat OK — Estrategia autorizada en NinjaTrader 8',
  },
  {
    id: 'sub-002',
    traderName: 'Valeria Rojas',
    email: 'v.rojas@futureslatam.io',
    ninjaAccountName: 'Topstep_XFA_55812',
    licenseKey: 'NT8-QTM-4410-SIGMA',
    planTier: 'PROP_FIRM_ELITE',
    remoteEnabled: true,
    syncState: 'CONFIRMED_ON',
    connectionStatus: 'ONLINE_TRADING',
    boundMachineId: 'WIN11-VRX-77B4E211',
    activeStrategyName: 'DeltaMomentumBreakout',
    instrument: 'ES 12-26',
    dailyPnlUsd: 1425.0,
    lastHeartbeatAt: new Date(Date.now() - 3500).toISOString(),
    lastLatencyMs: 48,
    expiresAt: '2027-03-15T23:59:59.000Z',
    statusNote: 'Heartbeat OK — Estrategia autorizada en NinjaTrader 8',
  },
  {
    id: 'sub-003',
    traderName: 'Diego Castellanos',
    email: 'diego.cast@daytrader.pro',
    ninjaAccountName: 'Bulenox_Master_09',
    licenseKey: 'NT8-QTM-7732-OMEGA',
    planTier: 'PRO_SCALPER',
    remoteEnabled: false,
    syncState: 'CONFIRMED_OFF',
    connectionStatus: 'PAUSED_REMOTE',
    boundMachineId: 'WIN10-DC-3319A004',
    activeStrategyName: 'LiquiditySweepBot',
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
    planTier: 'PROP_FIRM_ELITE',
    remoteEnabled: true,
    syncState: 'CONFIRMED_ON',
    connectionStatus: 'ONLINE_TRADING',
    boundMachineId: 'WIN11-MS-6021FA99',
    activeStrategyName: 'VWAPReversionInstitutional',
    instrument: 'MNQ 12-26',
    dailyPnlUsd: 965.25,
    lastHeartbeatAt: new Date(Date.now() - 4000).toISOString(),
    lastLatencyMs: 29,
    expiresAt: '2027-05-10T23:59:59.000Z',
    statusNote: 'Heartbeat OK — Estrategia autorizada en NinjaTrader 8',
  },
  {
    id: 'sub-005',
    traderName: 'Javier Morales',
    email: 'jmorales.quant@gmail.com',
    ninjaAccountName: 'Apex_PA_77410_02',
    licenseKey: 'NT8-TLA-5520-NEXUS',
    planTier: 'MEMBERSHIP_ANNUAL',
    subscriptionCycle: 'ANNUAL',
    remoteEnabled: true,
    syncState: 'CONFIRMED_ON',
    connectionStatus: 'ONLINE_TRADING',
    boundMachineId: 'WIN11-JAV-7712C',
    activeStrategyName: 'QuantumOrderFlowScalperV4',
    instrument: 'NQ 12-26',
    dailyPnlUsd: 1890.0,
    lastHeartbeatAt: new Date(Date.now() - 2800).toISOString(),
    lastLatencyMs: 31,
    expiresAt: '2027-10-15T23:59:59.000Z',
    statusNote: 'Heartbeat OK — Estrategia autorizada en NinjaTrader 8',
  },
  {
    id: 'sub-006',
    traderName: 'Diego Herrera',
    email: 'diego.herrera.prop@gmail.com',
    ninjaAccountName: 'Topstep_Live_90211',
    licenseKey: 'NT8-TLA-8834-TITAN',
    planTier: 'MEMBERSHIP_ANNUAL',
    subscriptionCycle: 'ANNUAL',
    remoteEnabled: true,
    syncState: 'CONFIRMED_ON',
    connectionStatus: 'ONLINE_TRADING',
    boundMachineId: 'WIN11-DIE-4109H',
    activeStrategyName: 'DeltaMomentumBreakout',
    instrument: 'ES 12-26',
    dailyPnlUsd: 1120.75,
    lastHeartbeatAt: new Date(Date.now() - 5100).toISOString(),
    lastLatencyMs: 42,
    expiresAt: '2027-11-02T23:59:59.000Z',
    statusNote: 'Heartbeat OK — Estrategia autorizada en NinjaTrader 8',
  },
  {
    id: 'sub-007',
    traderName: 'Mateo Silva',
    email: 'mateo.silva.fx@gmail.com',
    ninjaAccountName: 'Bulenox_PA_33910',
    licenseKey: 'NT8-TLA-3190-ORION',
    planTier: 'MEMBERSHIP_MONTHLY',
    subscriptionCycle: 'MONTHLY',
    remoteEnabled: true,
    syncState: 'CONFIRMED_ON',
    connectionStatus: 'ONLINE_TRADING',
    boundMachineId: 'WIN11-MAT-3391D',
    activeStrategyName: 'VWAPReversionInstitutional',
    instrument: 'MNQ 12-26',
    dailyPnlUsd: 640.0,
    lastHeartbeatAt: new Date(Date.now() - 6200).toISOString(),
    lastLatencyMs: 39,
    expiresAt: '2026-12-26T23:59:59.000Z',
    statusNote: 'Heartbeat OK — Estrategia autorizada en NinjaTrader 8',
  },
  {
    id: 'sub-008',
    traderName: 'Sofía Alarcón',
    email: 'sofia.alarcon.trd@yahoo.com',
    ninjaAccountName: 'Apex_Eval_88120',
    licenseKey: 'NT8-TLA-6401-VEGA',
    planTier: 'MEMBERSHIP_MONTHLY',
    subscriptionCycle: 'MONTHLY',
    remoteEnabled: false,
    syncState: 'CONFIRMED_OFF',
    connectionStatus: 'PAUSED_REMOTE',
    boundMachineId: 'WIN11-SOF-5120E',
    activeStrategyName: 'LiquiditySweepBot',
    instrument: 'GC 12-26',
    dailyPnlUsd: 0,
    lastHeartbeatAt: new Date(Date.now() - 12000).toISOString(),
    lastLatencyMs: 53,
    expiresAt: '2026-12-26T23:59:59.000Z',
    statusNote: 'Licencia en espera de aprobación KYC final',
  },
];

const INITIAL_AUDIT_LOGS: HeartbeatAuditEvent[] = [
  {
    id: 'evt-1001',
    timestampIso: new Date(Date.now() - 25000).toISOString(),
    licenseKey: 'NT8-QTM-9921-ALPHA',
    traderName: 'Alejandro Mendoza',
    eventType: 'NINJA_HEARTBEAT_ACK',
    allowedToTrade: true,
    remoteCommand: 'CONTINUE_TRADING',
    machineId: 'WIN11-TRD-9F82A1C0',
    details:
      'Polling HTTP OK (34ms) — Estrategia QuantumOrderFlowScalperV4 operando NQ 12-26.',
  },
  {
    id: 'evt-1002',
    timestampIso: new Date(Date.now() - 18000).toISOString(),
    licenseKey: 'NT8-QTM-7732-OMEGA',
    traderName: 'Diego Castellanos',
    eventType: 'ADMIN_TOGGLE_OFF',
    allowedToTrade: false,
    remoteCommand: 'FLATTEN_AND_DISABLE',
    machineId: 'WIN10-DC-3319A004',
    details:
      'Admin ejecutó Apagado Remoto (Kill-Switch). NinjaTrader confirmó detención en el siguiente ciclo de Polling.',
  },
];

export class MockSimulatorSubscriptionRepository
  implements ISubscriptionRepository
{
  private subscriptions: Subscription[] = structuredClone(INITIAL_SUBSCRIPTIONS);
  private auditLogs: HeartbeatAuditEvent[] = structuredClone(INITIAL_AUDIT_LOGS);

  private pushAudit(event: Omit<HeartbeatAuditEvent, 'id'>): void {
    const newEvent: HeartbeatAuditEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    this.auditLogs = [newEvent, ...this.auditLogs].slice(0, 60);
  }

  public async getAllSubscriptions(): Promise<Subscription[]> {
    return structuredClone(this.subscriptions);
  }

  public async getAuditLogs(): Promise<HeartbeatAuditEvent[]> {
    return structuredClone(this.auditLogs);
  }

  public async toggleRemoteSubscription(params: {
    subscriptionId: string;
    enabled: boolean;
    reason?: string;
  }): Promise<Subscription> {
    const index = this.subscriptions.findIndex(
      (s) => s.id === params.subscriptionId
    );
    if (index === -1) {
      throw new Error(`Suscripción ${params.subscriptionId} no encontrada.`);
    }

    const current = this.subscriptions[index];
    const updated: Subscription = {
      ...current,
      remoteEnabled: params.enabled,
      // Queda en PENDING_ACK hasta que el próximo ciclo de Polling HTTP de NinjaTrader consulte el estado
      syncState: 'PENDING_ACK',
      statusNote: params.enabled
        ? 'Orden de ENCENDIDO enviada — Esperando próximo poll de NinjaTrader...'
        : `Orden de APAGADO enviada (${params.reason || 'Control Admin'}) — Esperando ACK de NinjaTrader...`,
    };

    this.subscriptions[index] = updated;

    this.pushAudit({
      timestampIso: new Date().toISOString(),
      licenseKey: updated.licenseKey,
      traderName: updated.traderName,
      eventType: params.enabled ? 'ADMIN_TOGGLE_ON' : 'ADMIN_TOGGLE_OFF',
      allowedToTrade: params.enabled,
      remoteCommand: params.enabled
        ? 'CONTINUE_TRADING'
        : 'FLATTEN_AND_DISABLE',
      machineId: updated.boundMachineId ?? 'UNBOUND',
      details: params.enabled
        ? `Admin activó suscripción remotamente. Estado en cola para el siguiente ciclo de Polling HTTP.`
        : `Admin activó Kill-Switch Remoto (${params.reason || 'Suspensión manual'}). Pendiente de ACK en próximo Heartbeat.`,
    });

    return structuredClone(updated);
  }

  public async setGlobalKillSwitch(params: {
    enabled: boolean;
    reason: string;
  }): Promise<Subscription[]> {
    const nowIso = new Date().toISOString();
    this.subscriptions = this.subscriptions.map((sub) => ({
      ...sub,
      remoteEnabled: params.enabled,
      syncState: 'PENDING_ACK',
      statusNote: params.enabled
        ? 'Reactivación global programada — Esperando poll de NinjaTrader'
        : `KILL-SWITCH GLOBAL (${params.reason}) — Esperando ACK de NinjaTrader`,
    }));

    this.pushAudit({
      timestampIso: nowIso,
      licenseKey: 'ALL-LICENSES-GLOBAL',
      traderName: 'TODOS LOS TRADERS',
      eventType: 'ADMIN_GLOBAL_KILLSWITCH',
      allowedToTrade: params.enabled,
      remoteCommand: params.enabled
        ? 'CONTINUE_TRADING'
        : 'FLATTEN_AND_DISABLE',
      machineId: 'GLOBAL_BROADCAST',
      details: params.enabled
        ? `Admin habilitó todas las instancias de NinjaTrader (${params.reason}).`
        : `EMERGENCIA: Admin ejecutó Apagado Global de todas las instancias (${params.reason}).`,
    });

    return structuredClone(this.subscriptions);
  }

  public async resetMachineId(subscriptionId: string): Promise<Subscription> {
    const index = this.subscriptions.findIndex((s) => s.id === subscriptionId);
    if (index === -1) {
      throw new Error(`Suscripción ${subscriptionId} no encontrada.`);
    }

    const prevMachineId = this.subscriptions[index].boundMachineId;
    const updated: Subscription = {
      ...this.subscriptions[index],
      boundMachineId: null,
      statusNote: `MachineID liberado (anterior: ${prevMachineId ?? 'ninguno'}). Se vinculará en el próximo Heartbeat.`,
    };
    this.subscriptions[index] = updated;

    this.pushAudit({
      timestampIso: new Date().toISOString(),
      licenseKey: updated.licenseKey,
      traderName: updated.traderName,
      eventType: 'ADMIN_TOGGLE_ON',
      allowedToTrade: updated.remoteEnabled,
      remoteCommand: 'CONTINUE_TRADING',
      machineId: 'RESET_READY',
      details: `Admin liberó el vínculo de Hardware (MachineID anterior: ${prevMachineId ?? 'N/A'}).`,
    });

    return structuredClone(updated);
  }

  public async processNinjaHeartbeat(
    payload: HeartbeatRequestPayload
  ): Promise<HeartbeatResponsePayload> {
    const index = this.subscriptions.findIndex(
      (s) => s.licenseKey === payload.licenseKey
    );

    if (index === -1) {
      return {
        allowedToTrade: false,
        remoteCommand: 'FLATTEN_AND_DISABLE',
        syncStateAfterPoll: 'CONFIRMED_OFF',
        pollIntervalMs: env.ninjaHeartbeatIntervalMs,
        serverTimestampIso: new Date().toISOString(),
        message: `Licencia ${payload.licenseKey} no existe en el servidor.`,
      };
    }

    const subscription = this.subscriptions[index];
    const isValidHmac = verifyNinjaHmacSignature(
      {
        licenseKey: payload.licenseKey,
        machineId: payload.machineId,
        timestampIso: payload.timestampIso,
        strategyName: payload.strategyName,
        accountName: payload.accountName,
      },
      payload.hmacSignature
    );

    const evaluation = evaluateNinjaHeartbeatDomainRule({
      subscription,
      payload,
      isValidHmac,
      pollIntervalMs: env.ninjaHeartbeatIntervalMs,
    });

    this.subscriptions[index] = evaluation.updatedSubscription;
    this.pushAudit(evaluation.auditEvent);

    return structuredClone(evaluation.response);
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
      traderName: data.traderName ?? 'Estudiante TLA',
      email: data.email ?? 'trader@tradinglifeacademy.com',
      ninjaAccountName: data.ninjaAccountName ?? 'Sim101',
      licenseKey:
        data.licenseKey ??
        `NT8-TLA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      planTier:
        data.planTier ??
        (cycle === 'ANNUAL' ? 'MEMBERSHIP_ANNUAL' : 'MEMBERSHIP_MONTHLY'),
      subscriptionCycle: cycle,
      remoteEnabled: data.remoteEnabled ?? true,
      syncState: 'CONFIRMED_ON',
      connectionStatus: 'ONLINE_TRADING',
      boundMachineId: data.boundMachineId ?? null,
      activeStrategyName: data.activeStrategyName ?? 'TLA_PRO_SUITE_V2',
      instrument: data.instrument ?? 'NQ / ES / GC',
      dailyPnlUsd: 0,
      lastHeartbeatAt: new Date().toISOString(),
      lastLatencyMs: 28,
      expiresAt,
      statusNote: 'Membresía activa — Catálogo completo de bots habilitado',
    };

    this.subscriptions.unshift(newSub);
    this.pushAudit({
      timestampIso: new Date().toISOString(),
      licenseKey: newSub.licenseKey,
      traderName: newSub.traderName,
      eventType: 'ADMIN_TOGGLE_ON',
      allowedToTrade: true,
      remoteCommand: 'CONTINUE_TRADING',
      machineId: newSub.boundMachineId ?? 'PENDING',
      details: `Nueva suscripción (${cycle}) creada por el Administrador.`,
    });

    return structuredClone(newSub);
  }

  public async updateSubscription(
    id: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    const index = this.subscriptions.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Suscripción ${id} no encontrada.`);
    }

    const current = this.subscriptions[index];
    const updated: Subscription = {
      ...current,
      ...updates,
      syncState:
        updates.remoteEnabled !== undefined &&
        updates.remoteEnabled !== current.remoteEnabled
          ? 'PENDING_ACK'
          : current.syncState,
    };

    this.subscriptions[index] = updated;
    this.pushAudit({
      timestampIso: new Date().toISOString(),
      licenseKey: updated.licenseKey,
      traderName: updated.traderName,
      eventType: updated.remoteEnabled ? 'ADMIN_TOGGLE_ON' : 'ADMIN_TOGGLE_OFF',
      allowedToTrade: updated.remoteEnabled,
      remoteCommand: updated.remoteEnabled
        ? 'CONTINUE_TRADING'
        : 'FLATTEN_AND_DISABLE',
      machineId: updated.boundMachineId ?? 'UNBOUND',
      details: `Suscripción actualizada por el Administrador (Plan: ${updated.subscriptionCycle ?? 'MONTHLY'}).`,
    });

    return structuredClone(updated);
  }

  public async deleteSubscription(id: string): Promise<boolean> {
    const index = this.subscriptions.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.subscriptions.splice(index, 1);
      return true;
    }
    return false;
  }
}
