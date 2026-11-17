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
  Zap,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { formatUsd } from '@shared/utils/formatters';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingHero: React.FC = () => {
  const { lang } = useI18n();

  // Estado interactivo de la tarjeta de demostración de NinjaTrader en vivo
  const [sessionPnl, setSessionPnl] = useState(2840.5);
  const [ticksCount, setTicksCount] = useState(84);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateTrade = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const addedTicks = Math.floor(12 + Math.random() * 16);
      const addedDollars = addedTicks * 20; // En NQ cada tick son $5 por contrato x 4 contratos
      setTicksCount((prev) => prev + addedTicks);
      setSessionPnl((prev) => prev + addedDollars);
      setIsSimulating(false);
    }, 600);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28">
      {/* Resplandor ambiental de oro imperial y titanio */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[520px] bg-gradient-to-b from-amber-500/20 via-yellow-500/5 to-transparent blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute top-1/2 right-0 w-[400px] h-[400px] bg-sky-500/5 blur-[100px] rounded-full" />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Columna Izquierda: Copywriting de Alta Conversión */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-sm shadow-amber-500/20">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>
                {lang === 'es'
                  ? 'Ecosistema Algorítmico Oficial para NinjaTrader 8'
                  : 'Official NinjaTrader 8 Algorithmic Ecosystem'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl/tight font-extrabold tracking-tight text-white">
              {lang === 'es' ? (
                <>
                  Pasa tus Cuentas de Fondeo con Bots de Alta Frecuencia{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    sin Estrés Emocional.
                  </span>
                </>
              ) : (
                <>
                  Pass Your Prop Firm Evaluations with Automated Bots{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    with Zero Emotional Stress.
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {lang === 'es'
                ? 'Estrategias en C# NinjaScript basadas en Order Flow institucional, desequilibrios en Footprint y protección de Drawdown Diario hard-coded. Compatibles al 100% con Apex, Topstep y cuentas de futuros live.'
                : 'C# NinjaScript automated strategies based on institutional Order Flow, Footprint absorption, and hard-coded Daily Drawdown armor. 100% compliant with Apex, Topstep, and live futures accounts.'}
            </p>

            {/* CTAs Principales */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/catalog" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-sm font-bold shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 transition-all"
                >
                  <Zap className="h-4 w-4" />
                  {lang === 'es' ? 'Ver Bots y Comenzar Ahora' : 'Explore Bots & Get Access'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>

              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full justify-center text-sm"
                >
                  <Play className="h-4 w-4 text-amber-400" />
                  {lang === 'es' ? 'Cómo Funciona en 3 Pasos' : 'How it Works in 3 Steps'}
                </Button>
              </a>
            </div>

            {/* Badges de Confianza y Seguridad */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>{lang === 'es' ? 'Drawdown Armor Anti-Quiebra' : 'Anti-Blowout Drawdown Armor'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-amber-400" />
                <span>{lang === 'es' ? 'MachineID & HMAC Seguro' : 'Hardware Locked & HMAC'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-sky-400" />
                <span>{lang === 'es' ? 'NinjaTrader 8 64-bit' : 'NinjaTrader 8 64-bit'}</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Interactiva de Telemetría NinjaTrader en Vivo */}
          <div className="lg:col-span-5 relative">
            {/* Resplandor detrás de la tarjeta */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-sky-500/20 blur-xl opacity-75" />

            <Card className="relative p-6 border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl space-y-5">
              {/* Cabecera del Simulador */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Quantum OrderFlow Scalper V4</h2>
                    <div className="text-[11px] font-mono text-slate-400">
                      NinjaTrader 8 • Cuenta: Apex_PA_104920
                    </div>
                  </div>
                </div>

                <Badge variant="emerald" pulse>
                  <Radio className="h-3 w-3 animate-ping mr-1" />
                  OPERANDO EN VIVO
                </Badge>
              </div>

              {/* Panel de Resultado de Sesión */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    {lang === 'es' ? 'PnL Sesión en Curso (NY)' : 'Live Session PnL (NY)'}
                  </div>
                  <Badge variant="emerald">+{ticksCount} Ticks NQ</Badge>
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-emerald-400 tabular-nums">
                  {formatUsd(sessionPnl, true)}
                </div>
                <div className="mt-1 text-xs text-slate-300 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    {lang === 'es'
                      ? '5 operaciones ganadoras consecutivas en NQ 12-26'
                      : '5 consecutive winning trades on NQ 12-26'}
                  </span>
                </div>
              </div>

              {/* Métricas de Telemetría en Tiempo Real */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                  <div className="text-[10px] text-slate-400 uppercase">Win Rate</div>
                  <div className="mt-0.5 text-sm font-bold font-mono text-emerald-300">74.8%</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                  <div className="text-[10px] text-slate-400 uppercase">Latencia</div>
                  <div className="mt-0.5 text-sm font-bold font-mono text-sky-400">32 ms</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                  <div className="text-[10px] text-slate-400 uppercase">Kill-Switch</div>
                  <div className="mt-0.5 text-sm font-bold font-mono text-amber-400">Activo</div>
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
                    ? 'Probar Simulación de Entrada en Vivo'
                    : 'Test Live Trade Execution Signal'}
                </Button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                <span>Handshake HMAC-SHA256: VALIDADO</span>
                <span className="text-emerald-400">MachineID: WIN11-NT8-OK</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
