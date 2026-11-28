import { useQuery } from '@tanstack/react-query';
import { container } from '@app/di/container';
import type { User } from '@features/auth/domain/entities/User';

export const AUTH_USERS_QUERY_KEY = ['auth', 'users'] as const;

export function useListUsersQuery(enabled = true) {
  return useQuery<User[]>({
    queryKey: AUTH_USERS_QUERY_KEY,
    queryFn: () => container.listUsersUseCase.execute(),
    enabled,
    staleTime: 30_000,
  });
}
