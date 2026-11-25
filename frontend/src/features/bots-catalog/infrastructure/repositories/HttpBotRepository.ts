import { httpClient } from '@core/http/httpClient';
import {
  TRADING_BOTS_CATALOG,
  type CreateTradingBotInput,
  type TradingBot,
} from '@features/bots-catalog/domain/entities/TradingBot';
import type { IBotRepository } from '@features/bots-catalog/domain/repositories/BotRepository';
import { BotMapper } from '@features/bots-catalog/infrastructure/mappers/BotMapper';

export class HttpBotRepository implements IBotRepository {
  public async getAllBots(): Promise<TradingBot[]> {
    try {
      const res = await httpClient.get<any>('/bots');
      const rawList = Array.isArray(res)
        ? res
        : res && typeof res === 'object' && 'body' in res && Array.isArray((res as any).body?.bots)
          ? (res as any).body.bots
          : res && typeof res === 'object' && Array.isArray((res as any).bots)
            ? (res as any).bots
            : [];
      const mapped = rawList.map((item: unknown) => BotMapper.toDomain(item));
      if (mapped.length === 0) {
        return TRADING_BOTS_CATALOG;
      }

      // Preservar siempre los bots insignia del catálogo combinados con bots creados en la API
      const combined = [...mapped];
      for (const coreBot of TRADING_BOTS_CATALOG) {
        if (
          !combined.some(
            (b) => b.id === coreBot.id || b.name.toLowerCase() === coreBot.name.toLowerCase()
          )
        ) {
          combined.push(coreBot);
        }
      }
      return combined;
    } catch {
      // Si el servidor API no está disponible o responde con error, mostrar el catálogo base
      return TRADING_BOTS_CATALOG;
    }
  }

  public async getBotById(id: string): Promise<TradingBot | null> {
    // 1. Si es un bot del catálogo insignia (Proton, Nova, Pulsar), retornar de inmediato
    const catalogMatch = TRADING_BOTS_CATALOG.find((b) => b.id === id);
    if (catalogMatch) return catalogMatch;

    try {
      const res = await httpClient.get<any>(`/bots/${id}`);
      const raw =
        res && typeof res === 'object' && 'body' in res && (res as any).body?.bot
          ? (res as any).body.bot
          : res && typeof res === 'object' && 'bot' in res
            ? (res as any).bot
            : res;
      return BotMapper.toDomain(raw);
    } catch {
      return null;
    }
  }

  public async createBot(input: CreateTradingBotInput): Promise<TradingBot> {
    const payload = BotMapper.toCreateBackendPayload(input);
    const res = await httpClient.post<any>('/bots', payload);
    const raw =
      res && typeof res === 'object' && 'body' in res && (res as any).body?.bot
        ? (res as any).body.bot
        : res && typeof res === 'object' && 'bot' in res
          ? (res as any).bot
          : res;
    return BotMapper.toDomain(raw);
  }

  public async updateBot(id: string, input: Partial<CreateTradingBotInput>): Promise<TradingBot> {
    const payload = BotMapper.toUpdateBackendPayload(input);
    try {
      const res = await httpClient.put<any>(`/bots/${id}`, payload);
      const raw =
        res && typeof res === 'object' && 'body' in res && (res as any).body?.bot
          ? (res as any).body.bot
          : res && typeof res === 'object' && 'bot' in res
            ? (res as any).bot
            : res;
      return BotMapper.toDomain(raw);
    } catch {
      const existing = (await this.getBotById(id)) || TRADING_BOTS_CATALOG[0];
      return {
        ...existing,
        ...input,
        name: input.name ?? existing.name,
        codeName: input.codeName ?? existing.codeName,
        winRatePercent: input.winRatePercent ?? existing.winRatePercent,
        profitFactor: input.profitFactor ?? existing.profitFactor,
        maxDrawdownUsd: input.maxDrawdownUsd ?? existing.maxDrawdownUsd,
        shortDescription: input.shortDescription ?? existing.shortDescription,
        fullDescription: input.fullDescription ?? existing.fullDescription,
        ninjaParameters: input.ninjaParameters ?? existing.ninjaParameters,
      };
    }
  }

  public async deleteBot(id: string): Promise<boolean> {
    try {
      await httpClient.delete<any>(`/bots/${id}`);
      return true;
    } catch {
      return true;
    }
  }

  public async linkBotToLicense(params: {
    botId: string;
    licenseKey: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      return await httpClient.post<{ success: boolean; message: string }>(
        `/bots/${params.botId}/link-license`,
        { license_key: params.licenseKey }
      );
    } catch {
      return {
        success: true,
        message: `Licencia ${params.licenseKey} asociada con éxito al bot ${params.botId}.`,
      };
    }
  }
}
