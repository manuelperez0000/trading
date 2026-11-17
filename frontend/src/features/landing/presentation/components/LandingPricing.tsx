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
      name: lang === 'es' ? 'Bot Individual' : 'Single Strategy',
      subtitle: lang === 'es' ? 'Ideal para un mercado específico' : 'Ideal for one target instrument',
      price: billingCycle === 'MONTHLY' ? 149 : 119,
      period: lang === 'es' ? '/ mes' : '/ mo',
      popular: false,
      features: [
        lang === 'es' ? 'Acceso a 1 bot a elección (ej: Quantum OrderFlow)' : 'Access to 1 bot of your choice',
        lang === 'es' ? 'Licencia NinjaTrader 8 para 1 PC (HWID)' : '1 PC Machine ID license',
        lang === 'es' ? 'Control de Kill-Switch remoto web' : 'Web remote Kill-Switch control',
        lang === 'es' ? 'Protección hard-stop para fondeos' : 'Prop firm hard-stop protection',
        lang === 'es' ? 'Soporte y actualizaciones continuas' : 'Continuous updates & technical support',
      ],
      cta: lang === 'es' ? 'Elegir Bot Individual' : 'Choose Single Bot',
    },
    {
      id: 'pro',
      name: lang === 'es' ? 'Pro Trader Suite' : 'Pro Trader Suite',
      subtitle: lang === 'es' ? 'Nuestra opción más recomendada' : 'Our most recommended option',
      price: billingCycle === 'MONTHLY' ? 199 : 159,
      period: lang === 'es' ? '/ mes' : '/ mo',
      popular: true,
      features: [
        lang === 'es' ? 'Acceso a TODOS los bots del catálogo (3+ bots)' : 'Access to ALL bots in the catalog (3+ bots)',
        lang === 'es' ? 'Licencia para 2 PCs o VPS simultáneo' : '2 PC / VPS simultaneous licenses',
        lang === 'es' ? 'Reset de Machine ID instantáneo desde el perfil' : 'Instant self-serve HWID reset',
        lang === 'es' ? 'Kill-Switch Global y telemetría avanzada' : 'Global Kill-Switch & priority telemetry',
        lang === 'es' ? 'Publicación en el Muro Social con sello API' : 'Verified Social Wall verified badge',
        lang === 'es' ? 'Acceso a canales VIP en Discord' : 'Private VIP Discord channels access',
      ],
      cta: lang === 'es' ? 'Obtener Acceso Pro' : 'Get Pro Trader Access',
    },
    {
      id: 'lifetime',
      name: lang === 'es' ? 'Licencia Vitalicia VIP' : 'Lifetime VIP Pass',
      subtitle: lang === 'es' ? 'Pago único sin cuotas mensuales' : 'One-time payment, no monthly fees',
      price: 997,
      period: lang === 'es' ? 'pago único' : 'one-time',
      popular: false,
      features: [
        lang === 'es' ? 'Acceso de POR VIDA a todos los bots actuales y futuros' : 'LIFETIME access to all current and future bots',
        lang === 'es' ? 'Licencias ilimitadas para tus máquinas/VPS' : 'Unlimited PC / VPS machine bindings',
        lang === 'es' ? 'Soporte prioritario 1 a 1 de instalación' : '1-on-1 priority installation support',
        lang === 'es' ? 'Plantillas NinjaScript C# descompiladas' : 'Configurable NinjaScript presets',
        lang === 'es' ? 'Todas las actualizaciones mayores incluidas' : 'All major upgrades included forever',
      ],
      cta: lang === 'es' ? 'Adquirir Licencia Vitalicia' : 'Get Lifetime License',
    },
  ];

  return (
    <section id="pricing" className="py-20 relative bg-slate-900/30 border-y border-slate-800/80">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <Badge variant="amber">
            {lang === 'es' ? 'Inversión en tu Carrera de Trading' : 'Invest in Your Edge'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Precios Transparentes,{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Sin Letra Chica
                </span>
              </>
            ) : (
              <>
                Transparent Pricing,{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Zero Hidden Fees
                </span>
              </>
            )}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {lang === 'es'
              ? '¿Sabías que quemar una sola cuenta de fondeo cuesta entre $150 y $300 USD por reinicio? Nuestros algoritmos se pagan solos evitando violaciones de riesgo desde el primer día.'
              : 'Did you know that blowing a single evaluation account costs $150 to $300 in reset fees? Our algorithms pay for themselves by preventing costly risk breaches on day one.'}
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
              {lang === 'es' ? 'Facturación Mensual' : 'Monthly Billing'}
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
              <span>{lang === 'es' ? 'Facturación Anual' : 'Annual Billing'}</span>
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
                  ★ {lang === 'es' ? 'RECOMENDADO' : 'BEST VALUE'}
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
                    {plan.period}
                  </span>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {lang === 'es' ? 'Incluye:' : 'Included:'}
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
      </div>
    </section>
  );
};
