import { httpClient } from '@core/http/httpClient';
import type {
  CreateTradingBotInput,
  TradingBot,
} from '@features/bots-catalog/domain/entities/TradingBot';
import type { IBotRepository } from '@features/bots-catalog/domain/repositories/BotRepository';
import { BotMapper } from '@features/bots-catalog/infrastructure/mappers/BotMapper';

export class HttpBotRepository implements IBotRepository {
  public async getAllBots(): Promise<TradingBot[]> {
    const rawList = await httpClient.get<unknown[]>('/bots');
    return rawList.map((item) => BotMapper.toDomain(item));
  }

  public async getBotById(id: string): Promise<TradingBot | null> {
    try {
      const raw = await httpClient.get<unknown>(`/bots/${id}`);
      return BotMapper.toDomain(raw);
    } catch {
      return null;
    }
  }

  public async createBot(input: CreateTradingBotInput): Promise<TradingBot> {
    const payload = BotMapper.toCreateDto(input);
    const raw = await httpClient.post<unknown>('/bots', payload);
    return BotMapper.toDomain(raw);
  }

  public async linkBotToLicense(params: {
    botId: string;
    licenseKey: string;
  }): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>(
      `/bots/${params.botId}/link-license`,
      { license_key: params.licenseKey }
    );
  }
}
