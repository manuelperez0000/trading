import type {
  BillingSummary,
  Invoice,
  UserProfileData,
} from '@features/account/domain/entities/Billing';
import type { IAccountRepository } from '@features/account/domain/repositories/AccountRepository';
import type { User } from '@features/auth/domain/entities/User';

export class GetBillingSummaryUseCase {
  constructor(private readonly repository: IAccountRepository) {}
  public async execute(): Promise<BillingSummary> {
    return this.repository.getBillingSummary();
  }
}

export class GetInvoicesUseCase {
  constructor(private readonly repository: IAccountRepository) {}
  public async execute(): Promise<Invoice[]> {
    return this.repository.getInvoices();
  }
}

export class GetUserProfileUseCase {
  constructor(private readonly repository: IAccountRepository) {}
  public async execute(): Promise<User> {
    return this.repository.getUserProfile();
  }
}

export class UpdateUserProfileUseCase {
  constructor(private readonly repository: IAccountRepository) {}
  public async execute(data: Partial<UserProfileData>): Promise<User> {
    return this.repository.updateUserProfile(data);
  }
}

export class DownloadInvoicePdfUseCase {
  constructor(private readonly repository: IAccountRepository) {}
  public async execute(invoiceId: string): Promise<{ downloadUrl: string; filename: string }> {
    return this.repository.downloadInvoicePdf(invoiceId);
  }
}
