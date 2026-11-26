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
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { StatCard } from '@shared/ui/StatCard';
import { toast } from '@shared/ui/toast/toastStore';
import { useI18n } from '@core/i18n/useLanguageStore';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import { isUserProfileComplete } from '@features/auth/domain/entities/User';
import { useSubscriptionsPolling } from '@features/subscriptions/application/hooks/useSubscriptionsPolling';
import { getSubscriptionPlanLabel } from '@features/subscriptions/domain/entities/Subscription';
import { useBotsQuery } from '@features/bots-catalog/application/hooks/useBots';

export const ClientDashboardPage: React.FC = () => {
  const { lang } = useI18n();
  const { user } = useAuthStore();
  const { data: subscriptions = [] } = useSubscriptionsPolling();
  const { data: bots = [] } = useBotsQuery();

  const isProfileVerified = isUserProfileComplete(user);

  // Buscar suscripción asociada al correo del cliente o la primera disponible en su sesión
  const mySubscriptions = subscriptions.filter(
    (s) => s.email.toLowerCase() === user.email.toLowerCase()
  );
  const primarySubscription = mySubscriptions[0] ?? subscriptions[0] ?? null;

  const activeBotsCount = bots.length;

  const handleCopyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(
      lang === 'es' ? 'LicenseKey copiada' : 'LicenseKey copied',
      key
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Cabecera de Bienvenida del Portal de Clientes */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-sky-500/10 p-6 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald">
                {lang === 'es' ? 'PORTAL DEL CLIENTE' : 'CLIENT PORTAL'}
              </Badge>
              {isProfileVerified ? (
                <Badge variant="sky">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {lang === 'es' ? 'Cuenta Verificada' : 'Verified Account'}
                </Badge>
              ) : (
                <Badge variant="amber">
                  {lang === 'es' ? 'Verificación Pendiente' : 'Verification Pending'}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {lang === 'es'
                ? `¡Hola, ${user.fullName}!`
                : `Welcome back, ${user.fullName}!`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {lang === 'es'
                ? 'Desde tu panel de cliente puedes gestionar tus licencias de NinjaTrader 8, descargar tus bots automatizados, vincular tu Machine ID y consultar tu facturación.'
                : 'From your client dashboard you can manage your NinjaTrader 8 licenses, download your automated bots, bind your Machine ID, and check your billing history.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/my-bots">
              <Button variant="primary" size="md" className="gap-2">
                <Download className="h-4 w-4" />
                {lang === 'es' ? 'Descargar Mis Bots' : 'Download My Bots'}
              </Button>
            </Link>
            <Link to="/my-subscriptions">
              <Button variant="secondary" size="md" className="gap-2">
                <KeyRound className="h-4 w-4 text-amber-400" />
                {lang === 'es' ? 'Mis Licencias' : 'My Licenses'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen del Cliente (KPIs) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={lang === 'es' ? 'Estado de Membresía' : 'Membership Status'}
          value={
            primarySubscription
              ? getSubscriptionPlanLabel(primarySubscription).label
              : lang === 'es'
              ? 'Sin Plan Activo'
              : 'No Active Plan'
          }
          subtitle={
            primarySubscription
              ? lang === 'es'
                ? `Vence: ${new Date(primarySubscription.expiresAt).toLocaleDateString()}`
                : `Expires: ${new Date(primarySubscription.expiresAt).toLocaleDateString()}`
              : lang === 'es'
              ? 'Explora el catálogo para activar'
              : 'Explore catalog to activate'
          }
          accent={primarySubscription?.remoteEnabled ? 'emerald' : 'amber'}
          icon={<Sparkles className="h-5 w-5" />}
        />

        <StatCard
          title={lang === 'es' ? 'Licencia NinjaTrader 8' : 'NinjaTrader 8 License'}
          value={
            primarySubscription
              ? primarySubscription.remoteEnabled
                ? lang === 'es'
                  ? 'Autorizada (ON)'
                  : 'Authorized (ON)'
                : lang === 'es'
                ? 'Pausada (OFF)'
                : 'Paused (OFF)'
              : '—'
          }
          subtitle={
            primarySubscription
              ? primarySubscription.licenseKey
              : lang === 'es'
              ? 'Sin licencia asignada'
              : 'No license assigned'
          }
          accent={primarySubscription?.remoteEnabled ? 'emerald' : 'rose'}
          icon={<KeyRound className="h-5 w-5" />}
        />

        <StatCard
          title={lang === 'es' ? 'Hardware Vinculado (HWID)' : 'Bound Hardware (HWID)'}
          value={
            primarySubscription?.boundMachineId ||
            user.defaultMachineId ||
            (lang === 'es' ? 'Pendiente' : 'Unbound')
          }
          subtitle={
            lang === 'es'
              ? 'Protección 1 PC activa por licencia'
              : '1 active PC protection per license'
          }
          accent="sky"
          icon={<Cpu className="h-5 w-5" />}
        />

        <StatCard
          title={lang === 'es' ? 'Bots en tu Catálogo' : 'Bots in Catalog'}
          value={`${activeBotsCount} Bots`}
          subtitle={
            lang === 'es'
              ? 'Acceso completo incluido en tu plan'
              : 'Full access included in your plan'
          }
          accent="amber"
          icon={<Bot className="h-5 w-5" />}
        />
      </div>

      {/* Detalle Rápido de Licencia Activa */}
      {primarySubscription ? (
        <Card className="p-5 border-slate-800 bg-slate-900/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {lang === 'es' ? 'Tu Credencial de Activación NT8' : 'Your NT8 Activation Credential'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <code className="rounded-xl border border-amber-500/30 bg-slate-950 px-3.5 py-2 font-mono text-sm font-bold text-amber-300">
                  {primarySubscription.licenseKey}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopyLicense(primarySubscription.licenseKey)}
                  className="text-xs"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {lang === 'es' ? 'Copiar LicenseKey' : 'Copy LicenseKey'}
                </Button>
              </div>
              <p className="text-xs text-slate-400 pt-1">
                {lang === 'es'
                  ? `Estrategia activa: ${primarySubscription.activeStrategyName} • Cuenta NT8: ${primarySubscription.ninjaAccountName}`
                  : `Active strategy: ${primarySubscription.activeStrategyName} • NT8 Account: ${primarySubscription.ninjaAccountName}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link to="/my-subscriptions">
                <Button variant="secondary" size="sm" className="text-xs">
                  <Cpu className="h-3.5 w-3.5 text-sky-400" />
                  {lang === 'es' ? 'Gestionar Machine ID' : 'Manage Machine ID'}
                </Button>
              </Link>
              <Link to="/my-bots">
                <Button variant="primary" size="sm" className="text-xs">
                  <Download className="h-3.5 w-3.5" />
                  {lang === 'es' ? 'Ir a Mis Bots' : 'Go to My Bots'}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'es'
                    ? 'Aún no tienes una suscripción activa'
                    : 'You do not have an active subscription yet'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {lang === 'es'
                    ? 'Explora nuestro catálogo de bots automatizados y elige un plan de membresía para obtener tu LicenseKey de NinjaTrader 8.'
                    : 'Explore our automated bots catalog and choose a membership plan to receive your NinjaTrader 8 LicenseKey.'}
                </p>
              </div>
            </div>
            <Link to="/catalog">
              <Button variant="primary" size="md" className="shrink-0">
                <Sparkles className="h-4 w-4" />
                {lang === 'es' ? 'Explorar Catálogo' : 'Explore Catalog'}
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Accesos Directos a las Funciones Exclusivas del Cliente */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          {lang === 'es' ? 'Módulos de tu Cuenta de Cliente' : 'Your Client Account Modules'}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/catalog" className="group">
            <Card className="p-5 h-full border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {lang === 'es' ? 'Catálogo de Bots' : 'Bots Catalog'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'es'
                    ? 'Consulta las especificaciones técnicas, mercados soportados y planes de suscripción disponibles.'
                    : 'Review technical specifications, supported markets, and available subscription plans.'}
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/my-bots" className="group">
            <Card className="p-5 h-full border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Download className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {lang === 'es' ? 'Mis Bots & Descargas NT8' : 'My Bots & NT8 Downloads'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'es'
                    ? 'Descarga los paquetes .zip de tus estrategias para importarlos directamente en NinjaTrader 8.'
                    : 'Download the .zip packages for your strategies to import directly into NinjaTrader 8.'}
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/my-subscriptions" className="group">
            <Card className="p-5 h-full border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  {lang === 'es' ? 'Mis Licencias & Machine ID' : 'My Licenses & Machine ID'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'es'
                    ? 'Revisa tu LicenseKey, fecha de vencimiento y libera tu Machine ID cuando cambies de equipo o VPS.'
                    : 'Check your LicenseKey, expiration date, and reset your Machine ID when switching PCs or VPS.'}
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/billing" className="group">
            <Card className="p-5 h-full border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {lang === 'es' ? 'Facturación y Pagos' : 'Billing & Payments'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'es'
                    ? 'Consulta tu historial de pagos, estado de renovación y descarga tus recibos en formato PDF.'
                    : 'View your payment history, renewal status, and download your invoice receipts in PDF.'}
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/profile" className="group">
            <Card className="p-5 h-full border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {lang === 'es' ? 'Mi Perfil y Documentación' : 'My Profile & KYC Docs'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'es'
                    ? 'Mantén actualizados tus datos de contacto, documento de identidad y firma digital del contrato.'
                    : 'Keep your contact details, identity document, and digitally signed disclaimer contract up to date.'}
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/social" className="group">
            <Card className="p-5 h-full border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                    <MessageSquareShare className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  {lang === 'es' ? 'Comunidad / Muro Social' : 'Community / Social Wall'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'es'
                    ? 'Comparte tus resultados operativos y conecta con otros traders de Trading Life Academy.'
                    : 'Share your trading results and connect with fellow traders at Trading Life Academy.'}
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};
