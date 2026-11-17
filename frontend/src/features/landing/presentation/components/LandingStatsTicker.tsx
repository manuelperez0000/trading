import React from 'react';
import { DollarSign, ShieldAlert, TrendingUp, Zap } from 'lucide-react';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingStatsTicker: React.FC = () => {
  const { lang } = useI18n();

  const stats = [
    {
      label: lang === 'es' ? 'Retiros de Fondeo Comunitarios' : 'Community Funded Payouts',
      value: '+$185,000 USD',
      sub: lang === 'es' ? 'Verificados por telemetría API' : 'Verified by API telemetry',
      icon: <DollarSign className="h-5 w-5 text-emerald-400" />,
      accent: 'border-emerald-500/30 bg-emerald-500/5',
      valueColor: 'text-emerald-400',
    },
    {
      label: lang === 'es' ? 'Win Rate Promedio Certificado' : 'Certified Average Win Rate',
      value: '74.8%',
      sub: lang === 'es' ? 'En sesiones NY (Futuros NQ y ES)' : 'NY sessions (NQ & ES Futures)',
      icon: <TrendingUp className="h-5 w-5 text-amber-400" />,
      accent: 'border-amber-500/30 bg-amber-500/5',
      valueColor: 'text-amber-400',
    },
    {
      label: lang === 'es' ? 'Velocidad de Kill-Switch' : 'Kill-Switch Reaction Speed',
      value: '< 45 ms',
      sub: lang === 'es' ? 'Apagado remoto ultrarrápido' : 'Ultra-fast remote shutdown',
      icon: <Zap className="h-5 w-5 text-sky-400" />,
      accent: 'border-sky-500/30 bg-sky-500/5',
      valueColor: 'text-sky-400',
    },
    {
      label: lang === 'es' ? 'Cumplimiento con Prop Firms' : 'Prop Firm Rule Compliance',
      value: '100%',
      sub: lang === 'es' ? 'Apex, Topstep, Bulenox, MFF' : 'Apex, Topstep, Bulenox, MFF',
      icon: <ShieldAlert className="h-5 w-5 text-emerald-400" />,
      accent: 'border-emerald-500/30 bg-emerald-500/5',
      valueColor: 'text-white',
    },
  ];

  return (
    <section className="border-y border-slate-800/80 bg-slate-900/40 py-10 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((st, i) => (
            <Card
              key={i}
              className={`p-5 flex items-center gap-4 transition-all hover:scale-[1.02] ${st.accent}`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
                {st.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-400 truncate">
                  {st.label}
                </div>
                <div className={`text-2xl font-black font-mono tracking-tight ${st.valueColor}`}>
                  {st.value}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {st.sub}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
