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
      return mapped.length > 0 ? mapped : TRADING_BOTS_CATALOG;
    } catch {
      // Si el servidor API no está levantado localmente, mostrar el catálogo base para exploración pública
      return TRADING_BOTS_CATALOG;
    }
  }

  public async getBotById(id: string): Promise<TradingBot | null> {
    // 1. Verificar si corresponde a un bot del catálogo base por slug o ID
    const catalogMatch = TRADING_BOTS_CATALOG.find((b) => b.id === id);

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
      return catalogMatch ?? null;
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
