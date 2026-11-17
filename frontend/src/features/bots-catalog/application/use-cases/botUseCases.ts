import type {
  CreateTradingBotInput,
  TradingBot,
} from '@features/bots-catalog/domain/entities/TradingBot';
import type { IBotRepository } from '@features/bots-catalog/domain/repositories/BotRepository';

export class GetBotsUseCase {
  constructor(private readonly repository: IBotRepository) {}

  public async execute(): Promise<TradingBot[]> {
    return this.repository.getAllBots();
  }
}

export class CreateBotUseCase {
  constructor(private readonly repository: IBotRepository) {}

  public async execute(input: CreateTradingBotInput): Promise<TradingBot> {
    if (!input.name.trim()) throw new Error('El nombre comercial del bot es obligatorio.');
    if (!input.codeName.trim()) throw new Error('El nombre en código C# (NinjaScript) es obligatorio.');
    if (input.monthlyPriceUsd < 0) throw new Error('El precio mensual no puede ser negativo.');
    if (!input.primaryInstrument.trim()) throw new Error('El instrumento principal es obligatorio.');
    return this.repository.createBot(input);
  }
}

export class GetBotDetailUseCase {
  constructor(private readonly repository: IBotRepository) {}

  public async execute(id: string): Promise<TradingBot | null> {
    if (!id.trim()) throw new Error('ID de bot inválido.');
    return this.repository.getBotById(id);
  }
}

export class LinkBotToLicenseUseCase {
  constructor(private readonly repository: IBotRepository) {}

  public async execute(params: {
    botId: string;
    licenseKey: string;
  }): Promise<{ success: boolean; message: string }> {
    if (!params.botId.trim() || !params.licenseKey.trim()) {
      throw new Error('Bot y LicenseKey son obligatorios.');
    }
    return this.repository.linkBotToLicense(params);
  }
}
