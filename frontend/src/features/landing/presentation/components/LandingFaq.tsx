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
          ? '¿Necesito saber programar o compilar código para usar los bots?'
          : 'Do I need programming skills or C# coding experience?',
      a:
        lang === 'es'
          ? 'No, absolutamente nada. Todos los algoritmos se entregan pre-compilados en paquetes oficiales de Add-On para NinjaTrader 8 (.zip). Solo debes importarlo desde el menú Tools -> Import en NinjaTrader 8 e introducir tu clave de licencia para empezar.'
          : 'No, absolutely not. All strategies come pre-compiled in ready-to-run NinjaTrader 8 Add-On packages (.zip). You simply import the file through Tools -> Import in NinjaTrader 8, enter your license key, and you are ready to go.',
    },
    {
      q:
        lang === 'es'
          ? '¿Están permitidos estos bots en empresas de fondeo (Apex, Topstep, etc.)?'
          : 'Are automated bots allowed on prop firms like Apex and Topstep?',
      a:
        lang === 'es'
          ? 'Sí. Las principales empresas de fondeo de futuros permiten trading algorítmico en NinjaTrader 8 siempre y cuando se respeten sus reglas de riesgo. Nuestros bots cuentan con Hard-Stop de Drawdown Diario y liquidación obligatoria antes del cierre de mercado para blindar tu cuenta.'
          : 'Yes. Major futures prop firms explicitly allow NinjaScript automation as long as risk rules are obeyed. Our algorithms feature strict daily loss limit stops and auto-flattening before market close to keep you 100% compliant.',
    },
    {
      q:
        lang === 'es'
          ? '¿Puedo ejecutar los bots en un VPS o en mi PC habitual?'
          : 'Can I run the bots on a VPS or on my personal computer?',
      a:
        lang === 'es'
          ? 'Puedes correrlos en cualquier máquina con Windows 10/11 y NinjaTrader 8 de 64 bits. Recomendamos un VPS si deseas que los bots operen sin depender de cortes de luz o de la conexión de tu hogar, pero funcionan idénticamente en tu PC personal.'
          : 'You can run them on any machine running 64-bit Windows 10/11 with NinjaTrader 8. A VPS is recommended for 24/5 uptime without residential internet drops, but they work flawlessly on your home desktop as well.',
    },
    {
      q:
        lang === 'es'
          ? '¿Qué sucede si cambio de computadora o formateo mi Windows?'
          : 'What happens if I change computers or re-install Windows?',
      a:
        lang === 'es'
          ? 'No hay problema. Desde tu Portal del Trader en la sección "Mis Suscripciones / Licencias" tienes un botón para Desvincular PC (Reset HWID) que libera tu licencia inmediatamente para que puedas registrar tu nueva máquina sin costo adicional ni esperas.'
          : 'No problem at all. Inside your Trader Portal under "My Licenses", you have an instant "Unbind PC" (HWID Reset) button that releases your license key so you can bind your new machine immediately with no support delays.',
    },
    {
      q:
        lang === 'es'
          ? '¿Qué mercados e instrumentos operan los algoritmos de TLA?'
          : 'Which futures instruments and markets do the bots trade?',
      a:
        lang === 'es'
          ? 'Están optimizados para los contratos de futuros con mayor liquidez y volumen institucional del CME Group: E-mini Nasdaq (NQ), Micro Nasdaq (MNQ), E-mini S&P 500 (ES), Futuros de Oro (GC) y Petróleo Crudo (CL).'
          : 'They are optimized for the highest-liquidity institutional contracts on the CME Group: E-mini Nasdaq (NQ), Micro E-mini Nasdaq (MNQ), E-mini S&P 500 (ES), Gold Futures (GC), and Crude Oil (CL).',
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
                Todo lo que Necesitas Saber Sobre los{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Bots de Trading Life Academy
                </span>
              </>
            ) : (
              <>
                Everything You Need to Know About{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Trading Life Academy Bots
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
