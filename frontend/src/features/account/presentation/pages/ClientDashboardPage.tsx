import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Copy,
  Cpu,
  CreditCard,
  Download,
  KeyRound,
  MessageSquareShare,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { toast } from '@shared/ui/toast/toastStore';
import { useI18n } from '@core/i18n/useLanguageStore';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import {
  getEffectiveKycStatus,
  isUserProfileComplete,
} from '@features/auth/domain/entities/User';
import { useSubscriptionsPolling } from '@features/subscriptions/application/hooks/useSubscriptionsPolling';
import {
  getSubscriptionPlanLabel,
  isSubscriptionAllowedToOperate,
  isSubscriptionExpired,
} from '@features/subscriptions/domain/entities/Subscription';
import { useBotsQuery } from '@features/bots-catalog/application/hooks/useBots';

export const ClientDashboardPage: React.FC = () => {
  const { lang } = useI18n();
  const { user } = useAuthStore();
  const { data: subscriptions = [] } = useSubscriptionsPolling();
  const { data: bots = [] } = useBotsQuery();

  const isProfileVerified = isUserProfileComplete(user);
  const kycStatus = getEffectiveKycStatus(user);

  const mySubscriptions = subscriptions.filter(
    (s) => s.email.toLowerCase() === user.email.toLowerCase()
  );
  const primarySubscription = mySubscriptions[0] ?? null;
  const activeBotsCount = bots.length;

  const handleCopyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(
      lang === 'es' ? 'LicenseKey copiada' : 'LicenseKey copied',
      key
    );
  };

  const quickModules = [
    {
      to: '/my-bots',
      icon: <Download className="h-4 w-4 text-emerald-400" />,
      iconBg: 'bg-emerald-500/15',
      title: lang === 'es' ? 'Mis Bots & Descargas NT8' : 'My Bots & Downloads',
      desc:
        lang === 'es'
          ? 'Detalles técnicos, métricas y descarga .cs para NinjaTrader 8'
          : 'Technical details, metrics and .cs download for NinjaTrader 8',
    },
    {
      to: '/my-subscriptions',
      icon: <KeyRound className="h-4 w-4 text-sky-400" />,
      iconBg: 'bg-sky-500/15',
      title: lang === 'es' ? 'Mis Licencias & HWID' : 'My Licenses & HWID',
      desc:
        lang === 'es'
          ? 'Consulta tu llave y libera tu Machine ID'
          : 'Check your key and reset your Machine ID',
    },
    {
      to: '/billing',
      icon: <CreditCard className="h-4 w-4 text-amber-400" />,
      iconBg: 'bg-amber-500/15',
      title: lang === 'es' ? 'Facturación y Pagos' : 'Billing & Payments',
      desc:
        lang === 'es'
          ? 'Historial de pagos y recibos en PDF'
          : 'Payment history and PDF receipts',
    },
    {
      to: '/profile',
      icon: <UserCheck className="h-4 w-4 text-emerald-400" />,
      iconBg: 'bg-emerald-500/15',
      title: lang === 'es' ? 'Mi Perfil y Documentación' : 'Profile & KYC Docs',
      desc:
        lang === 'es'
          ? 'Datos de contacto y documentos verificados'
          : 'Contact details and verified documents',
    },
    {
      to: '/social',
      icon: <MessageSquareShare className="h-4 w-4 text-sky-400" />,
      iconBg: 'bg-sky-500/15',
      title: lang === 'es' ? 'Comunidad / Muro Social' : 'Social Wall',
      desc:
        lang === 'es'
          ? 'Comparte resultados con otros traders TLA'
          : 'Share results with fellow TLA traders',
    },
  ];

  return (
    <div className="space-y-4 w-full">
      {/* Cabecera Compacta en una sola fila */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-3.5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              {lang === 'es'
                ? `¡Hola, ${user.fullName}!`
                : `Welcome, ${user.fullName}!`}
            </h1>
            <Badge variant="emerald">
              {lang === 'es' ? 'Portal del Cliente' : 'Client Portal'}
            </Badge>
            {isProfileVerified ? (
              <Badge variant="sky">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {lang === 'es' ? 'Cuenta Verificada' : 'Verified'}
              </Badge>
            ) : (
              <Badge variant="amber">
                {lang === 'es' ? 'En Revisión' : 'In Review'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'es'
              ? 'Resumen compacto de tu membresía activa, credencial NinjaTrader 8 y accesos rápidos.'
              : 'Compact overview of your active membership, NinjaTrader 8 credential, and quick links.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link to="/my-bots">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              {lang === 'es' ? 'Descargar Mis Bots' : 'Download My Bots'}
            </Button>
          </Link>
          <Link to="/my-subscriptions">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              {lang === 'es' ? 'Mis Licencias' : 'My Licenses'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Aviso informativo cuando el expediente KYC ya fue enviado y está EN_REVISION */}
      {kycStatus === 'EN_REVISION' && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">
                Expediente KYC en Revisión por el Administrador:
              </strong>{' '}
              Ya recibimos tus datos de contacto y tus 3 documentos. Puedes explorar tu panel mientras un administrador verifica tu cuenta.
            </div>
          </div>
          <Link to="/profile" className="shrink-0">
            <Button variant="secondary" size="sm" className="text-xs">
              Ver Mi Expediente
            </Button>
          </Link>
        </div>
      )}

      {/* Tarjeta Unificada y Compacta de Suscripción, LicenseKey y Hardware */}
      {primarySubscription ? (
        <Card className="p-4 border-slate-800 bg-slate-900/70">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
            {/* 1. Plan y Vigencia */}
            <div className="space-y-1 pr-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{lang === 'es' ? 'Membresía Activa' : 'Active Plan'}</span>
              </div>
              <div className="text-base font-bold text-white">
                {getSubscriptionPlanLabel(primarySubscription).label}
              </div>
              <div className="text-xs text-slate-400">
                {lang === 'es' ? 'Vence:' : 'Expires:'}{' '}
                <strong className="text-slate-200">
                  {new Date(primarySubscription.expiresAt).toLocaleDateString()}
                </strong>{' '}
                • {activeBotsCount} Bots
              </div>
            </div>

            {/* 2. LicenseKey y Botón Copiar (Sin duplicar en otra tarjeta) */}
            <div className="space-y-1 pt-2 sm:pt-0 sm:px-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                  <span>LicenseKey NT8</span>
                </span>
                <Badge
                  variant={
                    isSubscriptionAllowedToOperate(primarySubscription)
                      ? 'emerald'
                      : 'rose'
                  }
                >
                  {isSubscriptionExpired(primarySubscription)
                    ? lang === 'es'
                      ? 'Vencida (Bots OFF)'
                      : 'Expired (Bots OFF)'
                    : primarySubscription.remoteEnabled
                    ? lang === 'es'
                      ? 'Autorizada (ON)'
                      : 'Authorized (ON)'
                    : lang === 'es'
                    ? 'Pausada (OFF)'
                    : 'Paused (OFF)'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <code className="rounded-lg border border-amber-500/30 bg-slate-950 px-2.5 py-1 font-mono text-xs font-bold text-amber-300 truncate">
                  {primarySubscription.licenseKey}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyLicense(primarySubscription.licenseKey)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-200 hover:border-amber-500/40 hover:text-amber-300 cursor-pointer shrink-0"
                  title="Copiar LicenseKey"
                >
                  <Copy className="h-3 w-3" />
                  <span>{lang === 'es' ? 'Copiar' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* 3. Hardware Vinculado (HWID) */}
            <div className="space-y-1 pt-2 xl:pt-0 sm:px-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-sky-400" />
                  <span>Hardware (HWID)</span>
                </span>
                <Link
                  to="/my-subscriptions"
                  className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 underline"
                >
                  {lang === 'es' ? 'Gestionar' : 'Manage'}
                </Link>
              </div>
              <div className="font-mono text-sm font-bold text-white truncate">
                {primarySubscription.boundMachineId ||
                  user.defaultMachineId ||
                  (lang === 'es' ? 'Sin vincular' : 'Unbound')}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'es' ? '1 PC activa por licencia' : '1 active PC per license'}
              </div>
            </div>

            {/* 4. Estrategia y Cuenta Operativa */}
            <div className="space-y-1 pt-2 xl:pt-0 sm:pl-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-amber-400" />
                <span>{lang === 'es' ? 'Terminal NinjaTrader 8' : 'NT8 Terminal'}</span>
              </div>
              <div className="text-sm font-bold text-white truncate">
                {primarySubscription.activeStrategyName}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {lang === 'es' ? 'Cuenta:' : 'Account:'}{' '}
                <span className="font-mono text-sky-300">
                  {primarySubscription.ninjaAccountName}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  {lang === 'es'
                    ? 'Aún no tienes una suscripción activa'
                    : 'You do not have an active subscription yet'}
                </h3>
                <p className="text-xs text-slate-300">
                  {lang === 'es'
                    ? 'Explora el catálogo de bots y elige un plan para obtener tu LicenseKey.'
                    : 'Explore the bots catalog and choose a plan to receive your LicenseKey.'}
                </p>
              </div>
            </div>
            <Link to="/my-bots">
              <Button variant="primary" size="sm" className="shrink-0 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                {lang === 'es'
                  ? 'Ir a Mis Bots y Activar Membresía'
                  : 'Go to My Bots & Activate Plan'}
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Accesos Rápidos Compactos en Filas Horizontales */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          {lang === 'es' ? 'Accesos Rápidos' : 'Quick Access'}
        </h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {quickModules.map((mod) => (
            <Link key={mod.to} to={mod.to} className="group">
              <Card className="p-3.5 border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${mod.iconBg}`}
                  >
                    {mod.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      {mod.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
