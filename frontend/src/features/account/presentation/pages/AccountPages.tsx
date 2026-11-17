import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy,
  Cpu,
  CreditCard,
  Download,
  FileText,
  KeyRound,
  RefreshCcw,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { ConfirmDialog } from '@shared/ui/ConfirmDialog';
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
  const { user: localUser, updateProfile: updateLocalProfile } = useAuthStore();
  const { data: serverProfile } = useUserProfileQuery();
  const updateMutation = useUpdateUserProfileMutation();

  const user = serverProfile ?? localUser;

  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [handle, setHandle] = useState(user.handle);
  const [defaultMachineId, setDefaultMachineId] = useState(
    user.defaultMachineId
  );

  React.useEffect(() => {
    if (serverProfile) {
      setFullName(serverProfile.fullName);
      setEmail(serverProfile.email);
      setHandle(serverProfile.handle);
      setDefaultMachineId(serverProfile.defaultMachineId);
    }
  }, [serverProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { fullName, email, handle, defaultMachineId },
      {
        onSuccess: (updated) => {
          updateLocalProfile({
            fullName: updated.fullName,
            email: updated.email,
            handle: updated.handle,
            defaultMachineId: updated.defaultMachineId,
          });
          toast.success(t.toast.profileSaved);
        },
        onError: () => toast.danger(t.toast.actionError),
      }
    );
  };

  const inputClass =
    'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none';

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {t.account.profileTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t.account.profileSubtitle}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 text-lg font-extrabold text-[#020617]">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{user.fullName}</h2>
                <Badge variant="emerald">{user.role}</Badge>
              </div>
              <p className="text-xs text-slate-400">
                {t.account.memberSince} {user.memberSince} • {user.ninjaVersion}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t.account.fullName}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t.account.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
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

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md">
              <User className="h-4 w-4" />
              {t.account.saveProfile}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
