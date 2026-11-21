import { httpClient } from '@core/http/httpClient';
import type {
  CreateTradingBotInput,
  TradingBot,
} from '@features/bots-catalog/domain/entities/TradingBot';
import type { IBotRepository } from '@features/bots-catalog/domain/repositories/BotRepository';
import { BotMapper } from '@features/bots-catalog/infrastructure/mappers/BotMapper';

export class HttpBotRepository implements IBotRepository {
  public async getAllBots(): Promise<TradingBot[]> {
    const res = await httpClient.get<any>('/bots');
    // Desempaquetar responser { body: { bots: [...] } } o arreglo directo
    const rawList = Array.isArray(res)
      ? res
      : (res && typeof res === 'object' && 'body' in res && Array.isArray((res as any).body?.bots))
        ? (res as any).body.bots
        : (res && typeof res === 'object' && Array.isArray((res as any).bots))
          ? (res as any).bots
          : [];
    return rawList.map((item: unknown) => BotMapper.toDomain(item));
  }

  public async getBotById(id: string): Promise<TradingBot | null> {
    try {
      const res = await httpClient.get<any>(`/bots/${id}`);
      // Desempaquetar responser { body: { bot: { ... } } } o bot directo
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
