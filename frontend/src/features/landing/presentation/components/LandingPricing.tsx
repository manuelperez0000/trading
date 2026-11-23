import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingPricing: React.FC = () => {
  const { lang } = useI18n();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  const plans = [
    {
      id: 'single',
      name: lang === 'es' ? 'Suscripción Bot Individual' : 'Single Bot Subscription',
      subtitle: lang === 'es' ? 'Ideal para iniciar en fondeo o cuenta real' : 'Ideal to start on funded or live accounts',
      price: billingCycle === 'MONTHLY' ? 149 : 119,
      period: lang === 'es' ? '/ mes' : '/ mo',
      popular: false,
      features: [
        lang === 'es' ? '1 Bot automatizado a elección (ej. Quantum OrderFlow)' : '1 Automated bot of your choice (e.g. Quantum OrderFlow)',
        lang === 'es' ? 'Apto para Evaluaciones de Fondeo y Cuentas Reales' : 'Ready for Funded Evaluations & Live Accounts',
        lang === 'es' ? 'Licencia para 1 PC o VPS (con protección de Drawdown)' : '1 PC or VPS license (with Drawdown protection)',
        lang === 'es' ? 'Control de pausa y encendido remoto desde la web' : 'Web remote pause & toggle control',
        lang === 'es' ? 'Guía de instalación paso a paso y soporte técnico' : 'Step-by-step setup guide & technical support',
      ],
      cta: lang === 'es' ? 'Suscribirme al Bot Individual' : 'Subscribe to Single Bot',
    },
    {
      id: 'pro',
      name: lang === 'es' ? 'Pro Trader Suite (Todos los Bots)' : 'Pro Trader Suite (All Bots)',
      subtitle: lang === 'es' ? 'El plan más elegido por estudiantes y traders' : 'Most chosen by students & active traders',
      price: billingCycle === 'MONTHLY' ? 199 : 159,
      period: lang === 'es' ? '/ mes' : '/ mo',
      popular: true,
      features: [
        lang === 'es' ? 'Acceso a TODOS los bots del catálogo (3+ algoritmos)' : 'Access to ALL catalog bots (3+ algorithms)',
        lang === 'es' ? 'Opera Cuentas de Fondeo ($25k-$250k) y Cuentas Reales' : 'Trade Funded Evaluations ($25k-$250k) & Live Accounts',
        lang === 'es' ? 'Licencia activa para 2 equipos o VPS simultáneos' : 'Active license for 2 simultaneous PCs or VPS',
        lang === 'es' ? 'Cambio de equipo (Reset HWID) inmediato desde tu perfil' : 'Instant self-serve PC switch (HWID Reset)',
        lang === 'es' ? 'Apagado remoto global desde tu teléfono móvil' : 'Global remote pause from your mobile phone',
        lang === 'es' ? 'Acceso completo a la comunidad y soporte prioritario' : 'Full community access & priority support',
      ],
      cta: lang === 'es' ? 'Suscribirme a Pro Trader Suite' : 'Subscribe to Pro Trader Suite',
    },
    {
      id: 'lifetime',
      name: lang === 'es' ? 'Licencia Vitalicia VIP' : 'Lifetime VIP License',
      subtitle: lang === 'es' ? 'Un solo pago, sin mensualidades futuras' : 'One-time payment, zero monthly fees',
      price: 997,
      period: lang === 'es' ? 'pago único' : 'one-time',
      popular: false,
      features: [
        lang === 'es' ? 'Acceso de POR VIDA a todos los bots actuales y nuevos' : 'LIFETIME access to all current and future bots',
        lang === 'es' ? 'Uso ilimitado en tus pruebas de fondeo y cuentas reales' : 'Unlimited use on your funded & live accounts',
        lang === 'es' ? 'Sesión 1 a 1 de asistencia en instalación y ajustes' : '1-on-1 setup & parameter configuration session',
        lang === 'es' ? 'Plantillas preconfiguradas para distintos tamaños de cuenta' : 'Pre-configured risk presets for all account sizes',
        lang === 'es' ? 'Todas las actualizaciones futuras incluidas para siempre' : 'All future upgrades included forever',
      ],
      cta: lang === 'es' ? 'Obtener Licencia Vitalicia' : 'Get Lifetime VIP License',
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
                -20% OFF
              </span>
            </button>
          </div>
        </div>

        {/* 3 Planes de Precios */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-8 rounded-3xl flex flex-col justify-between space-y-8 transition-all hover:scale-[1.02] border-slate-800 bg-slate-900/90 ${
                plan.popular
                  ? 'border-2 border-amber-500 shadow-2xl shadow-amber-500/15 relative overflow-hidden'
                  : 'hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-[11px] tracking-wider uppercase px-4 py-1.5 rounded-bl-2xl shadow-md">
                  ★ {lang === 'es' ? 'MÁS RECOMENDADO' : 'MOST POPULAR'}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.subtitle}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    USD {plan.period}
                  </span>
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
