import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
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

  return (
    <section id="bots" className="py-20 relative bg-slate-900/30 border-y border-slate-800/80">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl space-y-3">
            <Badge variant="emerald">
              {lang === 'es' ? 'Catálogo Algorítmico 2026' : 'Algorithmic Catalog 2026'}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'es' ? (
                <>
                  Nuestros Algoritmos{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Auditados y Más Rentables
                  </span>
                </>
              ) : (
                <>
                  Our Most Profitable &{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Audited Algorithms
                  </span>
                </>
              )}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {lang === 'es'
                ? 'Estrategias diseñadas en C# NinjaScript con control de riesgo granular, listas para operar en futuros NQ, ES y GC con licencia remota segura.'
                : 'C# NinjaScript strategies engineered with granular risk control, ready to trade NQ, ES, and GC futures with cloud license enforcement.'}
            </p>
          </div>

          <Link to="/catalog">
            <Button variant="secondary" size="md" className="shrink-0 text-xs">
              {lang === 'es' ? 'Ver Todos los Bots' : 'View Full Catalog'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Grid de Tarjetas de Bots */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {featuredBots.map((bot, index) => (
            <Card
              key={bot.id}
              className={`p-6 flex flex-col justify-between space-y-6 transition-all hover:scale-[1.02] border-slate-800 bg-slate-900/90 ${
                index === 0
                  ? 'border-amber-500/50 shadow-xl shadow-amber-500/10 relative overflow-hidden'
                  : 'hover:border-slate-700'
              }`}
            >
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-3 py-1 rounded-bl-xl shadow-md">
                  ★ {lang === 'es' ? 'Más Popular' : 'Most Popular'}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{bot.name}</h3>
                      <div className="text-[11px] font-mono text-slate-400">
                        {bot.codeName} • {bot.version}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                  {bot.shortDescription}
                </p>

                {/* Métricas Auditadas */}
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase text-slate-400">Win Rate</div>
                    <div className="text-base font-bold font-mono text-emerald-400">
                      {bot.winRatePercent}%
                    </div>
                  </div>
                  <div className="border-x border-slate-800">
                    <div className="text-[10px] uppercase text-slate-400">Profit Factor</div>
                    <div className="text-base font-bold font-mono text-sky-400">
                      {bot.profitFactor}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-400">Max DD</div>
                    <div className="text-base font-bold font-mono text-rose-400">
                      {formatUsd(bot.maxDrawdownUsd)}
                    </div>
                  </div>
                </div>

                {/* Parámetros incluidos */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {lang === 'es' ? 'Características NinjaScript:' : 'NinjaScript Features:'}
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{lang === 'es' ? 'Mercado óptimo:' : 'Optimal market:'} {bot.primaryInstrument}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{bot.avgDailyTrades}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{lang === 'es' ? 'Apto Cuentas $50k+ Fondeo' : 'Ready for $50k+ Prop Accounts'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Precio y Botón CTA */}
              <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-white">
                    {formatUsd(bot.monthlyPriceUsd)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {' '}{lang === 'es' ? '/ mes' : '/ mo'}
                  </span>
                </div>

                <Link to={`/catalog/${bot.id}`}>
                  <Button
                    variant={index === 0 ? 'primary' : 'secondary'}
                    size="md"
                    className="text-xs"
                  >
                    {lang === 'es' ? 'Ver Detalle' : 'View Specs'}
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
