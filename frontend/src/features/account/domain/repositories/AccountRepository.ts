import type {
  BillingSummary,
  Invoice,
  UserProfileData,
} from '@features/account/domain/entities/Billing';
import type { User } from '@features/auth/domain/entities/User';

export interface IAccountRepository {
  getBillingSummary(): Promise<BillingSummary>;
  getInvoices(): Promise<Invoice[]>;
  getUserProfile(): Promise<User>;
  updateUserProfile(data: Partial<UserProfileData>): Promise<User>;
  downloadInvoicePdf(invoiceId: string): Promise<{ downloadUrl: string; filename: string }>;
}
