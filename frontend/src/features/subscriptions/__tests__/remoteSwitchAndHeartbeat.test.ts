import { describe, expect, it } from 'vitest';
import { MockSimulatorSubscriptionRepository } from '@features/subscriptions/infrastructure/repositories/MockSimulatorSubscriptionRepository';
import {
  GlobalKillSwitchUseCase,
  ResetMachineIdUseCase,
  SimulateNinjaHeartbeatUseCase,
  ToggleRemoteSubscriptionUseCase,
} from '@features/subscriptions/application/use-cases/subscriptionUseCases';

describe('Clean Architecture — Apagado/Encendido Remoto NinjaTrader & Seguridad API', () => {
  it('apaga remotamente una suscripción activa y confirma FLATTEN_AND_DISABLE en el siguiente ciclo de Polling HTTP', async () => {
    const repo = new MockSimulatorSubscriptionRepository();
    const toggleUseCase = new ToggleRemoteSubscriptionUseCase(repo);
    const heartbeatUseCase = new SimulateNinjaHeartbeatUseCase(repo);

    // 1. Admin apaga remotamente la suscripción sub-001 (Alejandro Mendoza)
    const afterAdminToggle = await toggleUseCase.execute({
      subscriptionId: 'sub-001',
      enabled: false,
      reason: 'Prueba unitaria de Kill-Switch remoto',
    });

    expect(afterAdminToggle.remoteEnabled).toBe(false);
    expect(afterAdminToggle.syncState).toBe('PENDING_ACK');

    // 2. NinjaTrader 8 ejecuta su ciclo periódico de Polling HTTP
    const { serverResponse } = await heartbeatUseCase.execute({
      licenseKey: 'NT8-QTM-9921-ALPHA',
      machineId: 'WIN11-TRD-9F82A1C0',
      strategyName: 'QuantumOrderFlowScalperV4',
      accountName: 'Apex_PA_104928_01',
      instrument: 'NQ 12-26',
      currentSessionPnlUsd: 2950.0,
    });

    expect(serverResponse.allowedToTrade).toBe(false);
    expect(serverResponse.remoteCommand).toBe('FLATTEN_AND_DISABLE');
    expect(serverResponse.syncStateAfterPoll).toBe('CONFIRMED_OFF');
    expect(serverResponse.subscriptionSnapshot?.connectionStatus).toBe(
      'PAUSED_REMOTE'
    );
  });

  it('enciende remotamente una suscripción pausada y confirma CONTINUE_TRADING en el siguiente ciclo de Polling HTTP', async () => {
    const repo = new MockSimulatorSubscriptionRepository();
    const toggleUseCase = new ToggleRemoteSubscriptionUseCase(repo);
    const heartbeatUseCase = new SimulateNinjaHeartbeatUseCase(repo);

    // sub-003 inicia apagada (remoteEnabled: false, CONFIRMED_OFF)
    const afterEnable = await toggleUseCase.execute({
      subscriptionId: 'sub-003',
      enabled: true,
      reason: 'Renovación de membresía verificada',
    });

    expect(afterEnable.remoteEnabled).toBe(true);
    expect(afterEnable.syncState).toBe('PENDING_ACK');

    // NinjaTrader 8 consulta el estado
    const { serverResponse } = await heartbeatUseCase.execute({
      licenseKey: 'NT8-QTM-7732-OMEGA',
      machineId: 'WIN10-DC-3319A004',
      strategyName: 'LiquiditySweepBot',
      accountName: 'Bulenox_Master_09',
      instrument: 'GC 12-26',
      currentSessionPnlUsd: 410.0,
    });

    expect(serverResponse.allowedToTrade).toBe(true);
    expect(serverResponse.remoteCommand).toBe('CONTINUE_TRADING');
    expect(serverResponse.syncStateAfterPoll).toBe('CONFIRMED_ON');
    expect(serverResponse.subscriptionSnapshot?.connectionStatus).toBe(
      'ONLINE_TRADING'
    );
  });

  it('bloquea intentos de conexión desde un MachineID no autorizado y permite re-vincular tras Reset HWID', async () => {
    const repo = new MockSimulatorSubscriptionRepository();
    const resetHwidUseCase = new ResetMachineIdUseCase(repo);
    const heartbeatUseCase = new SimulateNinjaHeartbeatUseCase(repo);

    // 1. Intento de usar la licencia en otra PC no autorizada
    const blockedAttempt = await heartbeatUseCase.execute({
      licenseKey: 'NT8-QTM-9921-ALPHA',
      machineId: 'WIN11-CLONED-UNAUTHORIZED-PC',
      strategyName: 'QuantumOrderFlowScalperV4',
      accountName: 'Apex_PA_104928_01',
      instrument: 'NQ 12-26',
      currentSessionPnlUsd: 0,
    });

    expect(blockedAttempt.serverResponse.allowedToTrade).toBe(false);
    expect(blockedAttempt.serverResponse.remoteCommand).toBe(
      'REVOKE_INVALID_HWID'
    );

    // 2. Admin libera el MachineID para soporte técnico
    const afterReset = await resetHwidUseCase.execute('sub-001');
    expect(afterReset.boundMachineId).toBeNull();

    // 3. El cliente conecta con su nueva PC y queda vinculada automáticamente
    const reboundAttempt = await heartbeatUseCase.execute({
      licenseKey: 'NT8-QTM-9921-ALPHA',
      machineId: 'WIN11-NEW-AUTHORIZED-WORKSTATION',
      strategyName: 'QuantumOrderFlowScalperV4',
      accountName: 'Apex_PA_104928_01',
      instrument: 'NQ 12-26',
      currentSessionPnlUsd: 500,
    });

    expect(reboundAttempt.serverResponse.allowedToTrade).toBe(true);
    expect(reboundAttempt.serverResponse.subscriptionSnapshot?.boundMachineId).toBe(
      'WIN11-NEW-AUTHORIZED-WORKSTATION'
    );
  });

  it('rechaza paquetes con firma criptográfica HMAC-SHA256 adulterada', async () => {
    const repo = new MockSimulatorSubscriptionRepository();
    const heartbeatUseCase = new SimulateNinjaHeartbeatUseCase(repo);

    const tamperedResult = await heartbeatUseCase.execute({
      licenseKey: 'NT8-QTM-9921-ALPHA',
      machineId: 'WIN11-TRD-9F82A1C0',
      strategyName: 'QuantumOrderFlowScalperV4',
      accountName: 'Apex_PA_104928_01',
      instrument: 'NQ 12-26',
      currentSessionPnlUsd: 1000,
      tamperHmacSignature: true,
    });

    expect(tamperedResult.serverResponse.allowedToTrade).toBe(false);
    expect(tamperedResult.serverResponse.remoteCommand).toBe('REJECT_SIGNATURE');
  });

  it('ejecuta el Kill-Switch Global apagando todas las suscripciones simultáneamente', async () => {
    const repo = new MockSimulatorSubscriptionRepository();
    const globalKillSwitch = new GlobalKillSwitchUseCase(repo);

    const updatedList = await globalKillSwitch.execute({
      enabled: false,
      reason: 'Volatilidad extrema FOMC',
    });

    expect(updatedList.every((s) => s.remoteEnabled === false)).toBe(true);
    expect(updatedList.every((s) => s.syncState === 'PENDING_ACK')).toBe(true);
  });

  it('desactiva automáticamente todos los bots del usuario cuando la suscripción ha vencido', async () => {
    const repo = new MockSimulatorSubscriptionRepository();
    const heartbeatUseCase = new SimulateNinjaHeartbeatUseCase(repo);

    // sub-008 (Sofía Alarcón) tiene fecha de vencimiento pasada (2025-10-15) pero remoteEnabled: true
    const expiredResult = await heartbeatUseCase.execute({
      licenseKey: 'NT8-TLA-6401-VEGA',
      machineId: 'WIN11-SOF-5120E',
      strategyName: 'LiquiditySweepBot',
      accountName: 'Apex_Eval_88120',
      instrument: 'GC 12-26',
      currentSessionPnlUsd: 0,
    });

    expect(expiredResult.serverResponse.allowedToTrade).toBe(false);
    expect(expiredResult.serverResponse.remoteCommand).toBe('FLATTEN_AND_DISABLE');
    expect(expiredResult.serverResponse.subscriptionSnapshot?.remoteEnabled).toBe(false);
    expect(expiredResult.serverResponse.subscriptionSnapshot?.syncState).toBe('CONFIRMED_OFF');
  });
});
