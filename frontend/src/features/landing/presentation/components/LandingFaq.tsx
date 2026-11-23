import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Card } from '@shared/ui/Card';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingFaq: React.FC = () => {
  const { lang } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q:
        lang === 'es'
          ? '¿Necesito ser estudiante de Trading Life Academy para comprar o suscribirme a un bot?'
          : 'Do I need to be a Trading Life Academy student to subscribe to a bot?',
      a:
        lang === 'es'
          ? 'No. Nuestras suscripciones de bots están abiertas tanto para los alumnos de la academia como para cualquier trader o persona externa que desee automatizar su operativa. Recibes acceso inmediato al instalador, a tu clave de licencia y al video-tutorial paso a paso.'
          : 'No. Our bot subscriptions are open to both academy students and any independent trader or individual who wants to automate their trading. You receive instant access to the installer, your license key, and the step-by-step video guide.',
    },
    {
      q:
        lang === 'es'
          ? '¿Los bots están configurados para las empresas de fondeo Lucid Trading, My Funded Futures (MFFU) y Tradeify, además de cuentas reales?'
          : 'Are the bots configured for Lucid Trading, My Funded Futures (MFFU), and Tradeify funding evaluations as well as live accounts?',
      a:
        lang === 'es'
          ? 'Sí. Nuestros bots incluyen plantillas de gestión de riesgo preconfiguradas para adaptarse a los parámetros técnicos exigidos en evaluaciones y cuentas fondeadas de Lucid Trading, My Funded Futures (MFFU) y Tradeify (límite de pérdida diaria, trailing drawdown y cierre antes de fin de sesión), además de poder utilizarse en cualquier cuenta real de capital propio.'
          : 'Yes. Our bots include pre-configured risk management templates tailored to the technical parameters required in Lucid Trading, My Funded Futures (MFFU), and Tradeify evaluations and funded accounts (daily loss limit, trailing drawdown, and end-of-session close), and can also run on any personal live account.',
    },
    {
      q:
        lang === 'es'
          ? '¿Debo entregar mi capital o las contraseñas de mi broker para usar el bot?'
          : 'Do I have to hand over my capital or my broker passwords to use the bot?',
      a:
        lang === 'es'
          ? 'Jamás. Nuestro modelo es 100% Software en Tu Propia Cuenta (SaaS Non-Custodial). Tú descargas el bot y lo instalas directamente en tu computadora o VPS. Trading Life Academy nunca capta dinero de inversión ni solicita contraseñas de tus cuentas de broker.'
          : 'Never. Our model is 100% Non-Custodial SaaS. You download the bot and install it directly on your own computer or VPS. Trading Life Academy never accepts investment capital and never asks for your broker account passwords.',
    },
    {
      q:
        lang === 'es'
          ? '¿Cómo evita el bot que se queme mi cuenta de fondeo o mi cuenta real?'
          : 'How does the bot protect my funded evaluation or live account from blowing up?',
      a:
        lang === 'es'
          ? 'Cada bot incluye un Freno Automático de Pérdida Diaria (Hard Daily Stop) y liquidación obligatoria antes del cierre de sesión. Si el mercado presenta un día adverso y alcanza tu límite diario configurado, el bot cierra la posición y bloquea nuevas entradas hasta la siguiente sesión.'
          : 'Every bot includes an Automated Daily Loss Hard-Stop and mandatory end-of-session flattening. If the market has an adverse day and hits your configured daily limit, the bot closes positions and locks new entries until the next session.',
    },
    {
      q:
        lang === 'es'
          ? '¿Necesito saber programar y qué pasa si cambio de computadora o VPS?'
          : 'Do I need coding skills, and what happens if I switch my PC or VPS?',
      a:
        lang === 'es'
          ? 'No necesitas saber programar nada; el bot viene listo para importar en menos de 5 minutos. Además, si cambias de PC o contratas un VPS, desde tu panel en "Mis Licencias" puedes desvincular tu equipo anterior (Reset HWID) en 1 clic sin costo adicional.'
          : 'Zero coding skills are required; the bot comes ready to import in under 5 minutes. Plus, if you change your PC or move to a VPS, you can unbind your previous machine (HWID Reset) in 1 click from your "My Licenses" panel at no extra cost.',
    },
  ];

  return (
    <section id="faq" className="py-20 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-14">
          <Badge variant="slate">
            <HelpCircle className="h-3.5 w-3.5 mr-1 text-amber-400" />
            {lang === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Resolvemos tus Dudas Sobre la{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Suscripción a Nuestros Bots
                </span>
              </>
            ) : (
              <>
                Answers to Your Questions About{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Our Bot Subscriptions
                </span>
              </>
            )}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Card
                key={i}
                className="border-slate-800 bg-slate-900/80 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-bold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
