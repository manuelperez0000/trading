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

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [];
