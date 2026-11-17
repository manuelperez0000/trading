import React from 'react';
import { Clock, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingPropFirms: React.FC = () => {
  const { lang } = useI18n();

  const propFirms = [
    { name: 'Apex Trader Funding', badge: '100% Compatible', desc: 'Rithmic & Tradovate NT8' },
    { name: 'Topstep', badge: 'NinjaTrader 8 Ready', desc: 'Soporte NinjaScript C#' },
    { name: 'Bulenox', badge: 'Trailing Stop Seguro', desc: 'Cuentas $25k a $250k' },
    { name: 'MyFundedFutures', badge: 'Reglas de Consistencia', desc: 'Gestión de Lotes Segura' },
    { name: 'TradeDay', badge: 'Aprobado', desc: 'Sin violaciones de drawdown' },
  ];

  const rules = [
    {
      title: lang === 'es' ? 'Hard-Stop de Drawdown Diario' : 'Hard Daily Drawdown Stop',
      desc:
        lang === 'es'
          ? 'El algoritmo cuenta con un tope inviolable de pérdida diaria en USD. Si el mercado tiene un movimiento adverso, la posición se liquida y el bot se bloquea automáticamente hasta la siguiente sesión.'
          : 'The algorithm features an unbreachable daily loss ceiling in USD. If market volatility strikes, positions are flattened and trading locks until the next session.',
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    },
    {
      title: lang === 'es' ? 'Cierre Obligatorio Fin de Sesión' : 'Mandatory End-of-Day Flatten',
      desc:
        lang === 'es'
          ? 'Liquidación automática de todas las órdenes antes de las 16:55 EST para no violar la regla de posiciones nocturnas no permitidas.'
          : 'Automatic flattening of all orders before 16:55 EST to avoid overnight holding violations on futures prop firms.',
      icon: <Clock className="h-5 w-5 text-amber-400" />,
    },
    {
      title: lang === 'es' ? 'Filtro de Noticias de Alto Impacto' : 'High-Impact News Pause',
      desc:
        lang === 'es'
          ? 'Pausa de órdenes y bloqueo de nuevas operaciones 5 minutos antes y después de comunicados del FOMC, NFP o CPI.'
          : 'Automatic order suspension 5 minutes before and after high-impact macroeconomic releases (FOMC, NFP, CPI).',
      icon: <Zap className="h-5 w-5 text-sky-400" />,
    },
  ];

  return (
    <section id="prop-firms" className="py-20 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <Badge variant="amber">
            {lang === 'es' ? 'Blindaje Normativo' : 'Prop Firm Compliance Armor'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Diseñado para Superar las Reglas de{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Cuentas de Fondeo de Futuros
                </span>
              </>
            ) : (
              <>
                Engineered to Pass Strict{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Futures Prop Firm Rules
                </span>
              </>
            )}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {lang === 'es'
              ? 'El 90% de los traders reprueban sus evaluaciones por no respetar el Trailing Drawdown o sobreoperar en pérdidas. Nuestros algoritmos eliminan el factor humano protegiendo tu capital milisegundo a milisegundo.'
              : '90% of traders fail evaluations due to trailing drawdown breaches or revenge trading. Our algorithms eliminate human emotional flaws, protecting your capital millisecond by millisecond.'}
          </p>
        </div>

        {/* Logotipos / Badges de Empresas de Fondeo */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-12">
          {propFirms.map((firm, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center hover:border-amber-500/40 transition-colors"
            >
              <div className="text-sm font-bold text-white mb-1">{firm.name}</div>
              <Badge variant="emerald" className="text-[10px]">
                {firm.badge}
              </Badge>
              <div className="text-[10px] text-slate-500 mt-1">{firm.desc}</div>
            </div>
          ))}
        </div>

        {/* 3 Pilares de Protección */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {rules.map((rule, idx) => (
            <Card
              key={idx}
              className="p-6 border-slate-800 bg-slate-900/80 hover:border-amber-500/30 transition-all space-y-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 border border-slate-800">
                {rule.icon}
              </div>
              <h3 className="text-base font-bold text-white">{rule.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{rule.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
