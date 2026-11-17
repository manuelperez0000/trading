import { httpClient } from '@core/http/httpClient';
import type {
  BillingSummary,
  Invoice,
  UserProfileData,
} from '@features/account/domain/entities/Billing';
import type { IAccountRepository } from '@features/account/domain/repositories/AccountRepository';
import type { User } from '@features/auth/domain/entities/User';
import { AccountMapper } from '@features/account/infrastructure/mappers/AccountMapper';
import { AuthMapper } from '@features/auth/infrastructure/mappers/AuthMapper';

export class HttpAccountRepository implements IAccountRepository {
  public async getBillingSummary(): Promise<BillingSummary> {
    const raw = await httpClient.get<unknown>('/account/billing-summary');
    return AccountMapper.summaryToDomain(raw);
  }

  public async getInvoices(): Promise<Invoice[]> {
    const rawList = await httpClient.get<unknown[]>('/account/invoices');
    return rawList.map((item) => AccountMapper.invoiceToDomain(item));
  }

  public async getUserProfile(): Promise<User> {
    const raw = await httpClient.get<unknown>('/account/profile');
    return AuthMapper.userToDomain(raw);
  }

  public async updateUserProfile(data: Partial<UserProfileData>): Promise<User> {
    const raw = await httpClient.patch<unknown>('/account/profile', {
      full_name: data.fullName,
      email: data.email,
      handle: data.handle,
      default_machine_id: data.defaultMachineId,
    });
    return AuthMapper.userToDomain(raw);
  }

  public async downloadInvoicePdf(invoiceId: string): Promise<{ downloadUrl: string; filename: string }> {
    const res = await httpClient.get<{ download_url: string; filename: string }>(
      `/account/invoices/${invoiceId}/download`
    );
    return {
      downloadUrl: res.download_url,
      filename: res.filename,
    };
  }
}
