import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';
import { useSubscriptionPlansQuery } from '@features/subscriptions/application/hooks/useSubscriptionPlans';
import type { SubscriptionPlan } from '@features/subscriptions/domain/entities/SubscriptionPlan';

export const LandingPricing: React.FC = () => {
  const { lang } = useI18n();
  const { data: dynamicPlans = [] } = useSubscriptionPlansQuery();
  const [selectedCycle, setSelectedCycle] = useState<string>('ALL');

  const activePlans = dynamicPlans.filter((p) => p.isActive);

  // Ciclos únicos disponibles entre los planes activos
  const availableCycles = Array.from(new Set(activePlans.map((p) => p.billingCycle)));

  const displayedPlans = activePlans.length > 0
    ? activePlans.filter((p) => {
        if (selectedCycle === 'ALL') return true;
        return p.billingCycle === selectedCycle;
      })
    : [];

  const getCycleLabel = (cycle: string): string => {
    if (cycle === 'MONTHLY') return lang === 'es' ? 'Mensual' : 'Monthly';
    if (cycle === 'QUARTERLY') return lang === 'es' ? 'Trimestral' : 'Quarterly';
    if (cycle === 'SEMIANNUAL') return lang === 'es' ? 'Semestral' : 'Semiannual';
    if (cycle === 'ANNUAL') return lang === 'es' ? 'Anual' : 'Annual';
    return cycle;
  };

  const getPeriodLabel = (plan: SubscriptionPlan): string => {
    if (plan.billingCycle === 'MONTHLY') return lang === 'es' ? '/ mes' : '/ mo';
    if (plan.billingCycle === 'ANNUAL') return lang === 'es' ? '/ año' : '/ yr';
    if (plan.billingCycle === 'QUARTERLY') return lang === 'es' ? '/ trimestre' : '/ quarter';
    if (plan.billingCycle === 'SEMIANNUAL') return lang === 'es' ? '/ semestre' : '/ semiannual';
    return `/ ${plan.durationDays} ${lang === 'es' ? 'días' : 'days'}`;
  };

  const getNotice = (plan: SubscriptionPlan): string | null => {
    if (plan.billingCycle === 'ANNUAL') {
      const monthlyEquiv = Math.round(plan.priceUsd / 12);
      return lang === 'es'
        ? `Equivale a solo $${monthlyEquiv} USD/mes (¡Ahorras un 33%!)`
        : `Equivalent to only $${monthlyEquiv} USD/mo (Save 33%!)`;
    }
    if (plan.billingCycle === 'QUARTERLY') {
      const monthlyEquiv = Math.round(plan.priceUsd / 3);
      return lang === 'es'
        ? `Equivale a $${monthlyEquiv} USD/mes`
        : `Equivalent to $${monthlyEquiv} USD/mo`;
    }
    if (plan.billingCycle === 'MONTHLY') {
      return lang === 'es'
        ? 'Facturación mensual recurrente • Cancela cuando quieras'
        : 'Billed monthly • Cancel anytime';
    }
    return null;
  };

  // Fallback en caso de que no haya planes cargados todavía
  const fallbackPlans = [
    {
      id: 'fallback-monthly',
      name: lang === 'es' ? 'Membresía Mensual All-Access' : 'Monthly All-Access Membership',
      badgeText: lang === 'es' ? 'MÁXIMA FLEXIBILIDAD' : 'MAXIMUM FLEXIBILITY',
      description:
        lang === 'es'
          ? 'Acceso total a todo el catálogo sin compromisos a largo plazo'
          : 'Full access to entire bot catalog with zero long-term commitment',
      priceUsd: 149,
      durationDays: 30,
      billingCycle: 'MONTHLY' as const,
      isPopular: false,
      features: [
        lang === 'es'
          ? 'Acceso TOTAL e ILIMITADO a todos los bots (Proton, Nova y Pulsar)'
          : 'TOTAL & UNLIMITED access to all bots (Proton, Nova, & Pulsar)',
        lang === 'es'
          ? 'Descarga directa de estrategias (.cs) y AddOn para NinjaTrader 8'
          : 'Direct download of strategy (.cs) & AddOn for NinjaTrader 8',
        lang === 'es'
          ? 'Perfiles optimizados: Lucid Trading, MFFU, Tradeify y Cuentas Reales'
          : 'Optimized profiles: Lucid Trading, MFFU, Tradeify & Live Accounts',
        lang === 'es'
          ? 'Licencia remota oficial para 1 PC o VPS de trading'
          : 'Official remote license for 1 trading PC or VPS',
        lang === 'es'
          ? 'Control remoto de pausa y Kill-Switch de seguridad desde web'
          : 'Remote pause & security Kill-Switch control from web',
        lang === 'es'
          ? 'Reset de equipo (HWID) inmediato para migrar de VPS o máquina'
          : 'Instant self-serve HWID Reset to switch machines or VPS',
        lang === 'es'
          ? 'Soporte técnico y guía de instalación paso a paso'
          : 'Technical support & step-by-step setup walkthrough',
      ],
    },
    {
      id: 'fallback-annual',
      name: lang === 'es' ? 'Membresía Anual All-Access' : 'Annual All-Access Membership',
      badgeText: lang === 'es' ? '★ MÁS POPULAR • 2 MESES GRATIS' : '★ MOST POPULAR • 2 MONTHS FREE',
      description:
        lang === 'es'
          ? 'El plan preferido por traders profesionales: ahorra $598 USD al año'
          : 'Preferred by professional traders: save $598 USD per year',
      priceUsd: 1190,
      durationDays: 365,
      billingCycle: 'ANNUAL' as const,
      isPopular: true,
      features: [
        lang === 'es'
          ? 'Acceso TOTAL e ILIMITADO a todo el catálogo actual y futuros bots'
          : 'TOTAL & UNLIMITED access to full current & upcoming bot catalog',
        lang === 'es'
          ? '2 MESES DE REGALO incluidos en comparación con el pago mensual'
          : '2 FREE MONTHS included compared to monthly billing',
        lang === 'es'
          ? 'Descarga directa de estrategias (.cs) y AddOn para NinjaTrader 8'
          : 'Direct download of strategy (.cs) & AddOn for NinjaTrader 8',
        lang === 'es'
          ? 'Perfiles preconfigurados para Lucid Trading, MFFU, Tradeify y Live'
          : 'Preconfigured presets for Lucid Trading, MFFU, Tradeify & Live',
        lang === 'es'
          ? 'Licencia activa con reseteo de HWID ilimitado en tiempo real'
          : 'Active license with unlimited real-time HWID Reset',
        lang === 'es'
          ? 'Sesión 1 a 1 de asistencia técnica e inducción con el equipo'
          : '1-on-1 technical setup assistance & induction session',
        lang === 'es'
          ? 'Soporte VIP prioritario y acceso a la comunidad privada'
          : 'Priority VIP support & private trader community access',
      ],
    },
  ];

  const finalPlansToRender = displayedPlans.length > 0 ? displayedPlans : fallbackPlans;

  const gridColsClass =
    finalPlansToRender.length === 1
      ? 'max-w-md mx-auto grid-cols-1'
      : finalPlansToRender.length === 2
      ? 'max-w-5xl mx-auto grid-cols-1 md:grid-cols-2'
      : finalPlansToRender.length === 3
      ? 'max-w-6xl mx-auto grid-cols-1 md:grid-cols-3'
      : 'max-w-7xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <section id="pricing" className="py-20 relative bg-slate-900/30 border-y border-slate-800/80">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <Badge variant="amber">
            {lang === 'es' ? 'Planes de Suscripción Abiertos a Todos' : 'Subscription Plans Open to Everyone'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Suscríbete a tu Bot y Automatiza tus{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Cuentas de Fondeo y Cuentas Reales
                </span>
              </>
            ) : (
              <>
                Subscribe to Your Bot & Automate Your{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Funded & Live Accounts
                </span>
              </>
            )}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {lang === 'es'
              ? 'Sin requisitos previos: tanto alumnos de Trading Life Academy como cualquier trader independiente pueden suscribirse hoy, instalar el bot en su propia cuenta y cancelar o cambiar de plan en cualquier momento.'
              : 'No prior requirements: both Trading Life Academy students and any independent trader can subscribe today, install the bot on their own account, and cancel or switch plans anytime.'}
          </p>

          {/* Filtros dinámicos por ciclo si hay múltiples opciones */}
          {availableCycles.length > 1 && (
            <div className="inline-flex flex-wrap items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-1 mt-4 gap-1">
              <button
                type="button"
                onClick={() => setSelectedCycle('ALL')}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  selectedCycle === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'es' ? 'Todos los Planes' : 'All Plans'}
              </button>
              {availableCycles.map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setSelectedCycle(cycle)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    selectedCycle === cycle
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {getCycleLabel(cycle)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid de Planes Dinámicos */}
        <div className={`grid gap-8 ${gridColsClass}`}>
          {finalPlansToRender.map((plan) => {
            const badgeLabel =
              plan.badgeText ||
              (plan.isPopular ? (lang === 'es' ? '★ MÁS POPULAR' : '★ MOST POPULAR') : undefined);
            const notice = getNotice(plan as SubscriptionPlan);

            return (
              <Card
                key={plan.id}
                className={`p-8 rounded-3xl flex flex-col justify-between space-y-8 transition-all hover:scale-[1.01] border-slate-800 bg-slate-900/90 ${
                  plan.isPopular
                    ? 'border-2 border-amber-500 shadow-2xl shadow-amber-500/20 relative overflow-hidden ring-1 ring-amber-500/30'
                    : 'hover:border-slate-700'
                }`}
              >
                {badgeLabel && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-[11px] tracking-wider uppercase px-4 py-1.5 rounded-bl-2xl shadow-md">
                    {badgeLabel}
                  </div>
                )}

                <div className="space-y-6 pt-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                        ${plan.priceUsd}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        USD {getPeriodLabel(plan as SubscriptionPlan)}
                      </span>
                    </div>
                    {notice && (
                      <div className="text-xs font-semibold text-emerald-400 mt-1">
                        {notice}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      {lang === 'es' ? 'Tu suscripción incluye:' : 'Your subscription includes:'}
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link to="/catalog">
                  <Button
                    variant={plan.isPopular ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full justify-center text-sm font-bold shadow-lg"
                  >
                    <Sparkles className="h-4 w-4" />
                    {lang === 'es' ? `Suscribirme a ${plan.name}` : `Subscribe to ${plan.name}`}
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-8 max-w-2xl mx-auto">
          {lang === 'es'
            ? '*Nota de transparencia: La suscripción otorga una licencia de uso de software automatizado (SaaS Non-Custodial) que el usuario instala en su propio equipo. El usuario mantiene en todo momento el control exclusivo de sus cuentas de trading.'
            : '*Transparency notice: The subscription grants an automated software license (Non-Custodial SaaS) that the user installs on their own machine. The user retains exclusive control of their trading accounts at all times.'}
        </p>
      </div>
    </section>
  );
};

