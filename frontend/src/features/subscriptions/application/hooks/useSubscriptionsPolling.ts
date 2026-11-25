import { create } from 'zustand';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { env } from '@core/config/env';
import { container } from '@app/di/container';
import type { Subscription } from '@features/subscriptions/domain/entities/Subscription';
import type { SimulateHeartbeatInput } from '@features/subscriptions/application/use-cases/subscriptionUseCases';

interface PollingControlState {
  panelPollIntervalMs: number;
  autoSimulateNinjaPolls: boolean;
  ninjaPollCycleCount: number;
  lastGlobalPollAt: string | null;
  setPanelPollIntervalMs: (ms: number) => void;
  setAutoSimulateNinjaPolls: (enabled: boolean) => void;
  incrementCycle: () => void;
}

export const usePollingControlStore = create<PollingControlState>((set) => ({
  panelPollIntervalMs: env.panelPollIntervalMs,
  autoSimulateNinjaPolls: true,
  ninjaPollCycleCount: 1,
  lastGlobalPollAt: new Date().toISOString(),
  setPanelPollIntervalMs: (ms) => set({ panelPollIntervalMs: ms }),
  setAutoSimulateNinjaPolls: (enabled) =>
    set({ autoSimulateNinjaPolls: enabled }),
  incrementCycle: () =>
    set((state) => ({
      ninjaPollCycleCount: state.ninjaPollCycleCount + 1,
      lastGlobalPollAt: new Date().toISOString(),
    })),
}));

export const SUBSCRIPTIONS_QUERY_KEY = ['subscriptions', 'list'] as const;
export const AUDIT_LOGS_QUERY_KEY = ['subscriptions', 'audit-logs'] as const;

export function useSubscriptionsPolling() {
  const { panelPollIntervalMs } = usePollingControlStore();

  return useQuery({
    queryKey: SUBSCRIPTIONS_QUERY_KEY,
    queryFn: () => container.subscriptionRepository.getAllSubscriptions(),
    refetchInterval: panelPollIntervalMs,
  });
}

export function useAuditLogsPolling() {
  const { panelPollIntervalMs } = usePollingControlStore();

  return useQuery({
    queryKey: AUDIT_LOGS_QUERY_KEY,
    queryFn: () => container.subscriptionRepository.getAuditLogs(),
    refetchInterval: panelPollIntervalMs,
  });
}

export function useToggleRemoteSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      subscriptionId: string;
      enabled: boolean;
      reason?: string;
    }) => container.toggleRemoteSubscriptionUseCase.execute(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
    },
  });
}

export function useGlobalKillSwitchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { enabled: boolean; reason: string }) =>
      container.globalKillSwitchUseCase.execute(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
    },
  });
}

export function useResetMachineIdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) =>
      container.resetMachineIdUseCase.execute(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
    },
  });
}

export function useSimulateNinjaHeartbeatMutation() {
  const queryClient = useQueryClient();
  const { incrementCycle } = usePollingControlStore();

  return useMutation({
    mutationFn: (input: SimulateHeartbeatInput) =>
      container.simulateNinjaHeartbeatUseCase.execute(input),
    onSuccess: () => {
      incrementCycle();
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
    },
  });
}

export function useCreateSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Subscription>) =>
      container.subscriptionRepository.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
    },
  });
}

export function useUpdateSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; updates: Partial<Subscription> }) =>
      container.subscriptionRepository.updateSubscription(params.id, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
    },
  });
}

export function useDeleteSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      container.subscriptionRepository.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
    },
  });
}
