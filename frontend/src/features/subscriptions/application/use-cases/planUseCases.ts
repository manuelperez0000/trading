import type {
  CreateSubscriptionPlanInput,
  SubscriptionPlan,
  UpdateSubscriptionPlanInput,
} from '../../domain/entities/SubscriptionPlan';
import type { ISubscriptionPlanRepository } from '../../domain/repositories/SubscriptionPlanRepository';

export class GetSubscriptionPlansUseCase {
  constructor(private readonly repository: ISubscriptionPlanRepository) {}

  public async execute(): Promise<SubscriptionPlan[]> {
    return this.repository.getAllPlans();
  }
}

export class CreateSubscriptionPlanUseCase {
  constructor(private readonly repository: ISubscriptionPlanRepository) {}

  public async execute(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    if (!input.name?.trim()) {
      throw new Error('El nombre de la membresía / plan es obligatorio.');
    }
    if (input.priceUsd === undefined || Number(input.priceUsd) < 0) {
      throw new Error('El precio en USD debe ser igual o mayor a 0.');
    }
    if (!input.durationDays || Number(input.durationDays) <= 0) {
      throw new Error('La duración en días debe ser mayor a 0.');
    }
    return this.repository.createPlan(input);
  }
}

export class UpdateSubscriptionPlanUseCase {
  constructor(private readonly repository: ISubscriptionPlanRepository) {}

  public async execute(
    id: string,
    input: UpdateSubscriptionPlanInput
  ): Promise<SubscriptionPlan> {
    if (!id) {
      throw new Error('ID de plan no proporcionado.');
    }
    return this.repository.updatePlan(id, input);
  }
}

export class DeleteSubscriptionPlanUseCase {
  constructor(private readonly repository: ISubscriptionPlanRepository) {}

  public async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID de plan no proporcionado.');
    }
    return this.repository.deletePlan(id);
  }
}

export class ToggleSubscriptionPlanStatusUseCase {
  constructor(private readonly repository: ISubscriptionPlanRepository) {}

  public async execute(id: string, isActive: boolean): Promise<SubscriptionPlan> {
    if (!id) {
      throw new Error('ID de plan no proporcionado.');
    }
    return this.repository.togglePlanStatus(id, isActive);
  }
}
