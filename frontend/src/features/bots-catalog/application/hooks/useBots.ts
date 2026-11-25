import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { container } from '@app/di/container';
import type { CreateTradingBotInput } from '@features/bots-catalog/domain/entities/TradingBot';

export const BOTS_QUERY_KEY = ['bots', 'list'] as const;
export const botDetailQueryKey = (id: string) => ['bots', 'detail', id] as const;

export function useBotsQuery() {
  return useQuery({
    queryKey: BOTS_QUERY_KEY,
    queryFn: () => container.getBotsUseCase.execute(),
  });
}

export function useBotDetailQuery(id?: string) {
  return useQuery({
    queryKey: botDetailQueryKey(id || ''),
    queryFn: () => (id ? container.getBotDetailUseCase.execute(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateBotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTradingBotInput) =>
      container.createBotUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOTS_QUERY_KEY });
    },
  });
}

export function useUpdateBotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; input: Partial<CreateTradingBotInput> }) =>
      container.updateBotUseCase.execute(params.id, params.input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOTS_QUERY_KEY });
    },
  });
}

export function useDeleteBotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => container.deleteBotUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOTS_QUERY_KEY });
    },
  });
}

export function useLinkBotToLicenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { botId: string; licenseKey: string }) =>
      container.linkBotToLicenseUseCase.execute(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOTS_QUERY_KEY });
    },
  });
}