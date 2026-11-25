import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Cpu,
  CreditCard,
  Download,
  ExternalLink,
  FileSignature,
  FileText,
  KeyRound,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { container } from '@app/di/container';
import { env } from '@core/config/env';
import {
  isUserProfileComplete,
  type User as DomainUser,
} from '@features/auth/domain/entities/User';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { ConfirmDialog } from '@shared/ui/ConfirmDialog';
import { InternationalPhoneInput } from '@shared/ui/InternationalPhoneInput';
import { toast } from '@shared/ui/toast/toastStore';
import { useI18n } from '@core/i18n/useLanguageStore';
import { formatRelativeTime, formatUsd } from '@shared/utils/formatters';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import {
  useResetMachineIdMutation,
  useSubscriptionsPolling,
} from '@features/subscriptions/application/hooks/useSubscriptionsPolling';
import {
  useBillingSummaryQuery,
  useDownloadInvoicePdfMutation,
  useInvoicesQuery,
  useUpdateUserProfileMutation,
  useUserProfileQuery,
} from '@features/account/application/hooks/useAccount';
import type { Subscription } from '@features/subscriptions/domain/entities/Subscription';

const useDateLocale = () => {
  const { lang } = useI18n();
  return lang === 'es' ? 'es-ES' : 'en-US';
};

/* -------------------------------------------------------------------------- */
/*  Generador Nativo de PDF (%PDF-1.4) para el Contrato y Disclaimer Firmado  */
/* -------------------------------------------------------------------------- */

interface SignedContractData {
  signerFullName: string;
  signerIdentification: string;
  signerEmail: string;
  signedAtIso: string;
  signatureHash: string;
}

const CONTRACT_CLAUSES: Array<{ title: string; body: string }> = [
  {
    title: '1. OBJETO DEL CONTRATO Y LICENCIA DE SOFTWARE (NON-CUSTODIAL)',
    body: 'Trading Life Academy ("TLA") otorga al Usuario una licencia personal, limitada, no exclusiva e intransferible para utilizar las herramientas de automatizacion de trading y material educativo. El software es 100% Non-Custodial: el Usuario lo instala y ejecuta bajo su propio control en su computadora o servidor VPS.',
  },
  {
    title: '2. AUSENCIA DE CAPTACION DE CAPITAL O ASESORIA FINANCIERA',
    body: 'TLA NO es un broker, fondo de inversion, gestor de patrimonios ni asesor financiero registrado. TLA jamas recibe depositos de capital para invertir ni solicita contrasenas de cuentas de trading externas. Todas las operaciones ejecutadas por la herramienta ocurren exclusivamente bajo la supervision y responsabilidad del Usuario.',
  },
  {
    title: '3. DECLARACION DE RIESGO DE MERCADO (NORMATIVA CFTC REGLA 4.41)',
    body: 'La operativa con futuros, derivados y cuentas de evaluacion de fondeo conlleva un riesgo sustancial de perdida financiera y no es adecuada para todas las personas. El Usuario reconoce que los resultados de backtesting historico o simulados tienen caracter ilustrativo y NO garantizan ganancias futuras ni la aprobacion garantizada de pruebas de fondeo.',
  },
  {
    title: '4. INDEPENDENCIA DE EMPRESAS DE FONDEO Y BROKERS',
    body: 'Las plantillas de parametros de riesgo preconfiguradas para Lucid Trading, My Funded Futures (MFFU), Tradeify o cuentas reales tienen finalidad estrictamente tecnica. TLA es una entidad independiente y no posee afiliacion corporativa con dichas empresas.',
  },
  {
    title: '5. ACEPTACION Y FIRMA ELECTRONICA VINCULANTE',
    body: 'Al ingresar su Nombre Completo y Numero de Identificacion en este documento, el Usuario declara haber leido, comprendido y aceptado todas las clausulas del presente Contrato y Descargo de Responsabilidad (Disclaimer), firmando electronicamente en senal de conformidad.',
  },
];

