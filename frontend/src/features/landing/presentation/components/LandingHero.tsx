import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Bot,
  Cpu,
  KeyRound,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingHero: React.FC = () => {
  const { lang } = useI18n();

  // Simulador interactivo del bot en tiempo real
  const [ticksCount, setTicksCount] = useState(84);
  const [tradesExecuted, setTradesExecuted] = useState(5);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateTrade = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const addedTicks = Math.floor(10 + Math.random() * 14);
      setTicksCount((prev) => prev + addedTicks);
      setTradesExecuted((prev) => prev + 1);
      setIsSimulating(false);
    }, 350);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28">
      {/* Resplandor Ambiental de Oro Imperial */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[480px] w-[820px] rounded-full bg-amber-500/15 blur-[130px]" />
      <div className="pointer-events-none absolute top-20 right-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-[110px]" />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Columna Izquierda: Propuesta Comercial Clara + Blindaje Legal */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-sm shadow-amber-500/20">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>
                {lang === 'es'
                  ? 'Bots de Trading por Suscripción • Para Estudiantes y Traders Independientes'
                  : 'Subscription Trading Bots • For Academy Students & Independent Traders'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl/tight font-extrabold tracking-tight text-white">
              {lang === 'es' ? (
                <>
                  Bots Automatizados para Superar{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Cuentas de Fondeo y Operar Cuentas Reales.
                  </span>
                </>
              ) : (
                <>
                  Automated Trading Bots for{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Funded Evaluations & Live Accounts.
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {lang === 'es'
                ? 'Suscríbete a nuestros algoritmos de Order Flow y ejecuta tu operativa en piloto automático. Cuentan con perfiles de riesgo calibrados para las reglas de evaluación de Lucid Trading, My Funded Futures (MFFU) y Tradeify, así como para operar en Cuentas Reales sin errores emocionales. Abierto a estudiantes de la academia y a cualquier trader.'
                : 'Subscribe to our Order Flow algorithms and run your trading on autopilot. Features risk profiles calibrated for Lucid Trading, My Funded Futures (MFFU), and Tradeify evaluation rules, as well as personal Live Accounts without emotional mistakes. Open to academy students and any independent trader.'}
            </p>

            {/* Destacado de Público Objetivo y Modelo Software Non-Custodial */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto lg:mx-0 text-left">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-slate-200 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block">
                    {lang === 'es'
                      ? 'Perfiles para Lucid Trading, MFFU, Tradeify y Live'
                      : 'Profiles for Lucid Trading, MFFU, Tradeify & Live'}
                  </strong>
                  <span className="text-slate-300 text-[11px]">
                    {lang === 'es'
                      ? 'Parámetros preconfigurados para respetar límites de pérdida diaria, horarios y consistencia.'
                      : 'Pre-configured parameters to respect daily loss limits, schedules, and consistency.'}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-slate-200 flex items-start gap-2.5">
                <Users className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 block">
                    {lang === 'es' ? '100% En Tu Propia Cuenta' : '100% On Your Own Account'}
                  </strong>
                  <span className="text-slate-300 text-[11px]">
                    {lang === 'es'
                      ? 'Tú instalas el bot en tu equipo. No necesitas experiencia previa ni entregar tu capital a terceros.'
                      : 'You install the bot on your machine. No coding needed and you never hand capital to third parties.'}
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs Principales */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
              <a href="#pricing" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-sm font-bold shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 transition-all"
                >
                  <Zap className="h-4 w-4" />
                  {lang === 'es' ? 'Ver Planes de Suscripción' : 'View Subscription Plans'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </a>

              <Link to="/catalog" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full justify-center text-sm"
                >
                  <Play className="h-4 w-4 text-amber-400" />
                  {lang === 'es' ? 'Explorar Catálogo de Bots' : 'Explore Bots Catalog'}
                </Button>
              </Link>
            </div>

            {/* Badges de Confianza y Seguridad */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>{lang === 'es' ? 'Hard-Stop de Drawdown Diario' : 'Daily Drawdown Hard-Stop'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-amber-400" />
                <span>{lang === 'es' ? 'Activación Inmediata por Licencia' : 'Instant License Activation'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-sky-400" />
                <span>{lang === 'es' ? 'Control de Pausa desde el Móvil' : 'Mobile Remote Pause Control'}</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Demostración Interactiva del Bot Operando */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-sky-500/20 blur-xl opacity-75" />

            <Card className="relative p-6 border-2 border-amber-500/40 bg-slate-900/95 shadow-2xl space-y-5">
              {/* Cabecera del Bot */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      Bot Pulsar V4 (Máxima Eficiencia)
                      <Badge variant="amber" className="text-[10px]">AUTO-TRADING</Badge>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {lang === 'es'
                        ? 'Perfiles: Lucid Trading • MFFU • Tradeify • Cuenta Live'
                        : 'Profiles: Lucid Trading • MFFU • Tradeify • Live Account'}
                    </div>
                  </div>
                </div>

                <Badge variant="emerald" pulse>
                  <Radio className="h-3 w-3 mr-1" />
                  BOT ACTIVO
                </Badge>
              </div>

              {/* Panel de Rendimiento de la Estrategia */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    {lang === 'es' ? 'Desempeño Técnico en Sesión (Backtest)' : 'Session Technical Performance (Backtest)'}
                  </div>
                  <Badge variant="emerald">{tradesExecuted} Trades</Badge>
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-emerald-400 tabular-nums">
                  +{ticksCount} Ticks Netos
                </div>
                <div className="mt-1 text-xs text-slate-300 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    {lang === 'es'
                      ? 'Trailing Stop y protección de pérdida diaria activos'
                      : 'Trailing Stop and daily loss protection active'}
                  </span>
                </div>
              </div>

              {/* Métricas Clave del Bot */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                  <div className="text-[10px] text-slate-400 uppercase">Win Rate (BT)</div>
                  <div className="mt-0.5 text-sm font-bold font-mono text-emerald-300">74.8%</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                  <div className="text-[10px] text-slate-400 uppercase">Profit Factor</div>
                  <div className="mt-0.5 text-sm font-bold font-mono text-sky-400">2.64</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                  <div className="text-[10px] text-slate-400 uppercase">Pausa Remota</div>
                  <div className="mt-0.5 text-sm font-bold font-mono text-amber-400">&lt; 35 ms</div>
                </div>
              </div>

              {/* Botón de Interacción Live para el Usuario */}
              <div className="pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center text-xs"
                  isLoading={isSimulating}
                  onClick={handleSimulateTrade}
                >
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  {lang === 'es'
                    ? 'Simular Ejecución Automática del Bot'
                    : 'Simulate Automated Bot Execution'}
                </Button>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Licencia SaaS Non-Custodial</span>
                <span className="text-amber-400/90">
                  {lang === 'es' ? '*Datos de backtesting histórico' : '*Historical backtest data'}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
