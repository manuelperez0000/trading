import { computeNinjaHmacSignature } from '@core/crypto/hmacValidator';
import type {
  HeartbeatRequestPayload,
  HeartbeatResponsePayload,
  Subscription,
} from '@features/subscriptions/domain/entities/Subscription';
import type { ISubscriptionRepository } from '@features/subscriptions/domain/repositories/SubscriptionRepository';

export class ToggleRemoteSubscriptionUseCase {
  private readonly repository: ISubscriptionRepository;

  constructor(repository: ISubscriptionRepository) {
    this.repository = repository;
  }

  public async execute(params: {
    subscriptionId: string;
    enabled: boolean;
    reason?: string;
  }): Promise<Subscription> {
    if (!params.subscriptionId.trim()) {
      throw new Error('El ID de la suscripción es obligatorio.');
    }
    return this.repository.toggleRemoteSubscription(params);
  }
}

export class GlobalKillSwitchUseCase {
  private readonly repository: ISubscriptionRepository;

  constructor(repository: ISubscriptionRepository) {
    this.repository = repository;
  }

  public async execute(params: {
    enabled: boolean;
    reason: string;
  }): Promise<Subscription[]> {
    return this.repository.setGlobalKillSwitch(params);
  }
}

export class ResetMachineIdUseCase {
  private readonly repository: ISubscriptionRepository;

  constructor(repository: ISubscriptionRepository) {
    this.repository = repository;
  }

  public async execute(subscriptionId: string): Promise<Subscription> {
    return this.repository.resetMachineId(subscriptionId);
  }
}

export interface SimulateHeartbeatInput {
  licenseKey: string;
  machineId: string;
  strategyName: string;
  accountName: string;
  instrument: string;
  currentSessionPnlUsd: number;
  tamperHmacSignature?: boolean;
  simulatedLatencyMs?: number;
}

export class SimulateNinjaHeartbeatUseCase {
  private readonly repository: ISubscriptionRepository;

  constructor(repository: ISubscriptionRepository) {
    this.repository = repository;
  }

  public async execute(
    input: SimulateHeartbeatInput
  ): Promise<{
    requestSent: HeartbeatRequestPayload;
    serverResponse: HeartbeatResponsePayload;
  }> {
    const timestampIso = new Date().toISOString();
    const validSignature = computeNinjaHmacSignature({
      licenseKey: input.licenseKey,
      machineId: input.machineId,
      timestampIso,
      strategyName: input.strategyName,
      accountName: input.accountName,
    });

    const requestSent: HeartbeatRequestPayload = {
      licenseKey: input.licenseKey,
      machineId: input.machineId,
      strategyName: input.strategyName,
      accountName: input.accountName,
      instrument: input.instrument,
      currentSessionPnlUsd: input.currentSessionPnlUsd,
      timestampIso,
      hmacSignature: input.tamperHmacSignature
        ? 'sha256=00000000deadbeef00000000tampered'
        : validSignature,
      simulatedLatencyMs: input.simulatedLatencyMs ?? 38,
    };

    const serverResponse =
      await this.repository.processNinjaHeartbeat(requestSent);

    return { requestSent, serverResponse };
  }
}
