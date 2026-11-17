import { z } from 'zod';

export const NinjaParameterDtoSchema = z.object({
  name: z.string(),
  default_value: z.string(),
  description: z.string(),
});

export const TradingBotDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  code_name: z.string(),
  version: z.string(),
  category: z.enum(['ORDER_FLOW_SCALPING', 'MOMENTUM_BREAKOUT', 'MEAN_REVERSION']),
  primary_instrument: z.string(),
  supported_instruments: z.array(z.string()),
  monthly_price_usd: z.number(),
  win_rate_percent: z.number(),
  profit_factor: z.number(),
  max_drawdown_usd: z.number(),
  avg_daily_trades: z.string(),
  prop_firm_ready: z.boolean(),
  short_description: z.string(),
  full_description: z.string(),
  recommended_account_size_usd: z.number(),
  ninja_parameters: z.array(NinjaParameterDtoSchema),
});

export type TradingBotDto = z.infer<typeof TradingBotDtoSchema>;

export const CreateTradingBotDtoSchema = z.object({
  name: z.string().min(3),
  code_name: z.string().min(3),
  version: z.string().default('v1.0.0 (NT8 64-bit)'),
  category: z.enum(['ORDER_FLOW_SCALPING', 'MOMENTUM_BREAKOUT', 'MEAN_REVERSION']),
  primary_instrument: z.string().min(2),
  supported_instruments: z.array(z.string()).min(1),
  monthly_price_usd: z.number().min(0),
  win_rate_percent: z.number().min(0).max(100),
  profit_factor: z.number().min(0),
  max_drawdown_usd: z.number().min(0),
  avg_daily_trades: z.string(),
  prop_firm_ready: z.boolean().default(true),
  short_description: z.string().min(10),
  full_description: z.string().min(20),
  recommended_account_size_usd: z.number().min(0),
  ninja_parameters: z.array(NinjaParameterDtoSchema).default([]),
});

export type CreateTradingBotDto = z.infer<typeof CreateTradingBotDtoSchema>;
