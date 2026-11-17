import {
  TRADING_BOTS_CATALOG,
  type CreateTradingBotInput,
  type TradingBot,
} from '@features/bots-catalog/domain/entities/TradingBot';
import type { IBotRepository } from '@features/bots-catalog/domain/repositories/BotRepository';

export class MockBotRepository implements IBotRepository {
  private bots: TradingBot[] = structuredClone(TRADING_BOTS_CATALOG);

  public async getAllBots(): Promise<TradingBot[]> {
    return structuredClone(this.bots);
  }

  public async getBotById(id: string): Promise<TradingBot | null> {
    const found = this.bots.find((b) => b.id === id);
    return found ? structuredClone(found) : null;
  }

  public async createBot(input: CreateTradingBotInput): Promise<TradingBot> {
    const slug = input.codeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const newId = `bot-${slug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBot: TradingBot = {
      id: newId,
      name: input.name,
      codeName: input.codeName,
      version: input.version || 'v1.0.0 (NT8 64-bit)',
      category: input.category,
      primaryInstrument: input.primaryInstrument,
      supportedInstruments: input.supportedInstruments,
      monthlyPriceUsd: input.monthlyPriceUsd,
      winRatePercent: input.winRatePercent,
      profitFactor: input.profitFactor,
      maxDrawdownUsd: input.maxDrawdownUsd,
      avgDailyTrades: input.avgDailyTrades,
      propFirmReady: input.propFirmReady ?? true,
      shortDescription: input.shortDescription,
      fullDescription: input.fullDescription,
      recommendedAccountSizeUsd: input.recommendedAccountSizeUsd,
      ninjaParameters: input.ninjaParameters || [],
    };

    // Agregar al inicio para que el nuevo bot aparezca de primero en el catálogo
    this.bots.unshift(newBot);
    return structuredClone(newBot);
  }

  public async linkBotToLicense(params: {
    botId: string;
    licenseKey: string;
  }): Promise<{ success: boolean; message: string }> {
    const found = this.bots.find((b) => b.id === params.botId);
    if (!found) throw new Error(`Bot ${params.botId} no encontrado.`);
    return {
      success: true,
      message: `Estrategia ${found.codeName} vinculada con éxito a ${params.licenseKey}`,
    };
  }
}
