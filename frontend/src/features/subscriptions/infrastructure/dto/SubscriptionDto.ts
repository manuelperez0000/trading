import { z } from 'zod';

export const SubscriptionApiDtoSchema = z.object({
  id: z.string(),
  trader_name: z.string(),
  email: z.string().email(),
  ninja_account_name: z.string(),
  license_key: z.string(),
  plan_tier: z.enum([
    'MEMBERSHIP_MONTHLY',
    'MEMBERSHIP_ANNUAL',
    'PRO_SCALPER',
    'PROP_FIRM_ELITE',
    'INSTITUTIONAL_BOT',
  ]),
  remote_enabled: z.boolean(),
  sync_state: z.enum(['CONFIRMED_ON', 'PENDING_ACK', 'CONFIRMED_OFF']),
  connection_status: z.enum([
    'ONLINE_TRADING',
    'PAUSED_REMOTE',
    'OFFLINE',
    'SECURITY_BLOCKED',
  ]),
  bound_machine_id: z.string().nullable(),
  active_strategy_name: z.string(),
  instrument: z.string(),
  daily_pnl_usd: z.number(),
  last_heartbeat_at: z.string().nullable(),
  last_latency_ms: z.number(),
  expires_at: z.string(),
  status_note: z.string(),
});

export type SubscriptionApiDto = z.infer<typeof SubscriptionApiDtoSchema>;
