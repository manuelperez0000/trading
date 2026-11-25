import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingPricing: React.FC = () => {
  const { lang } = useI18n();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');

  const plans = [
    {
      id: 'monthly',
      name: lang === 'es' ? 'Membresía Mensual All-Access' : 'Monthly All-Access Membership',
      badge: lang === 'es' ? 'MÁXIMA FLEXIBILIDAD' : 'MAXIMUM FLEXIBILITY',
      subtitle:
        lang === 'es'
          ? 'Acceso total a todo el catálogo sin compromisos a largo plazo'
          : 'Full access to entire bot catalog with zero long-term commitment',
      price: 149,
      period: lang === 'es' ? '/ mes' : '/ mo',
      equivalentNotice: lang === 'es' ? 'Facturación mensual recurrente • Cancela cuando quieras' : 'Billed monthly • Cancel anytime',
      popular: billingCycle === 'MONTHLY',
      features: [
        lang === 'es'
          ? 'Acceso TOTAL e ILIMITADO a todos los bots (Proton, Nova y Pulsar)'
          : 'TOTAL & UNLIMITED access to all bots (Proton, Nova, & Pulsar)',
        lang === 'es'
          ? 'Descarga directa de archivos de estrategia (.cs) y AddOn para NinjaTrader 8'
          : 'Direct download of strategy (.cs) & AddOn files for NinjaTrader 8',
        lang === 'es'
          ? 'Perfiles optimizados: Lucid Trading, MFFU, Tradeify y Cuentas Reales'
          : 'Optimized profiles: Lucid Trading, MFFU, Tradeify & Live Accounts',
        lang === 'es'
          ? 'Licencia remota oficial para 1 PC o VPS de trading'
          : 'Official remote license for 1 trading PC or VPS',
        lang === 'es'
          ? 'Control remoto de pausa y Kill-Switch de seguridad desde web y móvil'
          : 'Remote pause & security Kill-Switch control from web & mobile',
        lang === 'es'
          ? 'Reset de equipo (HWID) inmediato para migrar de VPS o máquina'
          : 'Instant self-serve HWID Reset to switch machines or VPS',
        lang === 'es'
          ? 'Soporte técnico y guía de instalación paso a paso'
          : 'Technical support & step-by-step setup walkthrough',
      ],
      cta: lang === 'es' ? 'Suscribirme al Plan Mensual' : 'Subscribe to Monthly Plan',
    },
    {
      id: 'annual',
      name: lang === 'es' ? 'Membresía Anual All-Access' : 'Annual All-Access Membership',
      badge: lang === 'es' ? '★ MÁS POPULAR • 2 MESES GRATIS' : '★ MOST POPULAR • 2 MONTHS FREE',
      subtitle:
        lang === 'es'
          ? 'El plan preferido por traders profesionales: ahorra $598 USD al año'
          : 'Preferred by professional traders: save $598 USD per year',
      price: 1190,
      period: lang === 'es' ? '/ año' : '/ yr',
      equivalentNotice: lang === 'es' ? 'Equivale a solo $99 USD/mes (¡Ahorras un 33%!)' : 'Equivalent to only $99 USD/mo (Save 33%!)',
      popular: true,
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
          ? 'Licencia activa para 2 terminales simultáneas (VPS + PC personal)'
          : 'Active license for 2 simultaneous terminals (VPS + personal PC)',
        lang === 'es'
          ? 'Reset de equipo (HWID) ilimitado con sincronización en tiempo real'
          : 'Unlimited HWID Reset with real-time remote sync',
        lang === 'es'
          ? 'Sesión 1 a 1 de asistencia técnica e inducción con el equipo'
          : '1-on-1 technical setup assistance & induction session',
        lang === 'es'
          ? 'Soporte VIP prioritario y acceso a la comunidad privada'
          : 'Priority VIP support & private trader community access',
      ],
      cta: lang === 'es' ? 'Obtener Membresía Anual (Recomendado)' : 'Get Annual Membership (Recommended)',
    },
  ];

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

          {/* Toggle Mensual / Anual */}
          <div className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1 mt-4">
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                billingCycle === 'MONTHLY'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'es' ? 'Suscripción Mensual' : 'Monthly Subscription'}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{lang === 'es' ? 'Suscripción Anual' : 'Annual Subscription'}</span>
              <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2">
                {lang === 'es' ? '2 MESES GRATIS (-33%)' : '2 MONTHS FREE (-33%)'}
              </span>
            </button>
          </div>
        </div>

        {/* 2 Planes de Membresía All-Access */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-8 rounded-3xl flex flex-col justify-between space-y-8 transition-all hover:scale-[1.01] border-slate-800 bg-slate-900/90 ${
                plan.popular
                  ? 'border-2 border-amber-500 shadow-2xl shadow-amber-500/20 relative overflow-hidden ring-1 ring-amber-500/30'
                  : 'hover:border-slate-700'
              }`}
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-[11px] tracking-wider uppercase px-4 py-1.5 rounded-bl-2xl shadow-md">
                {plan.badge}
              </div>

              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.subtitle}</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      USD {plan.period}
                    </span>
                  </div>
                  {plan.equivalentNotice && (
                    <div className="text-xs font-semibold text-emerald-400 mt-1">
                      {plan.equivalentNotice}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
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
                  variant={plan.popular ? 'primary' : 'secondary'}
                  size="lg"
                  className="w-full justify-center text-sm font-bold shadow-lg"
                >
                  <Sparkles className="h-4 w-4" />
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
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
