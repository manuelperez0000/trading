import { z } from 'zod';
import { UserDtoSchema } from '@features/auth/infrastructure/dto/AuthDto';

export const InvoiceDtoSchema = z.object({
  id: z.string(),
  date_iso: z.string(),
  concept: z.string(),
  amount_usd: z.number(),
  method: z.string(),
  status: z.enum(['PAID', 'PENDING', 'FAILED']),
});

export const BillingSummaryDtoSchema = z.object({
  primary_payment_method: z.string(),
  auto_renew: z.boolean(),
  next_billing_date_iso: z.string(),
  estimated_next_amount_usd: z.number(),
  total_billed_2026_usd: z.number(),
  invoices_count: z.number(),
});

export type InvoiceDto = z.infer<typeof InvoiceDtoSchema>;
export type BillingSummaryDto = z.infer<typeof BillingSummaryDtoSchema>;
export { UserDtoSchema };
