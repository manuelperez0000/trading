export interface Invoice {
  id: string;
  dateIso: string;
  concept: string;
  amountUsd: number;
  method: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
}

export interface BillingSummary {
  primaryPaymentMethod: string;
  autoRenew: boolean;
  nextBillingDateIso: string;
  estimatedNextAmountUsd: number;
  totalBilled2026Usd: number;
  invoicesCount: number;
}

export interface UserProfileData {
  fullName: string;
  email: string;
  handle: string;
  defaultMachineId: string;
  direccion?: string;
  telefono?: string;
  whatsapp?: string;
  urlDocumentoIdentidad?: string;
  urlReciboServicio?: string;
  urlContratoDisclaimer?: string;
  urlComprobanteAceptacion?: string;
}
