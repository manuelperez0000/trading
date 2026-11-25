import type {
  CreateTradingBotInput,
  TradingBot,
} from '@features/bots-catalog/domain/entities/TradingBot';
import {
  BackendBotDtoSchema,
  CreateBackendBotDtoSchema,
  CreateTradingBotDtoSchema,
  TradingBotDtoSchema,
  type CreateBackendBotDto,
  type CreateTradingBotDto,
  type TradingBotDto,
} from '@features/bots-catalog/infrastructure/dto/BotDto';

export class BotMapper {
  public static toDomain(raw: unknown): TradingBot {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Formato inválido de bot');
    }
    const r = raw as Record<string, any>;

    // Soporte para el modelo implementado por Manuel en PostgreSQL (campos en español)
    if ('nombre' in r) {
      const dto = BackendBotDtoSchema.parse(r);
      return {
        id: dto.id,
        name: dto.nombre,
        codeName: dto.nombre.replace(/[^a-zA-Z0-9]/g, '') || 'TradingBot',
        version: r.version || 'v1.0.0 (NT8 64-bit)',
        category:
          r.category &&
          ['ORDER_FLOW_SCALPING', 'MOMENTUM_BREAKOUT', 'MEAN_REVERSION'].includes(r.category)
            ? r.category
            : 'ORDER_FLOW_SCALPING',
        primaryInstrument: r.primary_instrument || 'NQ 12-26',
        supportedInstruments: Array.isArray(r.supported_instruments)
          ? r.supported_instruments
          : ['NQ', 'MNQ', 'ES'],
        monthlyPriceUsd: dto.precio_mensual,
        winRatePercent: dto.win_rate,
        profitFactor: dto.profit_factor,
        maxDrawdownUsd: dto.drawdown,
        avgDailyTrades: r.avg_daily_trades || '4 - 7 trades / sesión NY',
        propFirmReady: r.prop_firm_ready ?? true,
        shortDescription: dto.descripcion,
        fullDescription: r.full_description || dto.descripcion,
        recommendedAccountSizeUsd:
          r.recommended_account_size_usd ?? (dto.drawdown * 25 > 25000 ? 50000 : 25000),
        ninjaParameters: Array.isArray(r.ninja_parameters)
          ? r.ninja_parameters
          : [
              {
                name: 'ImbalanceRatio',
                defaultValue: '3.5x',
                description: 'Mínimo desequilibrio Bid/Ask en Footprint',
              },
              {
                name: 'HardDailyDrawdownLimit',
                defaultValue: `$${dto.drawdown}`,
                description: 'Hard-stop de pérdida diaria inviolable',
              },
            ],
      };
    }

    // Formato estándar DTO (mock / arquitectura previa)
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

  public static toCreateBackendPayload(input: CreateTradingBotInput): CreateBackendBotDto {
    const raw: CreateBackendBotDto = {
      nombre: input.name,
      profit_factor: Number(input.profitFactor ?? 2.0),
      win_rate: Number(input.winRatePercent ?? 72.5),
      profit_1_year: Math.round((input.monthlyPriceUsd ?? 149) * 25),
      drawdown: Number(input.maxDrawdownUsd ?? 1000),
      imagen: 'https://tradinglifeacademy.com/assets/bot-default.jpg',
      descripcion:
        input.shortDescription ||
        input.fullDescription ||
        'Estrategia algorítmica oficial para NinjaTrader 8.',
    };
    return CreateBackendBotDtoSchema.parse(raw);
  }
}
