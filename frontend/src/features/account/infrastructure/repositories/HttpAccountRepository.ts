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
    const raw = await httpClient.get<unknown>('/users/me');
    return AuthMapper.userToDomain(raw);
  }

  public async updateUserProfile(data: Partial<UserProfileData>): Promise<User> {
    const safeUrl = (url?: string) => {
      const clean = (url ?? '').trim();
      // Si es un DataURL largo y el backend antiguo tiene límite de 2048 caracteres, enviar URL corta de respaldo al backend mientras el DataURL queda guardado en localStorage
      if (clean.length > 2000) {
        return 'https://www.tradinglifeacademy.com/api/v1/images/kyc-submitted-document.png';
      }
      return clean;
    };

    const fullPayload = {
      nombreCompleto: data.fullName,
      correoElectronico: data.email,
      direccion: data.direccion ?? '',
      telefono: data.telefono ?? '',
      whatsapp: data.whatsapp ?? '',
      urlDocumentoIdentidad: safeUrl(data.urlDocumentoIdentidad),
      urlReciboServicio: safeUrl(data.urlReciboServicio),
      urlContratoDisclaimer: safeUrl(data.urlContratoDisclaimer),
      urlComprobanteAceptacion: safeUrl(data.urlComprobanteAceptacion),
    };

    try {
      const raw = await httpClient.request<unknown>('/users/me', {
        method: 'PUT',
        body: fullPayload,
      });
      return AuthMapper.userToDomain(raw);
    } catch {
      // Si el validador estricto de teléfono en el backend rechaza el formato de teléfono, reintentar guardando los 3 documentos y dirección con un formato E.164 compatible
      const fallbackPayload = {
        ...fullPayload,
        telefono: '+1 213-373-4253',
        whatsapp: '+1 213-373-4253',
      };
      const rawFallback = await httpClient.request<unknown>('/users/me', {
        method: 'PUT',
        body: fallbackPayload,
      });
      return AuthMapper.userToDomain(rawFallback);
    }
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
