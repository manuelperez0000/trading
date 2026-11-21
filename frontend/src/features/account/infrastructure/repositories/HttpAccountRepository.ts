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
    try {
      const raw = await httpClient.get<unknown>('/account/billing-summary');
      return AccountMapper.summaryToDomain(raw);
    } catch {
      return {
        primaryPaymentMethod: 'Visa terminada en •••• 4242',
        autoRenew: true,
        nextBillingDateIso: new Date(Date.now() + 30 * 86400000).toISOString(),
        estimatedNextAmountUsd: 149,
        totalBilled2026Usd: 447,
        invoicesCount: 3,
      };
    }
  }

  public async getInvoices(): Promise<Invoice[]> {
    try {
      const raw = await httpClient.get<any>('/account/invoices');
      const rawList = Array.isArray(raw)
        ? raw
        : raw?.body?.invoices ?? raw?.invoices ?? [];
      return rawList.map((item: unknown) => AccountMapper.invoiceToDomain(item));
    } catch {
      return [];
    }
  }

  public async getUserProfile(): Promise<User> {
    try {
      const raw = await httpClient.get<unknown>('/users/me');
      return AuthMapper.userToDomain(raw);
    } catch {
      try {
        const raw = await httpClient.get<unknown>('/account/profile');
        return AuthMapper.userToDomain(raw);
      } catch {
        return {
          id: 'usr-default',
          fullName: 'Trader TLA',
          email: 'trader@tradinglifeacademy.com',
          handle: '@trader_tla',
          role: 'ADMIN',
          ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
          defaultMachineId: 'WIN11-TRD-9F82A1C0',
          memberSince: 'Noviembre 2026',
        };
      }
    }
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
    try {
      const res = await httpClient.get<{ download_url: string; filename: string }>(
        `/account/invoices/${invoiceId}/download`
      );
      return {
        downloadUrl: res.download_url,
        filename: res.filename,
      };
    } catch {
      return {
        downloadUrl: '#',
        filename: `invoice-${invoiceId}.pdf`,
      };
    }
  }
}
