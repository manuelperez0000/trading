import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Flame,
  Lock,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

interface ProfilePreset {
  id: string;
  name: string;
  tag: string;
  badge: string;
  accentColor: string;
  cardBgGlow: string;
  borderGlow: string;
  iconBg: string;
  icon: React.ReactNode;
  shortDesc: string;
  keyMetricLabel: string;
  keyMetricValue: string;
  dailyStopRule: string;
  trailingRule: string;
  sessionClose: string;
  accountSizes: string;
  highlightNote: string;
}

export const LandingPropFirms: React.FC = () => {
  const { lang } = useI18n();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('lucid');

  const profiles: ProfilePreset[] = [
    {
      id: 'lucid',
      name: 'Lucid Trading',
      tag: lang === 'es' ? 'EVALUACIÓN & FONDEO' : 'FUNDING EVALUATION',
      badge: lang === 'es' ? '★ Perfil Preconfigurado' : '★ Pre-Configured',
      accentColor: 'from-amber-400 via-yellow-300 to-amber-500',
      cardBgGlow: 'from-amber-500/20 via-amber-500/5 to-transparent',
      borderGlow: 'border-amber-400 shadow-amber-500/25',
      iconBg: 'bg-amber-500/20 border-amber-400/50 text-amber-300',
      icon: <Flame className="h-6 w-6 text-amber-400" />,
      shortDesc:
        lang === 'es'
          ? 'Plantilla calibrada para límites diarios, trailing y consistencia.'
          : 'Calibrated preset for daily limits, trailing & consistency.',
      keyMetricLabel: lang === 'es' ? 'Corte de Seguridad' : 'Safety Cutoff',
      keyMetricValue: '75% Max DD',
      dailyStopRule: lang === 'es' ? 'Freno automático al 75% del límite diario' : 'Auto-stop at 75% of daily limit',
      trailingRule: lang === 'es' ? 'Trailing Stop dinámico que asegura el colchón' : 'Dynamic Trailing Stop locking buffer',
      sessionClose: '15:55 EST (Auto-Flatten)',
      accountSizes: '$25k • $50k • $100k • $150k',
      highlightNote:
        lang === 'es'
          ? 'Evita picos de lotaje y detiene el bot automáticamente antes de comprometer el drawdown diario en Lucid Trading.'
          : 'Prevents lot-size spikes and automatically halts the bot before compromising Lucid Trading daily drawdown.',
    },
    {
      id: 'mffu',
      name: 'My Funded Futures (MFFU)',
      tag: lang === 'es' ? 'EVALUACIÓN & FONDEO' : 'FUNDING EVALUATION',
      badge: lang === 'es' ? '★ Perfil Preconfigurado' : '★ Pre-Configured',
      accentColor: 'from-emerald-400 via-teal-300 to-emerald-500',
      cardBgGlow: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      borderGlow: 'border-emerald-400 shadow-emerald-500/25',
      iconBg: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300',
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
      shortDesc:
        lang === 'es'
          ? 'Control estricto de pérdida diaria, EOD trailing y protección de racha.'
          : 'Strict daily loss control, EOD trailing & automated streak protection.',
      keyMetricLabel: lang === 'es' ? 'Velocidad Freno' : 'Stop Speed',
      keyMetricValue: '< 35 ms',
      dailyStopRule: lang === 'es' ? 'Bloqueo instantáneo en < 35 ms al tocar tope' : 'Instant lock in < 35 ms when limit hits',
      trailingRule: lang === 'es' ? 'Escalado progresivo según balance alcanzado' : 'Progressive scaling by equity buffer',
      sessionClose: '15:50 EST (Auto-Flatten)',
      accountSizes: '$50k • $100k • $150k (Starter / Expert)',
      highlightNote:
        lang === 'es'
          ? 'Ajusta la frecuencia de órdenes y el tamaño de posición en apertura de NY para cumplir con las métricas de consistencia de My Funded Futures (MFFU).'
          : 'Adjusts order frequency and position sizing during NY open to comply with My Funded Futures (MFFU) consistency metrics.',
    },
    {
      id: 'tradeify',
      name: 'Tradeify',
      tag: lang === 'es' ? 'EVALUACIÓN & FONDEO' : 'FUNDING EVALUATION',
      badge: lang === 'es' ? '★ Perfil Preconfigurado' : '★ Pre-Configured',
      accentColor: 'from-sky-400 via-cyan-300 to-sky-500',
      cardBgGlow: 'from-sky-500/20 via-sky-500/5 to-transparent',
      borderGlow: 'border-sky-400 shadow-sky-500/25',
      iconBg: 'bg-sky-500/20 border-sky-400/50 text-sky-300',
      icon: <Zap className="h-6 w-6 text-sky-400" />,
      shortDesc:
        lang === 'es'
          ? 'Gestión automática de horarios, filtro de noticias y riesgo por trade.'
          : 'Automated schedule, news filter & per-trade risk control.',
      keyMetricLabel: lang === 'es' ? 'Protección Ganancia' : 'Profit Lock',
      keyMetricValue: '+15 Ticks BE',
      dailyStopRule: lang === 'es' ? 'Tope diario en USD + límite de 3 stops seguidos' : 'Daily USD cap + 3 consecutive stops limit',
      trailingRule: lang === 'es' ? 'Break-even automático a partir de +15 ticks' : 'Automated break-even after +15 ticks',
      sessionClose: '15:55 EST (Auto-Flatten)',
      accountSizes: '$50k • $100k • $150k',
      highlightNote:
        lang === 'es'
          ? 'Ideal para superar evaluaciones y operar cuentas fondeadas en Tradeify manteniendo una curva de equidad limpia y sin sobresaltos.'
          : 'Ideal for passing evaluations and running funded accounts on Tradeify while keeping a smooth, disciplined equity curve.',
    },
    {
      id: 'live',
      name: lang === 'es' ? 'Cuentas Reales' : 'Live Accounts',
      tag: lang === 'es' ? 'CAPITAL PROPIO (LIVE)' : 'PERSONAL LIVE CAPITAL',
      badge: lang === 'es' ? '★ Piloto Automático' : '★ Autopilot Mode',
      accentColor: 'from-amber-400 via-orange-400 to-amber-500',
      cardBgGlow: 'from-orange-500/20 via-amber-500/5 to-transparent',
      borderGlow: 'border-amber-400 shadow-amber-500/25',
      iconBg: 'bg-amber-500/20 border-amber-400/50 text-amber-300',
      icon: <TrendingUp className="h-6 w-6 text-amber-400" />,
      shortDesc:
        lang === 'es'
          ? 'Opera tu propio capital real en automático con riesgo diario acotado.'
          : 'Trade your own live capital on autopilot with bounded daily risk.',
      keyMetricLabel: lang === 'es' ? 'Custodia' : 'Custody',
      keyMetricValue: '100% Tu Cuenta',
      dailyStopRule: lang === 'es' ? '100% personalizable en USD o % de tu cuenta' : '100% customizable in USD or account %',
      trailingRule: lang === 'es' ? 'Captura de tendencias con protección de ganancias' : 'Trend capture with profit locking',
      sessionClose: lang === 'es' ? 'Configurable por el trader' : 'Configurable by trader',
      accountSizes: lang === 'es' ? 'Micros (MNQ/MES) y E-Mini (NQ/ES)' : 'Micros (MNQ/MES) & E-Mini (NQ/ES)',
      highlightNote:
        lang === 'es'
          ? 'Pensado para traders con cuenta propia que desean automatizar su sistema sin estar horas frente al monitor.'
          : 'Designed for live account holders who want to automate execution without sitting at the screen for hours.',
    },
    {
      id: 'all',
      name: lang === 'es' ? 'Para Todos' : 'Open to All',
      tag: lang === 'es' ? 'ALUMNOS Y EXTERNOS' : 'STUDENTS & ANY TRADER',
      badge: lang === 'es' ? '★ Sin Requisitos' : '★ Open Access',
      accentColor: 'from-purple-400 via-fuchsia-300 to-indigo-500',
      cardBgGlow: 'from-purple-500/20 via-purple-500/5 to-transparent',
      borderGlow: 'border-purple-400 shadow-purple-500/25',
      iconBg: 'bg-purple-500/20 border-purple-400/50 text-purple-300',
      icon: <Users className="h-6 w-6 text-purple-400" />,
      shortDesc:
        lang === 'es'
          ? 'Suscripción abierta a estudiantes de la academia y público general.'
          : 'Subscription open to academy students and the general public.',
      keyMetricLabel: lang === 'es' ? 'Instalación' : 'Setup Time',
      keyMetricValue: '< 5 Minutos',
      dailyStopRule: lang === 'es' ? 'Plantillas listas para cargar en 1 clic' : 'Templates ready to load in 1 click',
      trailingRule: lang === 'es' ? 'Sin necesidad de programar ni compilar código' : 'No coding or compiling required',
      sessionClose: lang === 'es' ? 'Control remoto desde celular o web' : 'Remote control from phone or web',
      accountSizes: lang === 'es' ? 'Todo nivel de experiencia' : 'All experience levels',
      highlightNote:
        lang === 'es'
          ? 'No necesitas ser estudiante previo de la academia: te suscribes, descargas el bot y lo activas hoy mismo.'
          : 'No prior academy enrollment needed: subscribe, download the bot, and activate it on your account today.',
    },
  ];

  const activeProfile =
    profiles.find((p) => p.id === selectedProfileId) ?? profiles[0];

  return (
    <section id="prop-firms" className="py-24 relative overflow-hidden">
      {/* Efectos de Iluminación Ambiental de Fondo */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[960px] h-[460px] rounded-full bg-amber-500/12 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-10 left-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-[130px]" />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado Principal de Alto Impacto */}
        <div className="text-center max-w-4xl mx-auto space-y-5 mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-300 shadow-lg shadow-amber-500/15">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>
              {lang === 'es'
                ? 'PERFILES PRECONFIGURADOS • LUCID TRADING • MY FUNDED FUTURES (MFFU) • TRADEIFY • CUENTAS REALES'
                : 'PRE-CONFIGURED PROFILES • LUCID TRADING • MY FUNDED FUTURES (MFFU) • TRADEIFY • LIVE ACCOUNTS'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {lang === 'es' ? (
              <>
                Diseñado para Cumplir las Reglas de{' '}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  Cuentas de Fondeo y Proteger tu Capital Real
                </span>
              </>
            ) : (
              <>
                Engineered to Respect{' '}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  Funded Account Rules & Protect Live Capital
                </span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl mx-auto">
            {lang === 'es'
              ? 'Ya seas estudiante de Trading Life Academy o cualquier trader que quiera suscribirse, nuestros bots incluyen perfiles calibrados para superar evaluaciones en Lucid Trading, My Funded Futures (MFFU) y Tradeify, o gestionar tu cuenta real con disciplina matemática.'
              : 'Whether you are a Trading Life Academy student or any trader looking to subscribe, our bots include calibrated profiles to pass evaluations on Lucid Trading, My Funded Futures (MFFU), and Tradeify, or manage your live account with mathematical discipline.'}
          </p>
        </div>

        {/* 5 Tarjetas Llamativas e Interactivas (Pulsar, Proton, Nova, Real, Todos) */}
        <div className="mb-10">
          <div className="text-center text-xs font-semibold uppercase tracking-widest text-amber-400 mb-5 flex items-center justify-center gap-2">
            <Sliders className="h-3.5 w-3.5 animate-spin-slow" />
            <span>
              {lang === 'es'
                ? 'Selecciona una tarjeta para ver cómo el bot protege tu cuenta:'
                : 'Select a card to inspect how the bot shields your account:'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {profiles.map((item) => {
              const isSelected = item.id === selectedProfileId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedProfileId(item.id)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                    isSelected
                      ? `bg-slate-900 border-2 ${item.borderGlow} shadow-2xl -translate-y-1.5`
                      : 'border-slate-800/90 bg-slate-900/70 hover:border-amber-500/50 hover:bg-slate-900 hover:-translate-y-1 hover:shadow-xl'
                  }`}
                >
                  {/* Resplandor interno degradado de cada tarjeta */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.cardBgGlow} transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
                    }`}
                  />

                  {/* Barra superior metálica */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${item.accentColor}`}
                  />

                  <div className="relative z-10 space-y-3 w-full">
                    {/* Fila superior: Icono + Indicador Live */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg transition-transform duration-300 group-hover:scale-110 ${item.iconBg}`}
                      >
                        {item.icon}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-950/80 text-slate-400 border-slate-800'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        READY
                      </span>
                    </div>

                    {/* Nombre y categoría */}
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400/90">
                        {item.tag}
                      </div>
                      <div className="text-xl font-black text-white tracking-tight mt-0.5 group-hover:text-amber-200 transition-colors">
                        {item.name}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                      {item.shortDesc}
                    </p>
                  </div>

                  {/* Mini Caja Técnica Inferior dentro de la Card */}
                  <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/80 w-full space-y-2">
                    <div className="flex items-center justify-between rounded-xl bg-slate-950/90 border border-slate-800/90 px-3 py-2">
                      <span className="text-[10px] text-slate-400">
                        {item.keyMetricLabel}
                      </span>
                      <span className="text-xs font-mono font-black text-emerald-400">
                        {item.keyMetricValue}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span
                        className={
                          isSelected ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-300'
                        }
                      >
                        {item.badge}
                      </span>
                      <ArrowRight
                        className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-1 ${
                          isSelected ? 'text-amber-400' : 'text-slate-500'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Central Interactivo: Consola de Blindaje del Perfil Seleccionado */}
        <div className="relative mb-14">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-amber-500/25 via-emerald-500/15 to-sky-500/25 blur-lg opacity-80" />

          <Card className="relative rounded-3xl border-2 border-amber-500/40 bg-slate-900/95 p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              {/* Columna Izquierda del Panel: Parámetros del Perfil Seleccionado */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 border border-amber-500/40 shadow-lg">
                      {activeProfile.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-white">
                          {lang === 'es' ? 'Blindaje Activo:' : 'Active Shield:'}{' '}
                          <span className="text-amber-400">{activeProfile.name}</span>
                        </h3>
                        <Badge variant="emerald" pulse className="text-[10px]">
                          PROTECCIÓN ON
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {activeProfile.highlightNote}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid de 4 Parámetros Técnicos del Perfil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-emerald-500/30 bg-slate-950/90 p-3.5 flex items-start gap-3">
                    <ShieldAlert className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        {lang === 'es' ? 'Freno de Pérdida Diaria' : 'Daily Loss Stop'}
                      </div>
                      <div className="text-slate-100 font-semibold mt-0.5">
                        {activeProfile.dailyStopRule}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-slate-950/90 p-3.5 flex items-start gap-3">
                    <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        {lang === 'es' ? 'Protección Trailing / Ganancia' : 'Trailing / Profit Lock'}
                      </div>
                      <div className="text-slate-100 font-semibold mt-0.5">
                        {activeProfile.trailingRule}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-sky-500/30 bg-slate-950/90 p-3.5 flex items-start gap-3">
                    <Clock className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                        {lang === 'es' ? 'Cierre Fin de Sesión' : 'End-of-Session Close'}
                      </div>
                      <div className="text-slate-100 font-mono font-semibold mt-0.5">
                        {activeProfile.sessionClose}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-500/30 bg-slate-950/90 p-3.5 flex items-start gap-3">
                    <Cpu className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                        {lang === 'es' ? 'Tamaños y Escalado' : 'Account Sizes & Scaling'}
                      </div>
                      <div className="text-slate-100 font-mono font-semibold mt-0.5">
                        {activeProfile.accountSizes}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha del Panel: Medidor Visual de Blindaje Anti-Quiebra */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    {lang === 'es'
                      ? 'Medidor de Blindaje de Drawdown Diario'
                      : 'Daily Drawdown Shield Meter'}
                  </span>
                  <Badge variant="amber" className="text-[10px] font-mono">
                    AUTO-LOCK
                  </Badge>
                </div>

                {/* Barra visual comparativa */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-emerald-400">
                      {lang === 'es' ? 'Corte Seguro del Bot (75%)' : 'Bot Safe Cutoff (75%)'}
                    </span>
                    <span className="text-rose-400">
                      {lang === 'es' ? 'Límite de Quiebra (100%)' : 'Account Breach Limit (100%)'}
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex p-0.5">
                    <div className="h-full w-3/4 rounded-l-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 flex items-center justify-end pr-2">
                      <span className="text-[9px] font-black text-slate-950 uppercase">
                        STOP BOT
                      </span>
                    </div>
                    <div className="h-full w-1/4 rounded-r-full bg-rose-500/25 border-l-2 border-amber-300 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-rose-300">
                        ZONA SALVADA
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {lang === 'es'
                      ? 'El bot se detiene antes de tocar la línea roja de descalificación, manteniendo tu cuenta viva para el siguiente día operativo.'
                      : 'The bot halts before touching the red disqualification line, keeping your account alive for the next trading session.'}
                  </p>
                </div>

                {/* Comparativa rápida Manual vs Bot */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5">
                    <div className="font-bold text-rose-300 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>{lang === 'es' ? 'Trading Manual' : 'Manual Trading'}</span>
                    </div>
                    <div className="text-slate-400 mt-1 text-[10px]">
                      {lang === 'es'
                        ? 'Sobre-opera por emoción y quema la prueba en 1 día.'
                        : 'Over-trades on emotion and blows the evaluation.'}
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-2.5">
                    <div className="font-bold text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{lang === 'es' ? 'Con Bot TLA' : 'With TLA Bot'}</span>
                    </div>
                    <div className="text-slate-300 mt-1 text-[10px]">
                      {lang === 'es'
                        ? 'Corta pérdidas a tiempo y opera sin estrés.'
                        : 'Cuts losses on time and trades stress-free.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 3 Tarjetas de Pilares con Mini-Widgets Visuales Llamativos */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-12">
          {/* Card 1: Escudo Diario */}
          <Card className="group relative p-7 border-2 border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/15 overflow-hidden flex flex-col justify-between space-y-5">
            <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-lg">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <Badge variant="emerald" pulse className="text-[10px] font-mono">
                    HARD DAILY STOP
                  </Badge>
                  <div className="text-[11px] font-mono font-bold text-emerald-400 mt-1">
                    ⚡ &lt; 35 ms Reacción
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">
                {lang === 'es'
                  ? 'Escudo Automático Contra Pérdida Diaria'
                  : 'Automated Daily Loss Shield'}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'es'
                  ? 'El 90% de las cuentas de fondeo se pierden en un solo mal día por intentar "recuperar" manualmente. Nuestro bot liquida la posición al instante y bloquea nuevas entradas hasta el día siguiente.'
                  : '90% of funded accounts are lost in a single bad day due to manual revenge trading. Our bot flattens positions immediately and locks new entries until the next session.'}
              </p>

              {/* Mini-Widget Visual dentro de la Card */}
              <div className="rounded-xl border border-emerald-500/25 bg-slate-950/90 p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">ESTADO DE PROTECCIÓN:</span>
                  <span className="text-emerald-400 font-bold">● CORTAFUEGOS ACTIVO</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="rounded bg-slate-900 px-2 py-1 text-slate-300">
                    Límite: <strong className="text-white">Configurable</strong>
                  </div>
                  <div className="rounded bg-emerald-500/15 px-2 py-1 text-emerald-300">
                    Acción: <strong>Auto-Lock 24h</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] relative z-10">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                {lang === 'es' ? 'Protege Fondeo y Cuenta Real' : 'Protects Funded & Live'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">Zero-Breach</span>
            </div>
          </Card>

          {/* Card 2: Liquidación Fin de Sesión */}
          <Card className="group relative p-7 border-2 border-amber-500/35 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15 overflow-hidden flex flex-col justify-between space-y-5">
            <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-lg">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <Badge variant="amber" className="text-[10px] font-mono">
                    AUTO-FLATTEN EOD
                  </Badge>
                  <div className="text-[11px] font-mono font-bold text-amber-400 mt-1">
                    🕒 15:55 EST Exacto
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">
                {lang === 'es'
                  ? 'Liquidación Automática Antes del Cierre'
                  : 'Automated End-of-Session Flatten'}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'es'
                  ? 'Dejar una operación abierta fuera de horario invalida pruebas en Lucid Trading, My Funded Futures (MFFU) o Tradeify. El bot cierra todas las órdenes pendientes y posiciones abiertas minutos antes del cierre del mercado.'
                  : 'Leaving a trade open after hours voids evaluations in Lucid Trading, My Funded Futures (MFFU), or Tradeify. The bot closes all pending orders and open positions minutes before market close.'}
              </p>

              {/* Mini-Widget Visual de Reloj de Cierre */}
              <div className="rounded-xl border border-amber-500/25 bg-slate-950/90 p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">CRONÓMETRO DE SESIÓN:</span>
                  <span className="text-amber-400 font-bold">● 0 POSICIONES NOCTURNAS</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="rounded bg-slate-900 px-2 py-1 text-slate-300">
                    Cierre: <strong className="text-white">15:55 EST</strong>
                  </div>
                  <div className="rounded bg-amber-500/15 px-2 py-1 text-amber-300">
                    Órdenes: <strong>100% Cerradas</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] relative z-10">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                {lang === 'es' ? 'Cumplimiento Intradía Total' : 'Full Intraday Compliance'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">Auto-Timer</span>
            </div>
          </Card>

          {/* Card 3: Pausa en Noticias y Control Móvil */}
          <Card className="group relative p-7 border-2 border-sky-500/30 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-500/15 overflow-hidden flex flex-col justify-between space-y-5">
            <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/40 text-sky-300 shadow-lg">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <Badge variant="sky" className="text-[10px] font-mono">
                    NEWS & MOBILE SYNC
                  </Badge>
                  <div className="text-[11px] font-mono font-bold text-sky-400 mt-1">
                    📱 Control Web 24/7
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">
                {lang === 'es'
                  ? 'Filtro de Noticias y Pausa desde tu Móvil'
                  : 'News Filter & Mobile Remote Pause'}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'es'
                  ? 'Pausa preventiva durante anuncios de alta volatilidad (FOMC, CPI, NFP). Además, puedes pausar o reanudar tu bot en 1 clic desde tu teléfono móvil sin estar frente a la computadora.'
                  : 'Preventive pause during high-volatility releases (FOMC, CPI, NFP). Plus, pause or resume your bot in 1 click from your mobile phone away from your desk.'}
              </p>

              {/* Mini-Widget Visual de Control Móvil */}
              <div className="rounded-xl border border-sky-500/25 bg-slate-950/90 p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">SINCRONIZACIÓN NUBE:</span>
                  <span className="text-sky-400 font-bold flex items-center gap-1">
                    <Radio className="h-3 w-3 animate-pulse" /> CONECTADO
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="rounded bg-slate-900 px-2 py-1 text-slate-300">
                    Noticias: <strong className="text-white">Auto-Pausa</strong>
                  </div>
                  <div className="rounded bg-sky-500/15 px-2 py-1 text-sky-300">
                    Panel Móvil: <strong>1-Clic ON/OFF</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] relative z-10">
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                {lang === 'es' ? 'Supervisión desde cualquier lugar' : 'Supervise from anywhere'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">Cloud Sync</span>
            </div>
          </Card>
        </div>

        {/* CTA Directo de la Sección + Nota Legal de Uso Nominativo */}
        <div className="flex flex-col items-center space-y-4">
          <Link to="/catalog">
            <Button
              variant="primary"
              size="lg"
              className="text-sm font-bold shadow-xl shadow-amber-500/25"
            >
              <Sparkles className="h-4 w-4" />
              {lang === 'es'
                ? 'Elegir mi Bot para Fondeo o Cuenta Real'
                : 'Choose My Bot for Funded or Live Account'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>

          <p className="text-center text-[11px] text-slate-500 max-w-3xl mx-auto leading-relaxed">
            {lang === 'es'
              ? '*Nota de compatibilidad técnica (Uso Nominativo): Las menciones a Lucid Trading, My Funded Futures (MFFU) y Tradeify indican únicamente que el software incluye plantillas de parámetros de riesgo adaptables a las reglas técnicas de dichas evaluaciones. Trading Life Academy es una entidad independiente sin afiliación comercial con ellas.'
              : '*Technical compatibility notice (Nominative Fair Use): References to Lucid Trading, My Funded Futures (MFFU), and Tradeify indicate solely that the software includes risk parameter templates adaptable to those evaluation rules. Trading Life Academy is an independent entity with no commercial affiliation with them.'}
          </p>
        </div>
      </div>
    </section>
  );
};
