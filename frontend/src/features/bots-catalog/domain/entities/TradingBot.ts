export interface TradingBot {
  id: string;
  name: string;
  codeName: string;
  version: string;
  category: 'ORDER_FLOW_SCALPING' | 'MOMENTUM_BREAKOUT' | 'MEAN_REVERSION';
  primaryInstrument: string;
  supportedInstruments: string[];
  monthlyPriceUsd: number;
  winRatePercent: number;
  profitFactor: number;
  maxDrawdownUsd: number;
  avgDailyTrades: string;
  propFirmReady: boolean;
  shortDescription: string;
  fullDescription: string;
  recommendedAccountSizeUsd: number;
  ninjaParameters: Array<{
    name: string;
    defaultValue: string;
    description: string;
  }>;
}

export type CreateTradingBotInput = Omit<TradingBot, 'id' | 'version' | 'propFirmReady' | 'ninjaParameters'> & {
  version?: string;
  propFirmReady?: boolean;
  ninjaParameters?: Array<{
    name: string;
    defaultValue: string;
    description: string;
  }>;
};

export const TRADING_BOTS_CATALOG: TradingBot[] = [
  {
    id: 'bot-quantum-orderflow-v4',
    name: 'Quantum OrderFlow Scalper V4',
    codeName: 'QuantumOrderFlowScalperV4',
    version: 'v4.2.1 (NT8 64-bit)',
    category: 'ORDER_FLOW_SCALPING',
    primaryInstrument: 'NQ 12-26',
    supportedInstruments: ['NQ', 'MNQ', 'ES'],
    monthlyPriceUsd: 199,
    winRatePercent: 74.8,
    profitFactor: 2.64,
    maxDrawdownUsd: 1150,
    avgDailyTrades: '4 - 7 trades / sesión NY',
    propFirmReady: true,
    shortDescription:
      'Detecta absorción institucional y desequilibrios diagonales en el Footprint de NQ durante los primeros 90 minutos de NY.',
    fullDescription:
      'Diseñado específicamente para cuentas de fondeo (Apex, Topstep, Bulenox). Utiliza datos Tick-Replay de Nivel 1 y Nivel 2 en NinjaTrader 8 para identificar trampas de liquidez en máximos/mínimos de sesión y ejecutar entradas con Stop Loss y Trailing Stop dinámicos.',
    recommendedAccountSizeUsd: 50000,
    ninjaParameters: [
      {
        name: 'ImbalanceRatio',
        defaultValue: '3.5x',
        description: 'Mínimo desequilibrio Bid/Ask para validar absorción',
      },
      {
        name: 'DailyProfitTargetUsd',
        defaultValue: '$1,500',
        description: 'Auto-apagado diario al alcanzar la meta de ganancia',
      },
      {
        name: 'MaxDailyLossUsd',
        defaultValue: '-$800',
        description: 'Protección dura de drawdown diario para cuentas PA/XFA',
      },
      {
        name: 'RemoteHeartbeatSeconds',
        defaultValue: '5s',
        description: 'Frecuencia de validación de licencia con el Panel Web',
      },
    ],
  },
  {
    id: 'bot-delta-momentum',
    name: 'Delta Momentum Breakout Pro',
    codeName: 'DeltaMomentumBreakout',
    version: 'v3.0.4 (NT8 64-bit)',
    category: 'MOMENTUM_BREAKOUT',
    primaryInstrument: 'ES 12-26',
    supportedInstruments: ['ES', 'MES', 'YM'],
    monthlyPriceUsd: 149,
    winRatePercent: 68.5,
    profitFactor: 2.31,
    maxDrawdownUsd: 920,
    avgDailyTrades: '2 - 4 trades / día',
    propFirmReady: true,
    shortDescription:
      'Captura expansiones de rango en S&P 500 (ES) confirmadas por Delta Acumulado y volumen relativo.',
    fullDescription:
      'Estrategia tendencial de baja frecuencia que evita zonas de congestión mediante un filtro de ADX institucional y pendiente de VWAP. Ideal para traders que buscan menor exposición al mercado con ratios Riesgo:Beneficio de 1:2.5.',
    recommendedAccountSizeUsd: 50000,
    ninjaParameters: [
      {
        name: 'CumulativeDeltaThreshold',
        defaultValue: '+1,200',
        description: 'Delta neto mínimo en vela de ruptura',
      },
      {
        name: 'AtrTrailingMultiplier',
        defaultValue: '1.8 ATR',
        description: 'Distancia del Trailing Stop dinámico tras Break-Even',
      },
      {
        name: 'SessionWindowEst',
        defaultValue: '09:30 - 11:45 EST',
        description: 'Horario operativo habilitado en Nueva York',
      },
    ],
  },
  {
    id: 'bot-vwap-reversion',
    name: 'VWAP Reversion Institutional',
    codeName: 'VWAPReversionInstitutional',
    version: 'v2.8.0 (NT8 64-bit)',
    category: 'MEAN_REVERSION',
    primaryInstrument: 'MNQ 12-26',
    supportedInstruments: ['MNQ', 'MES', 'NQ'],
    monthlyPriceUsd: 129,
    winRatePercent: 79.2,
    profitFactor: 2.18,
    maxDrawdownUsd: 640,
    avgDailyTrades: '6 - 10 trades / día',
    propFirmReady: true,
    shortDescription:
      'Opera retornos estadísticos a la media desde las bandas de desviación estándar ±2.5 SD del VWAP institucional.',
    fullDescription:
      'Especializado en mercados laterales y sesiones de mediodía. Escala posiciones en contratos Micro (MNQ/MES) con alta tasa de acierto y cierre parcial automático al tocar la primera desviación estándar.',
    recommendedAccountSizeUsd: 25000,
    ninjaParameters: [
      {
        name: 'EntryStdDevBand',
        defaultValue: '2.5 SD',
        description: 'Banda de desviación estándar para gatillo de entrada',
      },
      {
        name: 'MaxMicroContracts',
        defaultValue: '5 MNQ',
        description: 'Tamaño máximo de lote permitido por operación',
      },
    ],
  },
  {
    id: 'bot-liquidity-sweep',
    name: 'Gold & Oil Liquidity Sweep Bot',
    codeName: 'LiquiditySweepBot',
    version: 'v1.9.5 (NT8 64-bit)',
    category: 'ORDER_FLOW_SCALPING',
    primaryInstrument: 'GC 12-26',
    supportedInstruments: ['GC', 'MGC', 'CL'],
    monthlyPriceUsd: 179,
    winRatePercent: 71.0,
    profitFactor: 2.45,
    maxDrawdownUsd: 1080,
    avgDailyTrades: '2 - 5 trades / día',
    propFirmReady: true,
    shortDescription:
      'Especializado en barridos de paradas (Stop Hunts) en niveles clave de Londres y apertura americana en Oro (GC) y Petróleo (CL).',
    fullDescription:
      'Monitorea los niveles High/Low de la sesión asiática y europea en futuros de materias primas. Cuando el precio barre la liquidez y reingresa con divergencia de Delta, ejecuta la orden en sentido contrario con objetivo en el POC del perfil de volumen.',
    recommendedAccountSizeUsd: 50000,
    ninjaParameters: [
      {
        name: 'SweepTickPenetration',
        defaultValue: '4 Ticks',
        description: 'Barrido mínimo sobre el máximo/mínimo previo',
      },
      {
        name: 'NewsFilterPauseMinutes',
        defaultValue: '15 min',
        description: 'Pausa automática antes y después de noticias de alto impacto',
      },
    ],
  },
];
