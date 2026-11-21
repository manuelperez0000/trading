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

/**
 * Esquema del Bot implementado en PostgreSQL por el backend de Express.
 */
export const BackendBotDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  nombre: z.string(),
  profit_factor: z.coerce.number(),
  win_rate: z.coerce.number(),
  profit_1_year: z.coerce.number(),
  drawdown: z.coerce.number(),
  precio_mensual: z.coerce.number(),
  imagen: z.string().optional().default('https://tradinglifeacademy.com/assets/bot-default.jpg'),
  moneda: z.string().optional().default('USD'),
  descripcion: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type BackendBotDto = z.infer<typeof BackendBotDtoSchema>;

export const CreateBackendBotDtoSchema = z.object({
  nombre: z.string().min(1).max(200),
  profit_factor: z.number().min(0),
  win_rate: z.number().min(0).max(100),
  profit_1_year: z.number(),
  drawdown: z.number().min(0),
  precio_mensual: z.number().min(0),
  imagen: z.string(),
  moneda: z.string().default('USD'),
  descripcion: z.string().min(1),
});

export type CreateBackendBotDto = z.infer<typeof CreateBackendBotDtoSchema>;
