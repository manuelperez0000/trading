import React from 'react';
import { Bot, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingStatsTicker: React.FC = () => {
  const { lang } = useI18n();

  const stats = [
    {
      label: lang === 'es' ? 'Doble Propósito Operativo' : 'Dual Trading Purpose',
      value: lang === 'es' ? 'Fondeo & Real' : 'Funded & Live',
      sub: lang === 'es' ? 'Apto para evaluaciones y cuentas propias' : 'Built for evaluations & personal accounts',
      icon: <Bot className="h-5 w-5 text-amber-400" />,
      accent: 'border-amber-500/30 bg-amber-500/5',
      valueColor: 'text-amber-400',
    },
    {
      label: lang === 'es' ? 'Tasa de Acierto en Backtesting' : 'Historical Backtest Win Rate',
      value: '74.8% (BT)',
      sub: lang === 'es' ? 'En pruebas históricas de flujo de órdenes' : 'In historical order-flow backtests',
      icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
      accent: 'border-emerald-500/30 bg-emerald-500/5',
      valueColor: 'text-emerald-400',
    },
    {
      label: lang === 'es' ? 'Protección Anti-Quiebra Diaria' : 'Daily Drawdown Protection',
      value: '100% Automática',
      sub: lang === 'es' ? 'Detiene el bot al tocar tu límite diario' : 'Stops trading when daily limit is hit',
      icon: <ShieldCheck className="h-5 w-5 text-sky-400" />,
      accent: 'border-sky-500/30 bg-sky-500/5',
      valueColor: 'text-sky-400',
    },
    {
      label: lang === 'es' ? 'Acceso Abierto por Suscripción' : 'Open Subscription Access',
      value: lang === 'es' ? 'Para Todos' : 'Open to All',
      sub: lang === 'es' ? 'Alumnos de la academia y público general' : 'Academy students & general public',
      icon: <Users className="h-5 w-5 text-emerald-400" />,
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
                <div className={`text-xl font-black font-mono tracking-tight ${st.valueColor}`}>
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
