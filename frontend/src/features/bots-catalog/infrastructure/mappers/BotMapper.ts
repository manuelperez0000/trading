import type {
  CreateTradingBotInput,
  TradingBot,
} from '@features/bots-catalog/domain/entities/TradingBot';
import {
  CreateTradingBotDtoSchema,
  TradingBotDtoSchema,
  type CreateTradingBotDto,
  type TradingBotDto,
} from '@features/bots-catalog/infrastructure/dto/BotDto';

export class BotMapper {
  public static toDomain(raw: unknown): TradingBot {
    const dto = TradingBotDtoSchema.parse(raw);
    return {
      id: dto.id,
      name: dto.name,
      codeName: dto.code_name,
      version: dto.version,
      category: dto.category,
      primaryInstrument: dto.primary_instrument,
      supportedInstruments: dto.supported_instruments,
      monthlyPriceUsd: dto.monthly_price_usd,
      winRatePercent: dto.win_rate_percent,
      profitFactor: dto.profit_factor,
      maxDrawdownUsd: dto.max_drawdown_usd,
      avgDailyTrades: dto.avg_daily_trades,
      propFirmReady: dto.prop_firm_ready,
      shortDescription: dto.short_description,
      fullDescription: dto.full_description,
      recommendedAccountSizeUsd: dto.recommended_account_size_usd,
      ninjaParameters: dto.ninja_parameters.map((p) => ({
        name: p.name,
        defaultValue: p.default_value,
        description: p.description,
      })),
    };
  }

  public static toDto(entity: TradingBot): TradingBotDto {
    return {
      id: entity.id,
      name: entity.name,
      code_name: entity.codeName,
      version: entity.version,
      category: entity.category,
      primary_instrument: entity.primaryInstrument,
      supported_instruments: entity.supportedInstruments,
      monthly_price_usd: entity.monthlyPriceUsd,
      win_rate_percent: entity.winRatePercent,
      profit_factor: entity.profitFactor,
      max_drawdown_usd: entity.maxDrawdownUsd,
      avg_daily_trades: entity.avgDailyTrades,
      prop_firm_ready: entity.propFirmReady,
      short_description: entity.shortDescription,
      full_description: entity.fullDescription,
      recommended_account_size_usd: entity.recommendedAccountSizeUsd,
      ninja_parameters: entity.ninjaParameters.map((p) => ({
        name: p.name,
        default_value: p.defaultValue,
        description: p.description,
      })),
    };
  }

  public static toCreateDto(input: CreateTradingBotInput): CreateTradingBotDto {
    const raw: CreateTradingBotDto = {
      name: input.name,
      code_name: input.codeName,
      version: input.version || 'v1.0.0 (NT8 64-bit)',
      category: input.category,
      primary_instrument: input.primaryInstrument,
      supported_instruments: input.supportedInstruments,
      monthly_price_usd: input.monthlyPriceUsd,
      win_rate_percent: input.winRatePercent,
      profit_factor: input.profitFactor,
      max_drawdown_usd: input.maxDrawdownUsd,
      avg_daily_trades: input.avgDailyTrades,
      prop_firm_ready: input.propFirmReady ?? true,
      short_description: input.shortDescription,
      full_description: input.fullDescription,
      recommended_account_size_usd: input.recommendedAccountSizeUsd,
      ninja_parameters: (input.ninjaParameters || []).map((p) => ({
        name: p.name,
        default_value: p.defaultValue,
        description: p.description,
      })),
    };
    return CreateTradingBotDtoSchema.parse(raw);
  }
}
