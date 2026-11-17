import type { Subscription } from '@features/subscriptions/domain/entities/Subscription';
import {
  SubscriptionApiDtoSchema,
  type SubscriptionApiDto,
} from '@features/subscriptions/infrastructure/dto/SubscriptionDto';

export class SubscriptionMapper {
  public static toDomain(rawDto: unknown): Subscription {
    const dto = SubscriptionApiDtoSchema.parse(rawDto);
    return {
      id: dto.id,
      traderName: dto.trader_name,
      email: dto.email,
      ninjaAccountName: dto.ninja_account_name,
      licenseKey: dto.license_key,
      planTier: dto.plan_tier,
      remoteEnabled: dto.remote_enabled,
      syncState: dto.sync_state,
      connectionStatus: dto.connection_status,
      boundMachineId: dto.bound_machine_id,
      activeStrategyName: dto.active_strategy_name,
      instrument: dto.instrument,
      dailyPnlUsd: dto.daily_pnl_usd,
      lastHeartbeatAt: dto.last_heartbeat_at,
      lastLatencyMs: dto.last_latency_ms,
      expiresAt: dto.expires_at,
      statusNote: dto.status_note,
    };
  }

  public static toDto(entity: Subscription): SubscriptionApiDto {
    return {
      id: entity.id,
      trader_name: entity.traderName,
      email: entity.email,
      ninja_account_name: entity.ninjaAccountName,
      license_key: entity.licenseKey,
      plan_tier: entity.planTier,
      remote_enabled: entity.remoteEnabled,
      sync_state: entity.syncState,
      connection_status: entity.connectionStatus,
      bound_machine_id: entity.boundMachineId,
      active_strategy_name: entity.activeStrategyName,
      instrument: entity.instrument,
      daily_pnl_usd: entity.dailyPnlUsd,
      last_heartbeat_at: entity.lastHeartbeatAt,
      last_latency_ms: entity.lastLatencyMs,
      expires_at: entity.expiresAt,
      status_note: entity.statusNote,
    };
  }
}
