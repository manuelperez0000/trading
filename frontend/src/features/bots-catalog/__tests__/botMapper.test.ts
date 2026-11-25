import { describe, expect, it } from 'vitest';
import { BotMapper } from '@features/bots-catalog/infrastructure/mappers/BotMapper';
import { AuthMapper } from '@features/auth/infrastructure/mappers/AuthMapper';

describe('BotMapper & AuthMapper - Backend Compatibility', () => {
  it('should map Manuel PostgreSQL Bot model (Spanish fields) to Domain TradingBot correctly', () => {
    const backendBotRaw = {
      id: '42',
      nombre: 'Quantum OrderFlow Scalper V4',
      profit_factor: 2.64,
      win_rate: 74.8,
      profit_1_year: 4200,
      drawdown: 1150,
      imagen: 'https://example.com/bot.jpg',
      descripcion: 'Estrategia algorítmica para NinjaTrader 8 con absorciones de Footprint.',
      created_at: '2026-11-20T20:00:00.000Z',
      updated_at: '2026-11-20T20:00:00.000Z',
    };

    const domainBot = BotMapper.toDomain(backendBotRaw);

    expect(domainBot).toBeDefined();
    expect(domainBot.id).toBe('42');
    expect(domainBot.name).toBe('Quantum OrderFlow Scalper V4');
    expect(domainBot.monthlyPriceUsd).toBe(199);
    expect(domainBot.winRatePercent).toBe(74.8);
    expect(domainBot.profitFactor).toBe(2.64);
    expect(domainBot.maxDrawdownUsd).toBe(1150);
    expect(domainBot.shortDescription).toContain('absorciones de Footprint');
    expect(domainBot.ninjaParameters).toHaveLength(2);
  });

  it('should generate create payload matching backend validateBotData schema', () => {
    const payload = BotMapper.toCreateBackendPayload({
      name: 'Delta Momentum Breakout',
      codeName: 'DeltaMomentumBreakout',
      category: 'MOMENTUM_BREAKOUT',
      primaryInstrument: 'ES 12-26',
      supportedInstruments: ['ES', 'MES'],
      monthlyPriceUsd: 179,
      winRatePercent: 71.2,
      profitFactor: 2.35,
      maxDrawdownUsd: 1200,
      avgDailyTrades: '3 trades',
      shortDescription: 'Rupturas con confirmación de volumen Delta.',
      fullDescription: 'Descripción extendida del bot Delta.',
      recommendedAccountSizeUsd: 50000,
    });

    expect(payload.nombre).toBe('Delta Momentum Breakout');
    expect(payload.win_rate).toBe(71.2);
    expect(payload.profit_factor).toBe(2.35);
    expect(payload.drawdown).toBe(1200);
    expect(payload.imagen).toBeDefined();
  });

  it('should map Manuel flat User model with responser envelope to Domain User', () => {
    const backendResponserLogin = {
      body: {
        token: 'jwt-header.payload.signature',
        user: {
          id: '12',
          nombreCompleto: 'Ana Pérez',
          direccion: 'Calle 123',
          telefono: '+1 213-373-4253',
          whatsapp: '+44 20 8366 1177',
          correoElectronico: 'ana@example.com',
          urlDocumentoIdentidad: 'https://example.com/id.pdf',
          fechaCreacion: '2026-11-18T20:00:00.000Z',
          estado: 'activo',
        },
      },
      message: 'Inicio de sesión exitoso.',
      status: 200,
    };

    const session = AuthMapper.sessionToDomain(backendResponserLogin);

    expect(session).toBeDefined();
    expect(session.tokens.accessToken).toBe('jwt-header.payload.signature');
    expect(session.user.id).toBe('12');
    expect(session.user.fullName).toBe('Ana Pérez');
    expect(session.user.email).toBe('ana@example.com');
    expect(session.user.handle).toBe('@ana');
    expect(session.user.role).toBe('TRADER');
    expect(session.user.direccion).toBe('Calle 123');
    expect(session.user.telefono).toBe('+1 213-373-4253');
    expect(session.user.whatsapp).toBe('+44 20 8366 1177');
    expect(session.user.urlDocumentoIdentidad).toBe('https://example.com/id.pdf');
    expect(session.user.estado).toBe('activo');
  });

  it('should map GET /api/v1/users list response to Domain User[]', () => {
    const backendUsersResponse = {
      body: {
        users: [
          {
            id: '1',
            nombreCompleto: 'Carlos Figuera',
            correoElectronico: 'admin@tradinglifeacademy.com',
            direccion: 'Av. Principal',
            telefono: '+1 213-373-4253',
            whatsapp: '+1 213-373-4253',
            estado: 'activo',
            role: 'admin',
          },
          {
            id: '2',
            nombreCompleto: 'Ana Pérez',
            correoElectronico: 'ana@example.com',
            estado: 'activo',
            role: 'client',
          },
        ],
      },
      message: 'Usuarios listados correctamente.',
      status: 200,
    };

    const users = AuthMapper.usersListToDomain(backendUsersResponse);
    expect(users).toHaveLength(2);
    expect(users[0].id).toBe('1');
    expect(users[0].role).toBe('ADMIN');
    expect(users[1].fullName).toBe('Ana Pérez');
  });
});
