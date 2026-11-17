import type {
  BillingSummary,
  Invoice,
} from '@features/account/domain/entities/Billing';
import {
  BillingSummaryDtoSchema,
  InvoiceDtoSchema,
  type BillingSummaryDto,
  type InvoiceDto,
} from '@features/account/infrastructure/dto/AccountDto';

export class AccountMapper {
  public static invoiceToDomain(raw: unknown): Invoice {
    const dto = InvoiceDtoSchema.parse(raw);
    return {
      id: dto.id,
      dateIso: dto.date_iso,
      concept: dto.concept,
      amountUsd: dto.amount_usd,
      method: dto.method,
      status: dto.status,
    };
  }

  public static invoiceToDto(entity: Invoice): InvoiceDto {
    return {
      id: entity.id,
      date_iso: entity.dateIso,
      concept: entity.concept,
      amount_usd: entity.amountUsd,
      method: entity.method,
      status: entity.status,
    };
  }

  public static summaryToDomain(raw: unknown): BillingSummary {
    const dto = BillingSummaryDtoSchema.parse(raw);
    return {
      primaryPaymentMethod: dto.primary_payment_method,
      autoRenew: dto.auto_renew,
      nextBillingDateIso: dto.next_billing_date_iso,
      estimatedNextAmountUsd: dto.estimated_next_amount_usd,
      totalBilled2026Usd: dto.total_billed_2026_usd,
      invoicesCount: dto.invoices_count,
    };
  }

  public static summaryToDto(entity: BillingSummary): BillingSummaryDto {
    return {
      primary_payment_method: entity.primaryPaymentMethod,
      auto_renew: entity.autoRenew,
      next_billing_date_iso: entity.nextBillingDateIso,
      estimated_next_amount_usd: entity.estimatedNextAmountUsd,
      total_billed_2026_usd: entity.totalBilled2026Usd,
      invoices_count: entity.invoicesCount,
    };
  }
}
