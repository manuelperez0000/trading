import type {
  BillingSummary,
  Invoice,
  UserProfileData,
} from '@features/account/domain/entities/Billing';
import type { IAccountRepository } from '@features/account/domain/repositories/AccountRepository';
import type { User } from '@features/auth/domain/entities/User';

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-1104',
    dateIso: '2026-11-15',
    concept: 'Quantum OrderFlow Scalper V4 — Institutional',
    amountUsd: 199.0,
    method: 'Visa •••• 4821',
    status: 'PAID',
  },
  {
    id: 'INV-2026-1004',
    dateIso: '2026-10-15',
    concept: 'Quantum OrderFlow Scalper V4 — Institutional',
    amountUsd: 199.0,
    method: 'Visa •••• 4821',
    status: 'PAID',
  },
  {
    id: 'INV-2026-0912',
    dateIso: '2026-09-15',
    concept: 'Delta Momentum Breakout — Prop Firm Elite',
    amountUsd: 149.0,
    method: 'USDT (TRC-20)',
    status: 'PAID',
  },
];

const INITIAL_PROFILE: User = {
  id: 'usr-001',
  fullName: 'Carlos Figuera',
  email: 'carlos@tradinglifeacademy.com',
  handle: '@carlos_tla',
  role: 'ADMIN',
  ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
  defaultMachineId: 'WIN11-TRD-9F82A1C0',
  memberSince: 'Enero 2026',
};

export class MockAccountRepository implements IAccountRepository {
  private invoices: Invoice[] = structuredClone(INITIAL_INVOICES);
  private profile: User = structuredClone(INITIAL_PROFILE);

  public async getBillingSummary(): Promise<BillingSummary> {
    const totalBilled = this.invoices.reduce((sum, inv) => sum + inv.amountUsd, 0);
    return {
      primaryPaymentMethod: 'Visa •••• 4821',
      autoRenew: true,
      nextBillingDateIso: '2026-12-15',
      estimatedNextAmountUsd: 199,
      totalBilled2026Usd: totalBilled,
      invoicesCount: this.invoices.length,
    };
  }

  public async getInvoices(): Promise<Invoice[]> {
    return structuredClone(this.invoices);
  }

  public async getUserProfile(): Promise<User> {
    return structuredClone(this.profile);
  }

  public async updateUserProfile(data: Partial<UserProfileData>): Promise<User> {
    this.profile = {
      ...this.profile,
      fullName: data.fullName ?? this.profile.fullName,
      email: data.email ?? this.profile.email,
      handle: data.handle ?? this.profile.handle,
      defaultMachineId: data.defaultMachineId ?? this.profile.defaultMachineId,
    };
    return structuredClone(this.profile);
  }

  public async downloadInvoicePdf(invoiceId: string): Promise<{ downloadUrl: string; filename: string }> {
    return {
      downloadUrl: `#mock-download-${invoiceId}`,
      filename: `${invoiceId}.pdf`,
    };
  }
}