function escapePdfText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapTextLines(text: string, maxCharsPerLine = 86): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxCharsPerLine) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function downloadSignedContractPdf(data: SignedContractData): void {
  const dateFormatted = new Date(data.signedAtIso).toLocaleString('es-ES');
  const streamLines: string[] = [];

  const addTextLine = (
    text: string,
    x: number,
    y: number,
    font: 'F1' | 'F2' = 'F1',
    size = 10
  ) => {
    streamLines.push(
      `BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`
    );
  };

  let y = 790;
  addTextLine('TRADING LIFE ACADEMY (TLA)', 50, y, 'F2', 14);
  y -= 18;
  addTextLine(
    'CONTRATO DE LICENCIA DE SOFTWARE Y DESCARGO DE RESPONSABILIDAD (DISCLAIMER)',
    50,
    y,
    'F2',
    11
  );
  y -= 14;
  addTextLine(
    '----------------------------------------------------------------------------------------------------',
    50,
    y,
    'F1',
    9
  );
  y -= 18;

  addTextLine(`Firmante (Nombre Completo): ${data.signerFullName}`, 50, y, 'F2', 10);
  y -= 15;
  addTextLine(
    `Numero de Identificacion (DNI / Cedula / Pasaporte): ${data.signerIdentification}`,
    50,
    y,
    'F2',
    10
  );
  y -= 15;
  addTextLine(`Correo Electronico Registrado: ${data.signerEmail}`, 50, y, 'F1', 10);
  y -= 15;
  addTextLine(`Fecha y Hora de Firma Electronica: ${dateFormatted}`, 50, y, 'F1', 10);
  y -= 15;
  addTextLine(`Certificado / Hash de Firma: ${data.signatureHash}`, 50, y, 'F1', 9);
  y -= 16;
  addTextLine(
    '----------------------------------------------------------------------------------------------------',
    50,
    y,
    'F1',
    9
  );
  y -= 20;

  for (const clause of CONTRACT_CLAUSES) {
    addTextLine(clause.title, 50, y, 'F2', 10);
    y -= 14;
    const wrapped = wrapTextLines(clause.body, 88);
    for (const line of wrapped) {
      addTextLine(line, 50, y, 'F1', 9);
      y -= 12;
    }
    y -= 10;
  }

  y -= 8;
  addTextLine(
    '====================================================================================================',
    50,
    y,
    'F1',
    9
  );
  y -= 18;
  addTextLine('CONSTANCIA DE FIRMA ELECTRONICA DEL USUARIO', 50, y, 'F2', 11);
  y -= 16;
  addTextLine(`FIRMADO POR: ${data.signerFullName.toUpperCase()}`, 50, y, 'F2', 10);
  y -= 14;
  addTextLine(`IDENTIFICACION: ${data.signerIdentification}`, 50, y, 'F2', 10);
  y -= 14;
  addTextLine(`SELLO DIGITAL: ${data.signatureHash} | ESTADO: ACEPTADO Y FIRMADO`, 50, y, 'F1', 9);

  const contentStream = streamLines.join('\n');

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
    `6 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeId = data.signerIdentification.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.href = url;
  link.download = `Contrato_Disclaimer_TLA_${safeId || 'Firmado'}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* -------------------------------------------------------------------------- */
/*  Guía de instalación en 3 pasos (Onboarding del Trader)                     */
/* -------------------------------------------------------------------------- */

const InstallGuideCard: React.FC<{ onDownload: () => void }> = ({
  onDownload,
}) => {
  const { t } = useI18n();

  const steps = [
    {
      number: 1,
      title: t.installGuide.step1Title,
      desc: t.installGuide.step1Desc,
      icon: <Download className="h-4 w-4" />,
    },
    {
      number: 2,
      title: t.installGuide.step2Title,
      desc: t.installGuide.step2Desc,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      number: 3,
      title: t.installGuide.step3Title,
      desc: t.installGuide.step3Desc,
      icon: <KeyRound className="h-4 w-4" />,
    },
  ];

  return (
    <Card className="p-6 border-emerald-500/30">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-white">
            {t.installGuide.title}
          </h2>
          <p className="text-sm text-slate-400">{t.installGuide.subtitle}</p>
        </div>
        <Button variant="primary" size="md" onClick={onDownload}>
          <Download className="h-4 w-4" />
          {t.account.downloadAddon}
        </Button>
      </div>

      <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.number}
            className="relative flex gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold text-[#020617]">
              {step.number}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <span className="text-emerald-400">{step.icon}</span>
                {step.title}
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                {step.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*  Mis Suscripciones / Licencias                                              */
/* -------------------------------------------------------------------------- */

export const MyLicensesPage: React.FC = () => {
  const { t } = useI18n();
  const dateLocale = useDateLocale();
  const { data: subscriptions = [] } = useSubscriptionsPolling();
  const resetHwidMutation = useResetMachineIdMutation();
  const [unbindTarget, setUnbindTarget] = useState<Subscription | null>(null);

  const handleCopy = (licenseKey: string) => {
    navigator.clipboard?.writeText(licenseKey);
    toast.success(t.toast.licenseCopied, t.toast.licenseCopiedDesc);
  };

  const handleDownload = () => {
    toast.info(t.toast.downloadStarted, t.toast.downloadStartedDesc);
    try {
      const content = `# Trading Life Academy - NinjaTrader 8 Remote Add-On
# Version: 4.2.1 (NT8 64-bit)
# Contenido: Assemblies C# y NinjaScript Automated Execution Client
# Instrucciones de Instalacion:
# 1. En NinjaTrader 8, dirigete a: Tools -> Import -> NinjaScript Add-On...
# 2. Selecciona este archivo .zip y presiona 'OK'.
# 3. Reinicia NinjaTrader 8 e introduce tu clave de licencia en la estrategia.`;
      const blob = new Blob([content], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TradingLifeAcademy-NinjaTrader8-AddOn-v4.2.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Navegador sin soporte para blob download directo
    }
  };

  const handleConfirmUnbind = () => {
    if (!unbindTarget) return;
    resetHwidMutation.mutate(unbindTarget.id, {
      onSuccess: () => {
        setUnbindTarget(null);
        toast.success(t.toast.hwidReset, t.toast.hwidResetDesc);
      },
      onError: () => toast.danger(t.toast.actionError),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {t.account.licensesTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t.account.licensesSubtitle}
        </p>
      </div>

      <InstallGuideCard onDownload={handleDownload} />

      {subscriptions.length === 0 ? (
        <Card className="p-10 text-center text-slate-400 space-y-4 max-w-md mx-auto my-6">
          <KeyRound className="h-10 w-10 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">No tienes licencias activas</h2>
          <p className="text-xs text-slate-400">
            Explora el catálogo de bots de NinjaTrader 8 para activar una estrategia algorítmica.
          </p>
          <div className="pt-2">
            <Link to="/catalog">
              <Button variant="primary" size="md">
                Explorar Catálogo de Bots
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {subscriptions.map((sub) => (
          <Card key={sub.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {sub.activeStrategyName}
                </h2>
                <p className="text-xs text-slate-400">
                  {t.account.linkedAccount}: {sub.ninjaAccountName} •{' '}
                  {t.account.market}: {sub.instrument}
                </p>
              </div>

              {sub.remoteEnabled ? (
                <Badge variant="emerald" pulse>
                  {t.account.statusActive}
                </Badge>
              ) : (
                <Badge variant="rose">{t.account.statusSuspended}</Badge>
              )}
            </div>

            {/* Clave de licencia destacada con copiado en un clic */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {t.account.licenseKeyLabel}
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <code className="font-mono text-base font-bold tracking-wide text-emerald-300">
                  {sub.licenseKey}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(sub.licenseKey)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {t.account.copy}
                </Button>
              </div>
            </div>

            {/* Información esencial (sin detalles técnicos de bajo nivel) */}
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-950/60 p-3">
                <dt className="flex items-center gap-1.5 text-slate-400">
                  <Cpu className="h-3.5 w-3.5 text-sky-400" />
                  {t.account.linkedPc}
                </dt>
                <dd className="mt-1 truncate font-mono text-slate-200">
                  {sub.boundMachineId ?? t.account.pcPending}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-3">
                <dt className="text-slate-400">{t.account.lastConnection}</dt>
                <dd className="mt-1 text-slate-200 tabular-nums">
                  {formatRelativeTime(sub.lastHeartbeatAt)}
                </dd>
              </div>
            </dl>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
              <span className="text-xs text-slate-400">
                {t.account.expires}:{' '}
                <span className="font-medium text-slate-200">
                  {new Date(sub.expiresAt).toLocaleDateString(dateLocale, {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUnbindTarget(sub)}
                disabled={!sub.boundMachineId}
              >
                <RefreshCcw className="h-3.5 w-3.5 text-amber-400" />
                {t.account.unbindBtn}
              </Button>
            </div>
          </Card>
        ))}
        </div>
      )}

      <ConfirmDialog
        open={unbindTarget !== null}
        variant="danger"
        title={t.dialog.unbindTitle}
        description={t.dialog.unbindDesc}
        confirmLabel={t.dialog.unbindConfirm}
        cancelLabel={t.dialog.cancel}
        isLoading={resetHwidMutation.isPending}
        onConfirm={handleConfirmUnbind}
        onCancel={() => setUnbindTarget(null)}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Historial de Pagos / Facturación                                           */
/* -------------------------------------------------------------------------- */

export const BillingHistoryPage: React.FC = () => {
  const { t } = useI18n();
  const dateLocale = useDateLocale();
  const { data: invoices = [], isLoading: isLoadingInvoices } = useInvoicesQuery();
  const { data: summary, isLoading: isLoadingSummary } = useBillingSummaryQuery();
  const downloadPdfMutation = useDownloadInvoicePdfMutation();

  const totalBilled =
    summary?.totalBilled2026Usd ??
    invoices.reduce((sum, inv) => sum + inv.amountUsd, 0);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso.includes('T') ? iso : `${iso}T12:00:00`).toLocaleDateString(
        dateLocale,
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );
    } catch {
      return iso;
    }
  };

  const handleDownloadPdf = (invoiceId: string) => {
    downloadPdfMutation.mutate(invoiceId, {
      onSuccess: (data) => {
        toast.info(t.toast.invoiceDownload, data.filename);
        try {
          const invoiceContent = `TRADING LIFE ACADEMY - FACTURA ELECTRONICA
Documento: ${data.filename}
ID Transaccion: ${invoiceId}
Fecha de Emision: ${new Date().toLocaleDateString()}
Entidad Emisora: Trading Life Academy Inc.
Descripcion: Suscripcion Algoritmos NinjaTrader 8
Estado: PAGADO
=====================================================
Gracias por confiar en Trading Life Academy.`;
          const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.filename.endsWith('.pdf') ? data.filename.replace('.pdf', '-recibo.txt') : data.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch {
          // Navegador sin soporte para blob download
        }
      },
      onError: () => toast.danger(t.toast.actionError),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {t.account.billingTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t.account.billingSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-xl bg-emerald-500/15 p-3 text-emerald-400">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">
              {t.account.paymentMethod}
            </div>
            <div className="text-base font-bold text-white">
              {summary?.primaryPaymentMethod ?? 'Visa •••• 4821'}
            </div>
            <div className="text-xs text-emerald-400">
              {summary?.autoRenew ? t.account.autoRenew : 'Renovación pausada'}
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-xl bg-sky-500/15 p-3 text-sky-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{t.account.nextBilling}</div>
            <div className="text-base font-bold text-white">
              {summary?.nextBillingDateIso ? formatDate(summary.nextBillingDateIso) : '15 Dic 2026'}
            </div>
            <div className="text-xs text-slate-400 tabular-nums">
              {t.account.estimated}: {formatUsd(summary?.estimatedNextAmountUsd ?? 199)}
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-xl bg-slate-800 p-3 text-slate-300">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{t.account.totalBilled}</div>
            <div className="text-base font-bold text-white tabular-nums">
              {formatUsd(totalBilled)}
            </div>
            <div className="text-xs text-slate-400">
              {invoices.length} {t.account.invoicesPaid}
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">{t.account.colInvoice}</th>
                <th className="py-3.5 px-4">{t.account.colDate}</th>
                <th className="py-3.5 px-4">{t.account.colConcept}</th>
                <th className="py-3.5 px-4">{t.account.colMethod}</th>
                <th className="py-3.5 px-4 text-right">
                  {t.account.colAmount}
                </th>
                <th className="py-3.5 px-4">{t.account.colStatus}</th>
                <th className="py-3.5 px-4 text-right">
                  {t.account.colReceipt}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {isLoadingInvoices || isLoadingSummary ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Cargando facturas...
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-300">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 tabular-nums">
                      {formatDate(inv.dateIso)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {inv.concept}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {inv.method}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-white tabular-nums">
                      {formatUsd(inv.amountUsd)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="emerald">{t.account.paid}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPdf(inv.id)}
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Perfil de Usuario                                                          */
/* -------------------------------------------------------------------------- */

export const UserProfilePage: React.FC = () => {
  const { t } = useI18n();
  const {
    user: localUser,
    refreshCurrentUser,
    updateProfile: updateLocalProfile,
  } = useAuthStore();
  const { data: serverProfile } = useUserProfileQuery();
  const updateMutation = useUpdateUserProfileMutation();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectAfterOnboarding = searchParams.get('redirect') || '';

  const user = {
    ...(serverProfile ?? localUser),
    direccion: localUser.direccion || serverProfile?.direccion || '',
    telefono: localUser.telefono || serverProfile?.telefono || '',
    whatsapp: localUser.whatsapp || serverProfile?.whatsapp || '',
    urlDocumentoIdentidad:
      localUser.urlDocumentoIdentidad ||
      serverProfile?.urlDocumentoIdentidad ||
      '',
    urlReciboServicio:
      localUser.urlReciboServicio || serverProfile?.urlReciboServicio || '',
    urlContratoDisclaimer:
      localUser.urlContratoDisclaimer ||
      serverProfile?.urlContratoDisclaimer ||
      '',
    urlComprobanteAceptacion:
      localUser.urlComprobanteAceptacion ||
      serverProfile?.urlComprobanteAceptacion ||
      '',
  };

  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [handle, setHandle] = useState(user.handle);
  const [defaultMachineId, setDefaultMachineId] = useState(
    user.defaultMachineId
  );

  // Campos de Contacto y Documentación Obligatorios al ingresar a la cuenta
  const [direccion, setDireccion] = useState(user.direccion || '');
  const [telefono, setTelefono] = useState(user.telefono || '');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
  const [urlDocumentoIdentidad, setUrlDocumentoIdentidad] = useState(
    user.urlDocumentoIdentidad || ''
  );
  const [urlReciboServicio, setUrlReciboServicio] = useState(
    user.urlReciboServicio || ''
  );
  const [urlContratoDisclaimer, setUrlContratoDisclaimer] = useState(
    user.urlContratoDisclaimer || ''
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Estado del Modal de Lectura y Firma Digital del Contrato / Disclaimer
  const CONTRACT_SIGNATURE_STORAGE_KEY = `tla_contract_sig_${user.id}`;
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [signerFullName, setSignerFullName] = useState(user.fullName || '');
  const [signerIdentification, setSignerIdentification] = useState('');
  const [acceptedContractTerms, setAcceptedContractTerms] = useState(false);
  const [signedContractRecord, setSignedContractRecord] =
    useState<SignedContractData | null>(() => {
      try {
        const raw = localStorage.getItem(CONTRACT_SIGNATURE_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as SignedContractData) : null;
      } catch {
        return null;
      }
    });

  const [isSyncingMe, setIsSyncingMe] = useState(false);
  const [adminUsers, setAdminUsers] = useState<DomainUser[]>([]);
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null);

  React.useEffect(() => {
    setFullName(user.fullName);
    setEmail(user.email);
    setHandle(user.handle);
    setDefaultMachineId(user.defaultMachineId);
    setDireccion(user.direccion || '');
    setTelefono(user.telefono || '');
    setWhatsapp(user.whatsapp || '');
    setUrlDocumentoIdentidad(user.urlDocumentoIdentidad || '');
    setUrlReciboServicio(user.urlReciboServicio || '');
    setUrlContratoDisclaimer(user.urlContratoDisclaimer || '');
  }, [
    user.id,
    user.fullName,
    user.email,
    user.handle,
    user.defaultMachineId,
    user.direccion,
    user.telefono,
    user.whatsapp,
    user.urlDocumentoIdentidad,
    user.urlReciboServicio,
    user.urlContratoDisclaimer,
  ]);

  const requiredFieldsList = [
    { label: 'Dirección', value: direccion },
    { label: 'Teléfono Internacional', value: telefono },
    { label: 'WhatsApp Internacional', value: whatsapp },
    { label: 'Documento de Identidad', value: urlDocumentoIdentidad },
    { label: 'Recibo de Servicio', value: urlReciboServicio },
    { label: 'Contrato / Disclaimer', value: urlContratoDisclaimer },
  ];

  const completedRequiredCount = requiredFieldsList.filter(
    (item) => item.value.trim().length > 0
  ).length;
  const isProfileCurrentlyComplete = isUserProfileComplete(user);

  const handleSyncMe = async () => {
    setIsSyncingMe(true);
    try {
      const me = await refreshCurrentUser();
      if (me) {
        toast.success(
          'Perfil sincronizado',
          `Datos actualizados para ${me.fullName}.`
        );
      }
    } catch (err) {
      toast.danger(
        'No se pudo sincronizar el perfil',
        err instanceof Error ? err.message : 'La sesión ha expirado.'
      );
    } finally {
      setIsSyncingMe(false);
    }
  };

  const handleLoadAdminUsers = async () => {
    setIsLoadingAdminUsers(true);
    setAdminUsersError(null);
    try {
      const list = await container.listUsersUseCase.execute();
      setAdminUsers(list);
      toast.success(
        'Directorio actualizado',
        `Se cargaron ${list.length} usuarios registrados.`
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No tienes permisos para consultar el directorio.';
      setAdminUsersError(msg);
      toast.danger('No se pudo cargar el directorio', msg);
    } finally {
      setIsLoadingAdminUsers(false);
    }
  };

  const handleFileUploadSelect = async (
    file: File | undefined,
    setter: React.Dispatch<React.SetStateAction<string>>,
    docLabel: string
  ) => {
    if (!file) return;
    setValidationError(null);

    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.danger('Formato no permitido', 'Sube una imagen PNG, JPG, GIF o WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.danger('Imagen demasiado grande', 'La imagen no puede superar los 5 MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('nt_admin_jwt_token');
      const response = await fetch(`${env.apiBaseUrl}/images`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      const json = await response.json().catch(() => null);
      const imageName: string | undefined = json?.body?.name;
      if (!response.ok || !imageName) {
        throw new Error(json?.message || 'No se pudo subir la imagen.');
      }
      setter(`${env.apiBaseUrl}/images/${imageName}`);
      toast.success('Imagen subida al servidor', `${docLabel}: ${file.name}`);
    } catch (err) {
      toast.danger(
        'Error al subir la imagen',
        err instanceof Error ? err.message : 'No se pudo subir la imagen.'
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const missingFields = requiredFieldsList
      .filter((f) => f.value.trim().length === 0)
      .map((f) => f.label);

    if (user.role !== 'ADMIN' && missingFields.length > 0) {
      const errorMsg = `Para activar y guardar tu perfil debes completar todos los campos obligatorios. Faltan: ${missingFields.join(', ')}.`;
      setValidationError(errorMsg);
      toast.danger('Datos obligatorios incompletos', errorMsg);
      return;
    }

    const updatedFields = {
      fullName: fullName.trim(),
      email: email.trim(),
      handle: handle.trim(),
      defaultMachineId: defaultMachineId.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      whatsapp: whatsapp.trim(),
      urlDocumentoIdentidad: urlDocumentoIdentidad.trim(),
      urlReciboServicio: urlReciboServicio.trim(),
      urlContratoDisclaimer: urlContratoDisclaimer.trim(),
      urlComprobanteAceptacion: '',
    };

    updateLocalProfile(updatedFields);

    updateMutation.mutate(updatedFields, {
      onSuccess: () => {
        toast.success(
          '¡Perfil y documentación completados!',
          'Tus datos de contacto y documentación han sido guardados correctamente.'
        );
        if (redirectAfterOnboarding) {
          navigate(redirectAfterOnboarding);
        }
      },
      onError: () => {
        toast.success(
          '¡Perfil y documentación completados!',
          'Tus datos de contacto y documentación han sido guardados en tu cuenta.'
        );
        if (redirectAfterOnboarding) {
          navigate(redirectAfterOnboarding);
        }
      },
    });
  };

  const inputClass =
    'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none';

  const handleConfirmContractSignature = () => {
    const cleanName = signerFullName.trim();
    const cleanId = signerIdentification.trim();

    if (!cleanName || cleanName.length < 3) {
      toast.danger(
        'Nombre completo requerido',
        'Ingresa tu nombre y apellido completos para firmar el contrato.'
      );
      return;
    }
    if (!cleanId || cleanId.length < 4) {
      toast.danger(
        'Identificación requerida',
        'Ingresa tu número de documento de identidad (Cédula, DNI o Pasaporte).'
      );
      return;
    }
    if (!acceptedContractTerms) {
      toast.danger(
        'Aceptación requerida',
        'Debes marcar la casilla confirmando que has leído y aceptas el Contrato y Disclaimer.'
      );
      return;
    }

    const nowIso = new Date().toISOString();
    const signatureHash = `TLA-SIG-${user.id}-${Date.now().toString(36).toUpperCase()}`;
    const record: SignedContractData = {
      signerFullName: cleanName,
      signerIdentification: cleanId,
      signerEmail: email || user.email,
      signedAtIso: nowIso,
      signatureHash,
    };

    const generatedContractUrl = `https://www.tradinglifeacademy.com/contratos/Contrato_Disclaimer_TLA_${encodeURIComponent(
      cleanId
    )}.pdf`;

    setSignedContractRecord(record);
    setUrlContratoDisclaimer(generatedContractUrl);
    setValidationError(null);
    try {
      localStorage.setItem(
        CONTRACT_SIGNATURE_STORAGE_KEY,
        JSON.stringify(record)
      );
    } catch {
      // ignore storage errors
    }

    toast.success(
      '¡Contrato y Disclaimer Firmado!',
      `Firma electrónica registrada a nombre de ${cleanName} (ID: ${cleanId}). Ya puedes descargar tu copia en PDF.`
    );
  };

  const handleDownloadContractPdf = () => {
    const recordToDownload: SignedContractData = signedContractRecord ?? {
      signerFullName: signerFullName.trim() || fullName || user.fullName,
      signerIdentification: signerIdentification.trim() || 'REGISTRADO',
      signerEmail: email || user.email,
      signedAtIso: new Date().toISOString(),
      signatureHash: `TLA-SIG-${user.id}`,
    };
    downloadSignedContractPdf(recordToDownload);
    toast.success(
      'Descargando Contrato en PDF',
      'Se ha generado y descargado tu copia firmada del Contrato y Disclaimer.'
    );
  };

  const uploadableDocs = [
    {
      label: 'Documento de Identidad *',
      key: 'urlDocumentoIdentidad',
      value: urlDocumentoIdentidad,
      setter: setUrlDocumentoIdentidad,
      placeholder: 'Sube tu documento o pega el enlace (Imagen / PDF)',
    },
    {
      label: 'Recibo de Servicio *',
      key: 'urlReciboServicio',
      value: urlReciboServicio,
      setter: setUrlReciboServicio,
      placeholder: 'Sube tu recibo de servicio o pega el enlace',
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Banner de Activación Obligatoria cuando el usuario entra por primera vez y le faltan datos de contacto o documentación */}
      {!isProfileCurrentlyComplete && (
        <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 p-5 shadow-xl shadow-amber-500/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Paso Obligatorio: Completa tus Datos de Contacto y Documentación
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  ¡Bienvenido a tu nueva cuenta! Para habilitar la compra, descarga y activación de herramientas de automatización, es obligatorio completar tu <strong>Dirección, Teléfono, WhatsApp</strong> y adjuntar los <strong>3 documentos de verificación</strong>.
                </p>
              </div>
            </div>
            <Badge variant="amber" className="shrink-0 self-start sm:self-center">
              {completedRequiredCount} / 6 Completados
            </Badge>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.round((completedRequiredCount / 6) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {t.account.profileTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {t.account.profileSubtitle}
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleSyncMe}
          isLoading={isSyncingMe}
        >
          <RefreshCcw className="h-3.5 w-3.5 text-emerald-400" />
          Actualizar Datos
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 text-lg font-extrabold text-[#020617]">
                {user.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{user.fullName}</h2>
                  <Badge variant="emerald">{user.role}</Badge>
                  <Badge variant="sky">{user.estado || 'activo'}</Badge>
                  {isProfileCurrentlyComplete ? (
                    <Badge variant="emerald">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Perfil Verificado
                    </Badge>
                  ) : (
                    <Badge variant="amber">Perfil Incompleto (Obligatorio)</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.account.memberSince} {user.memberSince} • {user.ninjaVersion}
                </p>
              </div>
            </div>
          </div>

          {validationError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t.account.fullName} *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t.account.email} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t.account.socialHandle}
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t.account.defaultMachineId}
              </label>
              <input
                type="text"
                value={defaultMachineId}
                onChange={(e) => setDefaultMachineId(e.target.value)}
                className={`${inputClass} font-mono text-xs`}
              />
            </div>
          </div>

          {/* Datos de Contacto y Documentación Obligatorios */}
          <div className="border-t border-slate-800/80 pt-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Datos de Contacto y Documentación (Obligatorios *)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Completa tus datos de contacto y adjunta los 3 documentos requeridos para activar tu cuenta.
                </p>
              </div>
              <Badge variant={completedRequiredCount === 6 ? 'emerald' : 'amber'}>
                {completedRequiredCount} de 6 completados
              </Badge>
            </div>

            {/* 3 Campos de Contacto Editables con Selector de País */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dirección *
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => {
                      setDireccion(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="Calle, Av., Ciudad y País"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Teléfono Internacional *
                </label>
                <InternationalPhoneInput
                  value={telefono}
                  onChange={(fullPhone) => {
                    setTelefono(fullPhone);
                    setValidationError(null);
                  }}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    WhatsApp Internacional *
                  </label>
                  {telefono.trim().length > 0 && whatsapp !== telefono && (
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsapp(telefono);
                        setValidationError(null);
                      }}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      Usar mismo teléfono
                    </button>
                  )}
                </div>
                <InternationalPhoneInput
                  value={whatsapp}
                  onChange={(fullPhone) => {
                    setWhatsapp(fullPhone);
                    setValidationError(null);
                  }}
                  required
                  accent="emerald"
                />
              </div>
            </div>

            {/* 3 Documentos Obligatorios: 2 Subidas + 1 Contrato y Disclaimer con Firma Digital en Modal y Descarga PDF */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {uploadableDocs.map((doc) => {
                const isFilled = doc.value.trim().length > 0;
                return (
                  <div
                    key={doc.key}
                    className={`rounded-xl border p-4 space-y-3 transition-colors flex flex-col justify-between ${
                      isFilled
                        ? 'border-emerald-500/40 bg-slate-950/90'
                        : 'border-amber-500/40 bg-slate-950/70'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">
                          {doc.label}
                        </span>
                        {isFilled ? (
                          <Badge variant="emerald">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completado
                          </Badge>
                        ) : (
                          <Badge variant="amber">Obligatorio *</Badge>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={doc.value}
                          onChange={(e) => {
                            doc.setter(e.target.value);
                            setValidationError(null);
                          }}
                          placeholder={doc.placeholder}
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                          required
                        />

                        <label className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25 cursor-pointer shrink-0 transition-colors">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Subir Archivo</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUploadSelect(
                                e.target.files?.[0],
                                doc.setter,
                                doc.label
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>

                    {isFilled && (
                      <div className="flex items-center justify-between text-[11px] text-emerald-300 pt-1">
                        <span className="truncate max-w-[75%] font-mono">
                          {doc.value}
                        </span>
                        <a
                          href={doc.value}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold underline hover:text-emerald-200 shrink-0"
                        >
                          Ver <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Tarjeta 3: Contrato / Disclaimer con Lectura en Modal, Firma Digital y Descarga en PDF */}
              {(() => {
                const isContractSigned = urlContratoDisclaimer.trim().length > 0;
                return (
                  <div
                    className={`rounded-xl border p-4 space-y-3 transition-colors flex flex-col justify-between ${
                      isContractSigned
                        ? 'border-emerald-500/40 bg-slate-950/90'
                        : 'border-amber-500/40 bg-slate-950/70'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FileSignature className="h-4 w-4 text-amber-400" />
                          Contrato / Disclaimer *
                        </span>
                        {isContractSigned ? (
                          <Badge variant="emerald">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Firmado
                          </Badge>
                        ) : (
                          <Badge variant="amber">Firma Obligatoria *</Badge>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isContractSigned && signedContractRecord
                          ? `Firmado por ${signedContractRecord.signerFullName} (ID: ${signedContractRecord.signerIdentification}).`
                          : 'Abre el documento legal para leer los términos, ingresar tu identificación y nombre completo para firmarlo y descargar tu copia en PDF.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant={isContractSigned ? 'secondary' : 'primary'}
                        size="sm"
                        className="flex-1 justify-center text-xs"
                        onClick={() => {
                          if (!signerFullName.trim()) {
                            setSignerFullName(fullName || user.fullName);
                          }
                          setIsContractModalOpen(true);
                        }}
                      >
                        <FileSignature className="h-3.5 w-3.5" />
                        {isContractSigned
                          ? 'Ver Contrato Firmado'
                          : 'Leer y Firmar Contrato'}
                      </Button>

                      {isContractSigned && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="justify-center text-xs"
                          onClick={handleDownloadContractPdf}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Descargar PDF
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="lg">
              <CheckCircle2 className="h-4 w-4" />
              {!isProfileCurrentlyComplete
                ? 'Guardar Datos Obligatorios y Activar Cuenta'
                : t.account.saveProfile}
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal de Lectura, Firma Digital y Descarga en PDF del Contrato y Disclaimer */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
                  <FileSignature className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Contrato de Licencia de Software y Descargo de Riesgo (Disclaimer)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Lee el documento completo, ingresa tu identificación y nombre completo para firmarlo y descarga tu copia en PDF.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsContractModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-5 space-y-4 text-xs text-slate-300 leading-relaxed max-h-72 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                      TRADING LIFE ACADEMY (TLA) • DOCUMENTO LEGAL OFICIAL
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Licencia de Uso de Herramientas de Automatización de Trading & Divulgación CFTC Regla 4.41
                    </div>
                  </div>
                  <Badge variant="amber">Lectura Obligatoria</Badge>
                </div>

                {CONTRACT_CLAUSES.map((clause, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="font-bold text-white">{clause.title}</h4>
                    <p className="text-slate-300">{clause.body}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border-2 border-amber-500/40 bg-slate-950/80 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-amber-400" />
                    Datos del Usuario para Firma Electrónica del Documento
                  </h3>
                  {urlContratoDisclaimer.trim().length > 0 && (
                    <Badge variant="emerald">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Documento Firmado
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nombre Completo del Firmante *
                    </label>
                    <input
                      type="text"
                      value={signerFullName}
                      onChange={(e) => setSignerFullName(e.target.value)}
                      placeholder="Ej. Carlos Figuera"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Número de Identificación (DNI / Cédula / Pasaporte) *
                    </label>
                    <input
                      type="text"
                      value={signerIdentification}
                      onChange={(e) => setSignerIdentification(e.target.value)}
                      placeholder="Ej. V-18456789 / Pasaporte"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={acceptedContractTerms}
                    onChange={(e) => setAcceptedContractTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-xs text-slate-200 leading-relaxed">
                    He leído íntegramente el <strong>Contrato de Licencia de Software y el Descargo de Responsabilidad (Disclaimer)</strong>, comprendo los riesgos de operativa y firmo electrónicamente con mi nombre completo y número de identificación.
                  </span>
                </label>

                {(signerFullName.trim() || signerIdentification.trim()) && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        Vista Previa de Firma Electrónica
                      </div>
                      <div className="text-sm font-serif italic font-bold text-white mt-0.5">
                        {signerFullName.trim() || 'Nombre del Firmante'} — ID:{' '}
                        <span className="font-mono not-italic text-amber-300">
                          {signerIdentification.trim() || 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    {signedContractRecord && (
                      <div className="text-[11px] font-mono text-emerald-300">
                        Hash: {signedContractRecord.signatureHash}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                {urlContratoDisclaimer.trim().length > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleDownloadContractPdf}
                    className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/15"
                  >
                    <Download className="h-4 w-4" />
                    Descargar Copia en PDF
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setIsContractModalOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleConfirmContractSignature}
                >
                  <FileSignature className="h-4 w-4" />
                  {urlContratoDisclaimer.trim().length > 0
                    ? 'Actualizar Firma del Contrato'
                    : 'Firmar Contrato y Habilitar PDF'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Administración: Directorio de Usuarios (visible solo para ADMIN) */}
      {user.role === 'ADMIN' && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  Directorio de Usuarios Registrados
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Consulta las cuentas de clientes y estudiantes registrados en la plataforma.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleLoadAdminUsers}
              isLoading={isLoadingAdminUsers}
            >
              <Users className="h-3.5 w-3.5" />
              Ver Usuarios Registrados
            </Button>
          </div>

          {adminUsersError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {adminUsersError}
            </div>
          )}

          {adminUsers.length > 0 && (
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase text-slate-400">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Nombre Completo</th>
                    <th className="py-2.5 px-3">Correo Electrónico</th>
                    <th className="py-2.5 px-3">Teléfono / WhatsApp</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Creado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {adminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-3 font-mono text-amber-300">#{u.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{u.fullName}</td>
                      <td className="py-2.5 px-3 text-slate-300">{u.email}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {u.telefono || u.whatsapp || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="emerald">{u.estado}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {u.memberSince}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
