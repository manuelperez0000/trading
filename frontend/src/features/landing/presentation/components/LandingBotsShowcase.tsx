import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
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
import { useBotsQuery } from '@features/bots-catalog/application/hooks/useBots';
import { TRADING_BOTS_CATALOG } from '@features/bots-catalog/domain/entities/TradingBot';

export const LandingBotsShowcase: React.FC = () => {
  const { lang } = useI18n();
  const { data: apiBots } = useBotsQuery();
  const featuredBots = (apiBots && apiBots.length > 0 ? apiBots : TRADING_BOTS_CATALOG).slice(0, 3);

  const cardThemes = [
    {
      botIdentifier: 'proton',
      imageSrc: '/proton.jpg',
      topBar: 'from-blue-600 via-sky-400 to-blue-500',
      glow: 'from-blue-500/20 via-transparent to-transparent',
      border: 'border-2 border-blue-500/45 hover:border-blue-400 shadow-xl shadow-blue-950/30',
      cardBackground: 'bg-[#071b35]',
      bars: [35, 42, 49, 55, 60, 66, 70, 76, 80, 85],
      barColor: 'bg-blue-400',
      efficiencyLabelEs: '● NIVEL 1 • EFICIENCIA BASE',
      efficiencyLabelEn: '● TIER 1 • BASE EFFICIENCY',
      ribbonStyle:
        'bg-gradient-to-l from-blue-500 via-sky-400 to-blue-500 text-[#f8fafc]',
      isTopEfficiency: false,
      imageFrame: 'border-blue-300/50 shadow-blue-500/20',
      codeNameColor: 'text-[#fcd34d]',
      nameHoverColor: 'group-hover:text-[#fcd34d]',
      chipStyles: [
        'bg-amber-500/15 border-amber-400/40 text-amber-200',
        'bg-emerald-500/15 border-emerald-400/40 text-emerald-200',
        'bg-blue-400/15 border-blue-300/40 text-blue-100',
        'bg-white/10 border-white/25 text-[#f8fafc]',
      ],
      chartBorder: 'border-blue-400/20',
      chartBackground: 'bg-[#041329]',
      chartIconColor: 'text-[#34d399]',
      instrumentColor: 'text-[#6ee7b7]',
      metricColors: ['text-[#6ee7b7]', 'text-[#f8fafc]', 'text-[#fcd34d]'],
      checkColor: 'text-emerald-400',
      shieldColor: 'text-[#fcd34d]',
      detailButtonStyle: 'border-blue-300/40 bg-blue-950/70 text-blue-100 hover:bg-blue-900',
      buyButtonStyle:
        'bg-gradient-to-r from-blue-400 to-sky-300 text-[#020617] shadow-blue-500/20 hover:from-blue-300 hover:to-sky-200',
    },
    {
      botIdentifier: 'nova',
      imageSrc: '/nova.jpg',
      topBar: 'from-orange-600 via-amber-400 to-orange-500',
      glow: 'from-orange-500/20 via-transparent to-transparent',
      border: 'border-2 border-orange-500/40 hover:border-orange-400 shadow-xl shadow-orange-950/30',
      cardBackground: 'bg-[#24130b]',
      bars: [38, 48, 56, 60, 68, 74, 78, 85, 88, 92],
      barColor: 'bg-orange-400',
      efficiencyLabelEs: '⚡ NIVEL 2 • ALTA EFICIENCIA',
      efficiencyLabelEn: '⚡ TIER 2 • HIGH EFFICIENCY',
      ribbonStyle:
        'bg-gradient-to-l from-orange-500 via-amber-400 to-orange-500 text-[#020617]',
      isTopEfficiency: false,
      imageFrame: 'border-orange-300/50 shadow-orange-500/20',
      codeNameColor: 'text-orange-300',
      nameHoverColor: 'group-hover:text-orange-300',
      chipStyles: [
        'bg-orange-500/15 border-orange-400/40 text-orange-200',
        'bg-amber-500/15 border-amber-400/40 text-amber-200',
        'bg-orange-300/10 border-orange-300/30 text-orange-100',
        'bg-white/10 border-white/25 text-[#f8fafc]',
      ],
      chartBorder: 'border-orange-400/20',
      chartBackground: 'bg-[#170b06]',
      chartIconColor: 'text-orange-300',
      instrumentColor: 'text-orange-300',
      metricColors: ['text-[#fdba74]', 'text-[#fde68a]', 'text-[#f8fafc]'],
      checkColor: 'text-orange-300',
      shieldColor: 'text-amber-300',
      detailButtonStyle: 'border-orange-300/40 bg-orange-950/70 text-orange-100 hover:bg-orange-900',
      buyButtonStyle:
        'bg-gradient-to-r from-orange-500 to-amber-400 text-[#020617] shadow-orange-500/20 hover:from-orange-400 hover:to-amber-300',
    },
    {
      botIdentifier: 'pulsar',
      imageSrc: '/pulsar.jpg',
      topBar: 'from-white via-slate-300 to-white',
      glow: 'from-white/10 via-transparent to-transparent',
      border: 'border-2 border-white/45 hover:border-white shadow-2xl shadow-white/10',
      cardBackground: 'bg-[#080808]',
      bars: [45, 58, 62, 74, 79, 86, 84, 93, 96, 100],
      barColor: 'bg-white',
      efficiencyLabelEs: '★ EL MÁS EFICIENTE • MÁXIMA EFICIENCIA',
      efficiencyLabelEn: '★ MOST EFFICIENT • TOP EFFICIENCY',
      ribbonStyle: 'bg-[#ffffff] text-[#000000]',
      isTopEfficiency: true,
      imageFrame: 'border-white/45 shadow-white/10',
      codeNameColor: 'text-[#fcd34d]',
      nameHoverColor: 'group-hover:text-[#fcd34d]',
      chipStyles: [
        'bg-white/10 border-white/30 text-[#f8fafc]',
        'bg-slate-300/10 border-slate-300/30 text-[#e2e8f0]',
        'bg-white/5 border-white/20 text-[#e2e8f0]',
        'bg-white/10 border-white/30 text-[#f8fafc]',
      ],
      chartBorder: 'border-white/20',
      chartBackground: 'bg-black',
      chartIconColor: 'text-white',
      instrumentColor: 'text-white',
      metricColors: ['text-[#f8fafc]', 'text-[#e2e8f0]', 'text-[#f8fafc]'],
      checkColor: 'text-white',
      shieldColor: 'text-slate-200',
      detailButtonStyle: 'border-white/30 bg-white/10 text-[#f8fafc] hover:bg-white/20',
      buyButtonStyle:
        'bg-gradient-to-r from-white to-slate-300 text-black shadow-white/10 hover:from-slate-100 hover:to-white',
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
                ? 'Nuestros 3 bots exclusivos — Proton, Nova y Pulsar (escalonados en eficiencia hasta Pulsar, nuestro algoritmo más eficiente) — están listos para operar futuros con perfiles para Lucid Trading, My Funded Futures (MFFU), Tradeify y Cuentas Reales.'
                : 'Our 3 exclusive bots — Proton, Nova, and Pulsar (scaled in efficiency up to Pulsar, our most efficient flagship algorithm) — are ready to trade futures with profiles for Lucid Trading, My Funded Futures (MFFU), Tradeify, and Live Accounts.'}
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
            const botIdentity = `${bot.id} ${bot.name} ${bot.codeName}`.toLowerCase();
            const theme =
              cardThemes.find(({ botIdentifier }) => botIdentity.includes(botIdentifier)) ??
              cardThemes[index % cardThemes.length];
            return (
              <Card
                key={bot.id}
                className={`group relative p-7 flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-2 ${theme.cardBackground} overflow-hidden ${theme.border}`}
              >
                {/* Resplandor interno y barra superior metálica */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow}`}
                />
                <div
                  className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${theme.topBar}`}
                />

                <div
                  className={`absolute top-1.5 right-0 ${theme.ribbonStyle} font-black text-[10px] tracking-wider uppercase px-3.5 py-1 rounded-bl-xl shadow-lg flex items-center gap-1`}
                >
                  {theme.isTopEfficiency && <Flame className="h-3 w-3 fill-black" />}
                  {lang === 'es' ? theme.efficiencyLabelEs : theme.efficiencyLabelEn}
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-start justify-between gap-2 pt-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border shadow-lg group-hover:scale-105 transition-transform ${theme.imageFrame}`}
                      >
                        <img
                          src={theme.imageSrc}
                          alt={`Logo de ${bot.name}`}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3
                          className={`text-2xl font-black text-[#f8fafc] ${theme.nameHoverColor} transition-colors`}
                        >
                          Bot {bot.name}
                        </h3>
                        <div className={`text-[11px] font-mono ${theme.codeNameColor}`}>
                          {bot.codeName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chips de Compatibilidad (Lucid Trading, MFFU, Tradeify, Real) */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      'Lucid Trading',
                      'MFFU',
                      'Tradeify',
                      lang === 'es' ? 'Cuenta Real (Live)' : 'Live Account',
                    ].map((label, chipIndex) => (
                      <span
                        key={label}
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${theme.chipStyles[chipIndex]}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-[#cbd5e1] leading-relaxed min-h-[44px]">
                    {bot.shortDescription}
                  </p>

                  {/* Mini Gráfico Visual de Curva de Backtesting */}
                  <div
                    className={`rounded-2xl border ${theme.chartBorder} ${theme.chartBackground} p-4 space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#94a3b8] uppercase flex items-center gap-1">
                        <TrendingUp className={`h-3 w-3 ${theme.chartIconColor}`} />
                        {lang === 'es' ? 'Curva Backtesting Histórico*' : 'Historical Backtest Curve*'}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${theme.instrumentColor}`}>
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

                    <div
                      className={`grid grid-cols-3 gap-2 pt-2 border-t ${theme.chartBorder} text-center`}
                    >
                      <div>
                        <div className="text-[10px] uppercase text-[#94a3b8]">Win Rate (BT)</div>
                        <div className={`text-base font-black font-mono ${theme.metricColors[0]}`}>
                          {bot.winRatePercent}%
                        </div>
                      </div>
                      <div className={`border-x ${theme.chartBorder}`}>
                        <div className="text-[10px] uppercase text-[#94a3b8]">Profit Factor</div>
                        <div className={`text-base font-black font-mono ${theme.metricColors[1]}`}>
                          {bot.profitFactor}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-[#94a3b8]">Freno DD</div>
                        <div className={`text-base font-black font-mono ${theme.metricColors[2]}`}>
                          {formatUsd(bot.maxDrawdownUsd)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Características para Fondeo y Real */}
                  <div className="space-y-1.5 pt-1">
                    <ul className="text-xs text-[#cbd5e1] space-y-1.5">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${theme.checkColor}`} />
                        <span>
                          {lang === 'es'
                            ? 'Perfiles preconfigurados para Lucid Trading, MFFU y Tradeify'
                            : 'Pre-configured profiles for Lucid Trading, MFFU & Tradeify'}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${theme.checkColor}`} />
                        <span>
                          {lang === 'es'
                            ? 'Apto para Cuentas Reales (Live) y Cuentas Fondeadas'
                            : 'Ready for Personal Live & Funded Accounts'}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ShieldCheck className={`h-4 w-4 shrink-0 ${theme.shieldColor}`} />
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
                    <div className="text-[10px] uppercase font-bold text-[#94a3b8]">
                      {lang === 'es' ? 'Suscripción Mensual' : 'Monthly Subscription'}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#f8fafc] font-mono">
                        {formatUsd(bot.monthlyPriceUsd)}
                      </span>
                      <span className="text-xs text-[#94a3b8]">
                        {lang === 'es' ? '/ mes' : '/ mo'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/catalog/${bot.id}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className={`text-xs font-semibold ${theme.detailButtonStyle}`}
                      >
                        {lang === 'es' ? 'Ver Detalles' : 'View Details'}
                      </Button>
                    </Link>
                    <Link to={`/catalog/${bot.id}?intent=buy`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className={`text-xs font-bold shadow-lg ${theme.buyButtonStyle}`}
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
