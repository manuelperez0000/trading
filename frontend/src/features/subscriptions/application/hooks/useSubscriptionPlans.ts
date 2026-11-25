import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { container } from '@app/di/container';
import type {
  CreateSubscriptionPlanInput,
  SubscriptionPlan,
  UpdateSubscriptionPlanInput,
} from '../../domain/entities/SubscriptionPlan';

export const subscriptionPlansQueryKey = ['subscription-plans'] as const;

export function useSubscriptionPlansQuery() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: subscriptionPlansQueryKey,
    queryFn: () => container.getSubscriptionPlansUseCase.execute(),
  });
}

export function useCreateSubscriptionPlanMutation() {
  const queryClient = useQueryClient();
  return useMutation<SubscriptionPlan, Error, CreateSubscriptionPlanInput>({
    mutationFn: (input) => container.createSubscriptionPlanUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionPlansQueryKey });
    },
  });
}

export function useUpdateSubscriptionPlanMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    SubscriptionPlan,
    Error,
    { id: string; input: UpdateSubscriptionPlanInput }
  >({
    mutationFn: ({ id, input }) =>
      container.updateSubscriptionPlanUseCase.execute(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionPlansQueryKey });
    },
  });
}

export function useDeleteSubscriptionPlanMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => container.deleteSubscriptionPlanUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionPlansQueryKey });
    },
  });
}

export function useToggleSubscriptionPlanStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation<SubscriptionPlan, Error, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) =>
      container.toggleSubscriptionPlanStatusUseCase.execute(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionPlansQueryKey });
    },
  });
}
