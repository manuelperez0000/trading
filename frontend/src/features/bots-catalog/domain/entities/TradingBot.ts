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
    id: 'bot-proton',
    name: 'Proton',
    codeName: 'ProtonReversionV2',
    version: 'v2.9.0 (NT8 64-bit)',
    category: 'MEAN_REVERSION',
    primaryInstrument: 'MNQ 12-26',
    supportedInstruments: ['MNQ', 'MES', 'GC'],
    monthlyPriceUsd: 129,
    winRatePercent: 69.5,
    profitFactor: 2.18,
    maxDrawdownUsd: 640,
    avgDailyTrades: '5 - 8 trades / día',
    propFirmReady: true,
    shortDescription:
      'Eficiencia Base: Opera retornos estadísticos a la media desde bandas ±2.5 SD del VWAP con riesgo controlado en contratos Micro.',
    fullDescription:
      'Primer escalón de nuestra línea de bots por suscripción. Especializado en sesiones estructuradas y contratos Micro (MNQ/MES), ofreciendo una entrada accesible y disciplinada para evaluaciones en Lucid Trading, My Funded Futures (MFFU), Tradeify y Cuentas Reales.',
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
    id: 'bot-nova',
    name: 'Nova',
    codeName: 'NovaMomentumV3',
    version: 'v3.4.0 (NT8 64-bit)',
    category: 'MOMENTUM_BREAKOUT',
    primaryInstrument: 'ES 12-26',
    supportedInstruments: ['ES', 'MES', 'NQ'],
    monthlyPriceUsd: 149,
    winRatePercent: 73.6,
    profitFactor: 2.48,
    maxDrawdownUsd: 920,
    avgDailyTrades: '2 - 4 trades / día',
    propFirmReady: true,
    shortDescription:
      'Alta Eficiencia: Captura expansiones tendenciales en S&P 500 (ES) y Nasdaq confirmadas por Delta Acumulado y volumen relativo.',
    fullDescription:
      'Segundo escalón de eficiencia cuantitativa. Estrategia tendencial que filtra zonas de congestión mediante pendiente de VWAP y Delta neto. Ideal para superar pruebas en Lucid Trading, My Funded Futures (MFFU) y Tradeify o gestionar Cuentas Reales con baja exposición al mercado.',
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
    id: 'bot-pulsar',
    name: 'Pulsar',
    codeName: 'PulsarOrderFlowV4',
    version: 'v4.2.1 (NT8 64-bit)',
    category: 'ORDER_FLOW_SCALPING',
    primaryInstrument: 'NQ 12-26',
    supportedInstruments: ['NQ', 'MNQ', 'ES'],
    monthlyPriceUsd: 199,
    winRatePercent: 78.4,
    profitFactor: 2.85,
    maxDrawdownUsd: 850,
    avgDailyTrades: '4 - 7 trades / sesión NY',
    propFirmReady: true,
    shortDescription:
      'Máxima Eficiencia (El Más Eficiente): Algoritmo insignia de absorción institucional y Order Flow en NQ/MNQ con precisión quirúrgica y mínimo drawdown.',
    fullDescription:
      'Nuestro bot más eficiente y avanzado del catálogo. Diseñado para evaluaciones en Lucid Trading, My Funded Futures (MFFU), Tradeify y Cuentas Reales. Utiliza lectura de flujo de órdenes de Nivel 1 y Nivel 2 para detectar absorciones institucionales y ejecutar entradas con Stop Loss y Trailing Stop dinámicos.',
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
        defaultValue: '-$750',
        description: 'Protección dura de drawdown diario para Lucid, MFFU y Tradeify',
      },
      {
        name: 'RemoteHeartbeatSeconds',
        defaultValue: '5s',
        description: 'Frecuencia de validación de licencia con el Panel Web',
      },
    ],
  },
];
