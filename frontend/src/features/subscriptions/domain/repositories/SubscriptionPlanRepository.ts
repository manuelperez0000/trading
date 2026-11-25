import type {
  CreateSubscriptionPlanInput,
  SubscriptionPlan,
  UpdateSubscriptionPlanInput,
} from '../entities/SubscriptionPlan';

export interface ISubscriptionPlanRepository {
  getAllPlans(): Promise<SubscriptionPlan[]>;
  getPlanById(id: string): Promise<SubscriptionPlan | null>;
  createPlan(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlan>;
  updatePlan(id: string, input: UpdateSubscriptionPlanInput): Promise<SubscriptionPlan>;
  deletePlan(id: string): Promise<void>;
  togglePlanStatus(id: string, isActive: boolean): Promise<SubscriptionPlan>;
}
