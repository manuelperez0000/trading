import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Download, PlayCircle, Sparkles } from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingHowItWorks: React.FC = () => {
  const { lang } = useI18n();

  const steps = [
    {
      num: '01',
      title: lang === 'es' ? 'Elige tu Bot en el Catálogo' : 'Select Your Bot from the Catalog',
      desc:
        lang === 'es'
          ? 'Explora las métricas de rendimiento certificadas, requisitos de capital y mercados (NQ, ES, GC) para elegir la estrategia ideal para tu cuenta.'
          : 'Review certified performance metrics, capital requirements, and instruments (NQ, ES, GC) to pick the perfect bot for your prop account.',
      icon: <Bot className="h-6 w-6 text-amber-400" />,
      detail: lang === 'es' ? 'Licencia generada al instante' : 'Instant automated key delivery',
    },
    {
      num: '02',
      title: lang === 'es' ? 'Descarga e Importa en NinjaTrader 8' : 'Download & Import into NinjaTrader 8',
      desc:
        lang === 'es'
          ? 'Descarga el paquete Add-On oficial (.zip) desde tu panel web. En NinjaTrader 8 ve a Tools -> Import -> NinjaScript Add-On e introduce tu clave de licencia.'
          : 'Download the official Add-On (.zip) package from your web portal. In NinjaTrader 8 navigate to Tools -> Import -> NinjaScript Add-On and paste your key.',
      icon: <Download className="h-6 w-6 text-sky-400" />,
      detail: lang === 'es' ? 'Instalación en menos de 2 minutos' : 'Setup completed in under 2 minutes',
    },
    {
      num: '03',
      title: lang === 'es' ? 'Activa y Monitorea en la Nube' : 'Enable Strategy & Monitor Live',
      desc:
        lang === 'es'
          ? 'Habilita el bot en tu cuenta de fondeo o simulación. Supervisa los balances, operaciones y control de apagado remoto desde cualquier navegador o teléfono móvil.'
          : 'Enable the bot on your funded or live account. Supervise equity curves, trades, and remote kill-switch controls from any desktop or mobile browser.',
      icon: <PlayCircle className="h-6 w-6 text-emerald-400" />,
      detail: lang === 'es' ? 'Control total y telemetría 24/7' : 'Full cloud control & 24/7 telemetry',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 relative bg-slate-900/30 border-y border-slate-800/80">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="emerald">
            {lang === 'es' ? 'Fácil de Implementar' : 'Zero Code Required'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                De la Suscripción a Operar en Vivo en{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Menos de 5 Minutos
                </span>
              </>
            ) : (
              <>
                From Registration to Live Trading in{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Under 5 Minutes
                </span>
              </>
            )}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {lang === 'es'
              ? 'Sin necesidad de programar ni compilar código en C#. Todo el sistema está paquetizado y listo para correr en tu terminal de NinjaTrader 8.'
              : 'No coding or C# programming required. The entire ecosystem is pre-compiled, tested, and plug-and-play for your NinjaTrader 8 terminal.'}
          </p>
        </div>

        {/* Pasos en 3 Columnas con Conectores */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
          {steps.map((st, i) => (
            <Card
              key={i}
              className="p-8 border-slate-800 bg-slate-900/90 relative overflow-hidden flex flex-col justify-between space-y-6 hover:border-amber-500/40 transition-all"
            >
              <div className="absolute top-4 right-4 text-4xl font-black font-mono text-slate-800/80 select-none">
                {st.num}
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
                  {st.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{st.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{st.desc}</p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex items-center gap-2 text-[11px] font-mono text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{st.detail}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/catalog">
            <Button variant="primary" size="lg" className="shadow-lg shadow-amber-500/20">
              <Bot className="h-4 w-4" />
              {lang === 'es' ? 'Comenzar Paso 1: Explorar Catálogo' : 'Start Step 1: Browse Catalog'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
