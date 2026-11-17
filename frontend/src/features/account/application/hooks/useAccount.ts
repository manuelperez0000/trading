import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { container } from '@app/di/container';
import type { UserProfileData } from '@features/account/domain/entities/Billing';

export const BILLING_SUMMARY_QUERY_KEY = ['account', 'billing-summary'] as const;
export const INVOICES_QUERY_KEY = ['account', 'invoices'] as const;
export const USER_PROFILE_QUERY_KEY = ['account', 'profile'] as const;

export function useBillingSummaryQuery() {
  return useQuery({
    queryKey: BILLING_SUMMARY_QUERY_KEY,
    queryFn: () => container.getBillingSummaryUseCase.execute(),
  });
}

export function useInvoicesQuery() {
  return useQuery({
    queryKey: INVOICES_QUERY_KEY,
    queryFn: () => container.getInvoicesUseCase.execute(),
  });
}

export function useUserProfileQuery() {
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => container.getUserProfileUseCase.execute(),
  });
}

export function useUpdateUserProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserProfileData>) =>
      container.updateUserProfileUseCase.execute(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, updatedUser);
    },
  });
}

export function useDownloadInvoicePdfMutation() {
  return useMutation({
    mutationFn: (invoiceId: string) =>
      container.downloadInvoicePdfUseCase.execute(invoiceId),
  });
}
