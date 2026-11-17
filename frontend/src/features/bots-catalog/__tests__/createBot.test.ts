import { describe, expect, it } from 'vitest';
import { MockBotRepository } from '@features/bots-catalog/infrastructure/repositories/MockBotRepository';
import { CreateBotUseCase } from '@features/bots-catalog/application/use-cases/botUseCases';

describe('CreateBotUseCase & MockBotRepository', () => {
  it('should successfully create a new trading bot and prepend it to the catalog', async () => {
    const repository = new MockBotRepository();
    const useCase = new CreateBotUseCase(repository);

    const initialBots = await repository.getAllBots();
    const initialCount = initialBots.length;

    const newBot = await useCase.execute({
      name: 'Alpha Volume Profile Scalper',
      codeName: 'AlphaVolumeProfileScalper',
      version: 'v1.0.0 (NT8 64-bit)',
      category: 'ORDER_FLOW_SCALPING',
      primaryInstrument: 'NQ 12-26',
      supportedInstruments: ['NQ', 'MNQ', 'ES'],
      monthlyPriceUsd: 149,
      winRatePercent: 72.5,
      profitFactor: 2.45,
      maxDrawdownUsd: 950,
      avgDailyTrades: '3 - 6 trades / sesión',
      propFirmReady: true,
      shortDescription: 'Estrategia basada en absorciones de volumen institucional.',
      fullDescription: 'Estrategia completa para NinjaTrader 8 con gestión de riesgo y trailing stop.',
      recommendedAccountSizeUsd: 50000,
      ninjaParameters: [
        {
          name: 'StopLossTicks',
          defaultValue: '36',
          description: 'Stop Loss máximo por operación',
        },
      ],
    });

    expect(newBot).toBeDefined();
    expect(newBot.id).toContain('bot-alphavolumeprofilescalper-');
    expect(newBot.name).toBe('Alpha Volume Profile Scalper');
    expect(newBot.codeName).toBe('AlphaVolumeProfileScalper');
    expect(newBot.monthlyPriceUsd).toBe(149);
    expect(newBot.ninjaParameters).toHaveLength(1);

    const updatedBots = await repository.getAllBots();
    expect(updatedBots.length).toBe(initialCount + 1);
    expect(updatedBots[0].id).toBe(newBot.id); // Validar que se añade al inicio
  });

  it('should throw an error if bot name or codeName is empty', async () => {
    const repository = new MockBotRepository();
    const useCase = new CreateBotUseCase(repository);

    await expect(
      useCase.execute({
        name: '   ',
        codeName: 'ValidCodeName',
        category: 'ORDER_FLOW_SCALPING',
        primaryInstrument: 'NQ 12-26',
        supportedInstruments: ['NQ'],
        monthlyPriceUsd: 100,
        winRatePercent: 65,
        profitFactor: 1.8,
        maxDrawdownUsd: 800,
        avgDailyTrades: '3 trades',
        shortDescription: 'Desc',
        fullDescription: 'Full Desc',
        recommendedAccountSizeUsd: 25000,
      })
    ).rejects.toThrow('El nombre comercial del bot es obligatorio.');
  });
});
