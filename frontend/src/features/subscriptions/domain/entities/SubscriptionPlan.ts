export type PlanBillingCycle =
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMIANNUAL'
  | 'ANNUAL'
  | 'CUSTOM';

export type PlanBotAccessType = 'ALL_ACCESS' | 'SPECIFIC_BOTS';

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  priceUsd: number;
  currency: string;
  billingCycle: PlanBillingCycle;
  durationDays: number;
  badgeText?: string;
  isPopular?: boolean;
  isActive: boolean;
  features: string[];
  botAccessType: PlanBotAccessType;
  allowedBotIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanInput {
  name: string;
  code?: string;
  description: string;
  priceUsd: number;
  currency?: string;
  billingCycle: PlanBillingCycle;
  durationDays: number;
  badgeText?: string;
  isPopular?: boolean;
  isActive?: boolean;
  features: string[];
  botAccessType?: PlanBotAccessType;
  allowedBotIds?: string[];
}

export interface UpdateSubscriptionPlanInput {
  name?: string;
  description?: string;
  priceUsd?: number;
  currency?: string;
  billingCycle?: PlanBillingCycle;
  durationDays?: number;
  badgeText?: string;
  isPopular?: boolean;
  isActive?: boolean;
  features?: string[];
  botAccessType?: PlanBotAccessType;
  allowedBotIds?: string[];
}

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-monthly-all-access',
    code: 'MEMBERSHIP_MONTHLY',
    name: 'Membresía Mensual All-Access',
    description: 'Acceso total y sin restricciones a todos los bots del catálogo con renovación mensual.',
    priceUsd: 149,
    currency: 'USD',
    billingCycle: 'MONTHLY',
    durationDays: 30,
    badgeText: 'Flexibilidad Mensual',
    isPopular: false,
    isActive: true,
    features: [
      'Acceso completo a Proton, Nova y Pulsar',
      '1 Licencia oficial NinjaTrader 8 con HWID lock',
      'Configuraciones para cuentas de fondeo (Prop Firms)',
      'Soporte técnico y canal VIP',
      'Cancelación o renovación en cualquier momento',
    ],
    botAccessType: 'ALL_ACCESS',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-20T00:00:00.000Z',
  },
  {
    id: 'plan-annual-all-access',
    code: 'MEMBERSHIP_ANNUAL',
    name: 'Membresía Anual All-Access',
    description: 'Máximo ahorro para traders profesionales: acceso por 365 días con 2 meses gratis incluidos.',
    priceUsd: 1190,
    currency: 'USD',
    billingCycle: 'ANNUAL',
    durationDays: 365,
    badgeText: 'Ahorra $598 USD (2 Meses Gratis)',
    isPopular: true,
    isActive: true,
    features: [
      'Acceso por 365 días a todo el catálogo de bots',
      '1 Licencia NinjaTrader 8 con reseteo de HWID ilimitado',
      'Actualizaciones automáticas de parámetros y código',
      'Soporte prioritario 1 a 1 para instalación remota',
      'Perfiles de riesgo para Lucid, MFFU, Tradeify y Cuentas Reales',
      'Ahorro equivalente a más de 2 meses de suscripción',
    ],
    botAccessType: 'ALL_ACCESS',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-20T00:00:00.000Z',
  },
  {
    id: 'plan-quarterly-pro',
    code: 'MEMBERSHIP_QUARTERLY',
    name: 'Membresía Trimestral Pro',
    description: 'Compromiso a mediano plazo ideal para superar evaluaciones y fases de fondeo.',
    priceUsd: 399,
    currency: 'USD',
    billingCycle: 'QUARTERLY',
    durationDays: 90,
    badgeText: 'Recomendado para Evaluaciones',
    isPopular: false,
    isActive: true,
    features: [
      'Acceso completo por 90 días a todos los bots',
      'Licencia NinjaTrader 8 autorizada para cuentas de fondeo',
      'Plantillas de gestión de riesgo ajustadas a drawdown diario',
      'Soporte técnico preferencial',
    ],
    botAccessType: 'ALL_ACCESS',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-11-20T00:00:00.000Z',
  },
];
