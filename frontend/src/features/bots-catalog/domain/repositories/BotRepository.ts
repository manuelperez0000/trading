import type {
  CreateTradingBotInput,
  TradingBot,
} from '@features/bots-catalog/domain/entities/TradingBot';

export interface IBotRepository {
  getAllBots(): Promise<TradingBot[]>;
  getBotById(id: string): Promise<TradingBot | null>;
  createBot(input: CreateTradingBotInput): Promise<TradingBot>;
  updateBot(id: string, input: Partial<CreateTradingBotInput>): Promise<TradingBot>;
  deleteBot(id: string): Promise<boolean>;
  linkBotToLicense(params: {
    botId: string;
    licenseKey: string;
  }): Promise<{ success: boolean; message: string }>;
}
