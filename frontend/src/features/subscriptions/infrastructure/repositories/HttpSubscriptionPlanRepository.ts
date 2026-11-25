import { httpClient } from '@core/http/httpClient';
import {
  INITIAL_SUBSCRIPTION_PLANS,
  type CreateSubscriptionPlanInput,
  type SubscriptionPlan,
  type UpdateSubscriptionPlanInput,
} from '../../domain/entities/SubscriptionPlan';
import type { ISubscriptionPlanRepository } from '../../domain/repositories/SubscriptionPlanRepository';

const STORAGE_KEY_PLANS = 'tla_admin_subscription_plans_v1';

function getStoredPlans(): SubscriptionPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(INITIAL_SUBSCRIPTION_PLANS));
      return INITIAL_SUBSCRIPTION_PLANS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBSCRIPTION_PLANS;
  } catch {
    return INITIAL_SUBSCRIPTION_PLANS;
  }
}

function saveStoredPlans(plans: SubscriptionPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
  } catch {
    // ignore
  }
}

export class HttpSubscriptionPlanRepository implements ISubscriptionPlanRepository {
  public async getAllPlans(): Promise<SubscriptionPlan[]> {
    try {
      const res = await httpClient.get<any>('/subscription-plans');
      const rawList = Array.isArray(res)
        ? res
        : res?.body?.plans ?? res?.plans;
      if (Array.isArray(rawList) && rawList.length > 0) {
        saveStoredPlans(rawList);
        return rawList;
      }
    } catch {
      // fallback a almacenamiento local persistente
    }
    return getStoredPlans();
  }

  public async getPlanById(id: string): Promise<SubscriptionPlan | null> {
    const plans = await this.getAllPlans();
    return plans.find((p) => p.id === id || p.code === id) ?? null;
  }

  public async createPlan(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    const now = new Date().toISOString();
    const code =
      input.code?.trim().toUpperCase().replace(/\s+/g, '_') ||
      `PLAN_${input.billingCycle}_${Date.now().toString(36).toUpperCase()}`;

    const newPlan: SubscriptionPlan = {
      id: `plan-${Date.now()}`,
      code,
      name: input.name.trim(),
      description: input.description.trim(),
      priceUsd: Number(input.priceUsd) || 0,
      currency: input.currency?.trim().toUpperCase() || 'USD',
      billingCycle: input.billingCycle,
      durationDays: Number(input.durationDays) || 30,
      badgeText: input.badgeText?.trim() || undefined,
      isPopular: Boolean(input.isPopular),
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
      features: (input.features || []).map((f: string) => f.trim()).filter(Boolean),
      botAccessType: input.botAccessType || 'ALL_ACCESS',
      allowedBotIds: input.allowedBotIds || [],
      createdAt: now,
      updatedAt: now,
    };

    const currentList = getStoredPlans();
    const updated = [newPlan, ...currentList];
    saveStoredPlans(updated);

    try {
      await httpClient.post('/subscription-plans', newPlan);
    } catch {
      // Backend fallback
    }

    return newPlan;
  }

  public async updatePlan(
    id: string,
    input: UpdateSubscriptionPlanInput
  ): Promise<SubscriptionPlan> {
    const currentList = getStoredPlans();
    const index = currentList.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Plan con ID ${id} no encontrado.`);
    }

    const existing = currentList[index];
    const updatedPlan: SubscriptionPlan = {
      ...existing,
      name: input.name !== undefined ? input.name.trim() : existing.name,
      description:
        input.description !== undefined ? input.description.trim() : existing.description,
      priceUsd: input.priceUsd !== undefined ? Number(input.priceUsd) : existing.priceUsd,
      currency: input.currency !== undefined ? input.currency.trim().toUpperCase() : existing.currency,
      billingCycle: input.billingCycle ?? existing.billingCycle,
      durationDays:
        input.durationDays !== undefined ? Number(input.durationDays) : existing.durationDays,
      badgeText: input.badgeText !== undefined ? input.badgeText.trim() : existing.badgeText,
      isPopular: input.isPopular !== undefined ? Boolean(input.isPopular) : existing.isPopular,
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : existing.isActive,
      features:
        input.features !== undefined
          ? input.features.map((f: string) => f.trim()).filter(Boolean)
          : existing.features,
      botAccessType: input.botAccessType ?? existing.botAccessType,
      allowedBotIds: input.allowedBotIds ?? existing.allowedBotIds,
      updatedAt: new Date().toISOString(),
    };

    currentList[index] = updatedPlan;
    saveStoredPlans(currentList);

    try {
      await httpClient.put(`/subscription-plans/${id}`, updatedPlan);
    } catch {
      // Backend fallback
    }

    return updatedPlan;
  }

  public async deletePlan(id: string): Promise<void> {
    const currentList = getStoredPlans();
    const filtered = currentList.filter((p) => p.id !== id);
    saveStoredPlans(filtered);

    try {
      await httpClient.delete(`/subscription-plans/${id}`);
    } catch {
      // Backend fallback
    }
  }

  public async togglePlanStatus(id: string, isActive: boolean): Promise<SubscriptionPlan> {
    return this.updatePlan(id, { isActive });
  }
}
