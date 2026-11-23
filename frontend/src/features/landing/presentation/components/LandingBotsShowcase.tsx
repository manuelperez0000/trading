import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { formatUsd } from '@shared/utils/formatters';
import { useI18n } from '@core/i18n/useLanguageStore';
import { TRADING_BOTS_CATALOG } from '@features/bots-catalog/domain/entities/TradingBot';

export const LandingBotsShowcase: React.FC = () => {
  const { lang } = useI18n();
  const featuredBots = TRADING_BOTS_CATALOG.slice(0, 3);

  const cardThemes = [
    {
      topBar: 'from-amber-400 via-yellow-300 to-amber-500',
      glow: 'from-amber-500/15 via-transparent to-transparent',
      border: 'border-2 border-amber-500/60 shadow-2xl shadow-amber-500/15',
      bars: [40, 55, 48, 70, 65, 85, 78, 95, 88, 100],
      barColor: 'bg-amber-400',
    },
    {
      topBar: 'from-emerald-400 via-teal-300 to-emerald-500',
      glow: 'from-emerald-500/15 via-transparent to-transparent',
      border: 'border-2 border-emerald-500/35 hover:border-emerald-400 shadow-xl',
      bars: [35, 45, 60, 52, 72, 68, 80, 90, 84, 96],
      barColor: 'bg-emerald-400',
    },
    {
      topBar: 'from-sky-400 via-cyan-300 to-sky-500',
      glow: 'from-sky-500/15 via-transparent to-transparent',
      border: 'border-2 border-sky-500/35 hover:border-sky-400 shadow-xl',
      bars: [45, 50, 58, 64, 60, 75, 82, 79, 91, 94],
      barColor: 'bg-sky-400',
    },
  ];

  return (
    <section id="bots" className="py-24 relative bg-slate-900/30 border-y border-slate-800/80 overflow-hidden">
      <div className="pointer-events-none absolute top-10 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[140px]" />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl space-y-3">
            <Badge variant="emerald">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              {lang === 'es' ? 'Catálogo de Bots por Suscripción' : 'Subscription Trading Bots Catalog'}
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {lang === 'es' ? (
                <>
                  Elige el Bot Ideal para tu{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Prueba de Fondeo o Cuenta Real
                  </span>
                </>
              ) : (
                <>
                  Choose the Ideal Bot for Your{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Funded Evaluation or Live Account
                  </span>
                </>
              )}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {lang === 'es'
                ? 'Algoritmos automatizados listos para instalar y operar en futuros (NQ, MNQ, ES, GC). Disponibles mediante suscripción mensual o anual tanto para estudiantes de la academia como para cualquier trader.'
                : 'Automated algorithms ready to install and run on futures (NQ, MNQ, ES, GC). Available via monthly or annual subscription for both academy students and any independent trader.'}
            </p>
          </div>

          <Link to="/catalog">
            <Button variant="secondary" size="md" className="shrink-0 text-xs">
              {lang === 'es' ? 'Ver Catálogo Completo' : 'View Full Catalog'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Grid de Tarjetas de Bots de Alto Impacto */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {featuredBots.map((bot, index) => {
            const theme = cardThemes[index % cardThemes.length];
            return (
              <Card
                key={bot.id}
                className={`group relative p-7 flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-2 bg-slate-900/95 overflow-hidden ${theme.border}`}
              >
                {/* Resplandor interno y barra superior metálica */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow}`}
                />
                <div
                  className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${theme.topBar}`}
                />

                {index === 0 && (
                  <div className="absolute top-1.5 right-0 bg-gradient-to-l from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-3.5 py-1 rounded-bl-xl shadow-lg flex items-center gap-1">
                    <Flame className="h-3 w-3 fill-slate-950" />
                    {lang === 'es' ? 'MÁS VENDIDO' : 'BEST SELLER'}
                  </div>
                )}

                <div className="space-y-4 relative z-10">
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-lg group-hover:scale-110 transition-transform">
                        <Bot className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                          {bot.name}
                        </h3>
                        <div className="text-[11px] font-mono text-amber-400/90">
                          {bot.codeName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chips de Compatibilidad (Pulsar, Proton, Nova, Real) */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Pulsar
                    </span>
                    <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      Proton
                    </span>
                    <span className="rounded-md bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                      Nova
                    </span>
                    <span className="rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                      {lang === 'es' ? 'Cuenta Real (Live)' : 'Live Account'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed min-h-[44px]">
                    {bot.shortDescription}
                  </p>

                  {/* Mini Gráfico Visual de Curva de Backtesting */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        {lang === 'es' ? 'Curva Backtesting Histórico*' : 'Historical Backtest Curve*'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        ● {bot.primaryInstrument}
                      </span>
                    </div>

                    {/* Barras de progreso de curva de equidad */}
                    <div className="flex items-end gap-1.5 h-10 pt-1 px-1">
                      {theme.bars.map((height, bIdx) => (
                        <div
                          key={bIdx}
                          style={{ height: `${height}%` }}
                          className={`flex-1 rounded-t-sm ${theme.barColor} opacity-80 group-hover:opacity-100 transition-all`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                      <div>
                        <div className="text-[10px] uppercase text-slate-400">Win Rate (BT)</div>
                        <div className="text-base font-black font-mono text-emerald-400">
                          {bot.winRatePercent}%
                        </div>
                      </div>
                      <div className="border-x border-slate-800">
                        <div className="text-[10px] uppercase text-slate-400">Profit Factor</div>
                        <div className="text-base font-black font-mono text-sky-400">
                          {bot.profitFactor}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400">Freno DD</div>
                        <div className="text-base font-black font-mono text-amber-400">
                          {formatUsd(bot.maxDrawdownUsd)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Características para Fondeo y Real */}
                  <div className="space-y-1.5 pt-1">
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>
                          {lang === 'es'
                            ? 'Perfiles preconfigurados para Pulsar, Proton y Nova'
                            : 'Pre-configured profiles for Pulsar, Proton & Nova'}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>
                          {lang === 'es'
                            ? 'Apto para Cuentas Reales (Live) y Cuentas Fondeadas'
                            : 'Ready for Personal Live & Funded Accounts'}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>
                          {lang === 'es'
                            ? 'Freno automático de pérdida diaria + Pausa móvil'
                            : 'Automated daily loss stop + Mobile remote pause'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Precio de Suscripción y Botones CTA (Ver Detalles Público + Comprar con Gate de Login) */}
                <div className="relative z-10 border-t border-slate-800/90 pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {lang === 'es' ? 'Suscripción Mensual' : 'Monthly Subscription'}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white font-mono">
                        {formatUsd(bot.monthlyPriceUsd)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {lang === 'es' ? '/ mes' : '/ mo'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/catalog/${bot.id}`}>
                      <Button variant="secondary" size="sm" className="text-xs font-semibold">
                        {lang === 'es' ? 'Ver Detalles' : 'View Details'}
                      </Button>
                    </Link>
                    <Link to={`/catalog/${bot.id}?intent=buy`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs font-bold shadow-lg shadow-amber-500/20"
                      >
                        {lang === 'es' ? 'Comprar' : 'Buy Now'}
                        <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
