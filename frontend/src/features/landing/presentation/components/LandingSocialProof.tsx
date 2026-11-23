import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingSocialProof: React.FC = () => {
  const { lang } = useI18n();

  const useCases = [
    {
      title: lang === 'es' ? '1. Superar Pruebas de Fondeo' : '1. Passing Funded Evaluations',
      profile: lang === 'es' ? 'Traders de Evaluaciones ($25k a $250k)' : 'Evaluation Traders ($25k to $250k)',
      benefit: lang === 'es' ? 'Cero Violaciones por Emoción' : 'Zero Emotional Rule Breaches',
      botRecommended: 'QuantumOrderFlow Scalper V4',
      icon: <Award className="h-5 w-5 text-amber-400" />,
      text:
        lang === 'es'
          ? 'Ideal para quienes buscan superar pruebas de fondeo sin quemar la cuenta por sobreoperar. El bot ejecuta entradas precisas y se detiene automáticamente al alcanzar la meta o el límite diario permitido.'
          : 'Ideal for traders aiming to pass funding evaluations without blowing accounts from over-trading. The bot executes precise entries and automatically stops when hitting daily targets or risk limits.',
    },
    {
      title: lang === 'es' ? '2. Operar Cuentas Reales y Fondeadas' : '2. Trading Live & Funded Accounts',
      profile: lang === 'es' ? 'Traders con Capital Propio o Cuenta Activa' : 'Live Capital & Funded Traders',
      benefit: lang === 'es' ? 'Ejecución Consistente 100% Automática' : '100% Automated Consistent Execution',
      botRecommended: 'DeltaMomentum Breakout',
      icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
      text:
        lang === 'es'
          ? 'Para traders que ya cuentan con una cuenta fondeada o capital real propio y desean delegar la ejecución al algoritmo para mantener una gestión de riesgo estricta todos los días.'
          : 'For traders who already hold a funded account or personal live capital and want to delegate execution to the algorithm to maintain strict daily risk management.',
    },
    {
      title: lang === 'es' ? '3. Estudiantes y Personas sin Tiempo' : '3. Students & Busy Professionals',
      profile: lang === 'es' ? 'Alumnos de la Academia y Público General' : 'Academy Students & General Public',
      benefit: lang === 'es' ? 'Opera sin Estar Pegado al Monitor' : 'Trade Without Staring at Charts',
      botRecommended: 'VWAPReversion Institutional',
      icon: <Users className="h-5 w-5 text-sky-400" />,
      text:
        lang === 'es'
          ? 'Tanto si eres alumno de Trading Life Academy como si tienes un trabajo a tiempo completo, puedes suscribirte, activar el bot en tu sesión y supervisarlo desde tu teléfono móvil.'
          : 'Whether you are a Trading Life Academy student or work a full-time job, you can subscribe, activate the bot for the session, and supervise it right from your mobile phone.',
    },
  ];

  return (
    <section id="social-proof" className="py-20 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl space-y-3">
            <Badge variant="emerald">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              {lang === 'es' ? 'Para Estudiantes y Cualquier Trader' : 'For Students & Any Trader'}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'es' ? (
                <>
                  ¿Para Quiénes Están Diseñados Nuestros{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Bots de Trading por Suscripción?
                  </span>
                </>
              ) : (
                <>
                  Who Are Our{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Subscription Trading Bots Built For?
                  </span>
                </>
              )}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {lang === 'es'
                ? 'Nuestras suscripciones están abiertas a todo el público. Ya sea que estés iniciando en la academia, buscando aprobar una cuenta de fondeo o gestionando tu propia cuenta real.'
                : 'Our subscriptions are open to everyone. Whether you are learning at the academy, working to pass a funded evaluation, or managing your own live account.'}
            </p>
          </div>

          <Link to="/catalog">
            <Button variant="secondary" size="md" className="shrink-0 text-xs">
              {lang === 'es' ? 'Ver Bots Disponibles' : 'View Available Bots'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* 3 Perfiles de Uso Claros y Vendedores */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {useCases.map((item, idx) => (
            <Card
              key={idx}
              className="p-6 border-slate-800 bg-slate-900/90 flex flex-col justify-between space-y-5 hover:border-amber-500/40 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 shadow-md">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.profile}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-[10px] font-semibold uppercase text-slate-400">
                    {lang === 'es' ? 'Ventaja Principal' : 'Key Advantage'}
                  </div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {item.benefit}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{lang === 'es' ? 'Bot recomendado:' : 'Recommended bot:'}</span>
                    <span className="font-mono text-amber-300">{item.botRecommended}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.text}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  {lang === 'es'
                    ? 'Incluye guía de instalación y soporte técnico'
                    : 'Includes setup guide & technical support'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
