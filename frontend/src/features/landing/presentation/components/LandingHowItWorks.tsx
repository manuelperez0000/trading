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
      title: lang === 'es' ? 'Suscríbete al Plan o Bot de tu Elección' : 'Subscribe to Your Chosen Plan or Bot',
      desc:
        lang === 'es'
          ? 'Elige una licencia individual o la Suite Completa de Bots. No necesitas ser alumno previo de la academia: cualquier persona puede suscribirse y recibir su clave de licencia al instante.'
          : 'Pick a single bot license or the Full Bot Suite. No prior academy enrollment is required: anyone can subscribe and receive their license key immediately.',
      icon: <Bot className="h-6 w-6 text-amber-400" />,
      detail: lang === 'es' ? 'Activación inmediata 24/7' : 'Instant 24/7 license delivery',
    },
    {
      num: '02',
      title: lang === 'es' ? 'Descarga e Instala el Bot en Minutos' : 'Download & Install the Bot in Minutes',
      desc:
        lang === 'es'
          ? 'Descarga el paquete instalador (.zip) desde tu área de miembro, impórtalo en tu plataforma de futuros en Windows o VPS y pega tu clave de licencia.'
          : 'Download the installer package (.zip) from your member portal, import it into your Windows or VPS futures terminal, and paste your license key.',
      icon: <Download className="h-6 w-6 text-sky-400" />,
      detail: lang === 'es' ? 'Sin programar ni tocar código' : 'Zero coding or programming required',
    },
    {
      num: '03',
      title: lang === 'es' ? 'Actívalo en tu Cuenta de Fondeo o Cuenta Real' : 'Run It on Your Funded or Live Account',
      desc:
        lang === 'es'
          ? 'Selecciona tu cuenta de evaluación de fondeo o tu cuenta real, define tu tope de pérdida diaria y deja que el bot opere con disciplina automática mientras lo supervisas desde la web.'
          : 'Select your funded evaluation account or live personal account, set your daily loss limit, and let the bot execute with automated discipline while you supervise from the web.',
      icon: <PlayCircle className="h-6 w-6 text-emerald-400" />,
      detail: lang === 'es' ? 'Operativa automática y control remoto' : 'Automated execution & remote control',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 relative bg-slate-900/30 border-y border-slate-800/80">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="emerald">
            {lang === 'es' ? 'Instalación Rápida Sin Código' : 'Fast Zero-Code Setup'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                De la Suscripción a Operar en Automático en{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  3 Pasos Simples
                </span>
              </>
            ) : (
              <>
                From Subscription to Automated Trading in{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  3 Simple Steps
                </span>
              </>
            )}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {lang === 'es'
              ? 'Diseñado para que tanto traders experimentados como personas sin conocimientos de programación puedan poner su bot en marcha en menos de 5 minutos.'
              : 'Engineered so both experienced traders and users with zero coding knowledge can get their bot up and running in under 5 minutes.'}
          </p>
        </div>

        {/* Pasos en 3 Columnas */}
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
              {lang === 'es' ? 'Elegir mi Bot y Suscribirme Ahora' : 'Choose My Bot & Subscribe Now'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
