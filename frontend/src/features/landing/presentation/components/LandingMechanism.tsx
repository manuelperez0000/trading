import React from 'react';
import {
  CheckCircle2,
  Layers,
  Lock,
  PowerOff,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingMechanism: React.FC = () => {
  const { lang } = useI18n();

  const mechanisms = [
    {
      title: lang === 'es' ? 'Ejecución Automática por Order Flow L2' : 'Automated Level 2 Order Flow Execution',
      subtitle: lang === 'es' ? 'Sin indicadores lentos ni emociones' : 'Zero lagging indicators or emotions',
      desc:
        lang === 'es'
          ? 'El bot detecta en tiempo real desequilibrios diagonales de volumen (Imbalance Ratio 3.5x) y absorciones institucionales, abriendo y gestionando las órdenes con Stop Loss y Trailing Stop automáticos.'
          : 'The bot detects real-time diagonal volume imbalances (3.5x ratio) and institutional absorptions, opening and managing orders with automated Stop Loss and Trailing Stop.',
      icon: <Layers className="h-6 w-6 text-amber-400" />,
      tag: 'Order Flow L2',
    },
    {
      title: lang === 'es' ? 'Apagado y Pausa Remota desde tu Móvil' : 'Mobile Remote Pause & Control',
      subtitle: lang === 'es' ? 'Control total sin estar frente a la PC' : 'Full control away from your desk',
      desc:
        lang === 'es'
          ? '¿Saliste de casa o se acerca una noticia fuerte? Desde tu panel web en Trading Life Academy puedes pausar o reactivar tu bot en 1 clic desde cualquier teléfono o navegador.'
          : 'Stepping away or facing major market news? From your Trading Life Academy web panel you can pause or resume your bot with 1 click from any phone or browser.',
      icon: <PowerOff className="h-6 w-6 text-rose-400" />,
      tag: 'Remote Web Sync',
    },
    {
      title: lang === 'es' ? 'Software en Tu Propia Cuenta (Non-Custodial)' : 'Runs on Your Own Account (Non-Custodial)',
      subtitle: lang === 'es' ? 'Tú mantienes el 100% del control' : 'You keep 100% control of your account',
      desc:
        lang === 'es'
          ? 'Con tu suscripción recibes tu clave de licencia para instalar el bot directamente en tu equipo o VPS. Operas en tu propia cuenta de fondeo o cuenta real sin entregar jamás tu capital ni tus contraseñas a terceros.'
          : 'With your subscription you receive a license key to install the bot directly on your PC or VPS. You trade on your own funded or live account without ever handing over capital or passwords.',
      icon: <Lock className="h-6 w-6 text-emerald-400" />,
      tag: '100% Non-Custodial',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="amber">
            {lang === 'es' ? 'Tecnología de Automatización' : 'Automation Technology'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Por Qué Nuestros Bots Marcan la Diferencia en{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Cuentas de Fondeo y Cuentas Reales
                </span>
              </>
            ) : (
              <>
                Why Our Bots Make the Difference on{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Funded & Live Accounts
                </span>
              </>
            )}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {lang === 'es'
              ? 'Combinamos velocidad de ejecución cuantitativa con reglas estrictas de preservación de capital, diseñadas para traders que buscan resultados consistentes sin desgaste emocional.'
              : 'We combine quantitative execution speed with strict capital preservation rules, engineered for traders seeking consistent execution without emotional burnout.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {mechanisms.map((item, index) => (
            <Card
              key={index}
              className="p-8 border-slate-800 bg-slate-900/80 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
                    {item.icon}
                  </div>
                  <Badge variant="slate" className="font-mono text-[10px]">
                    {item.tag}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <div className="text-xs font-semibold text-amber-400 mt-0.5">
                    {item.subtitle}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>C# Automated Execution Engine</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
