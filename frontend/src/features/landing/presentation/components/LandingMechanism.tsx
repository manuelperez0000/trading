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
      title: lang === 'es' ? 'Motor de Order Flow y Footprint L2' : 'Level 2 Order Flow & Footprint Engine',
      subtitle: lang === 'es' ? 'Sin indicadores rezagados' : 'Zero lagging indicators',
      desc:
        lang === 'es'
          ? 'Nuestros bots no usan medias móviles obsoletas. Analizan desequilibrios diagonales de volumen (Imbalance Ratio 3.5x) y trampas de absorción institucional en máximos y mínimos de sesión en NinjaTrader 8.'
          : 'Our bots do not rely on lagging indicators. They compute real-time diagonal volume imbalances (3.5x ratio) and institutional absorption traps at key session highs and lows in NinjaTrader 8.',
      icon: <Layers className="h-6 w-6 text-amber-400" />,
      tag: 'Tick-Replay L2',
    },
    {
      title: lang === 'es' ? 'Kill-Switch Remoto en la Nube' : 'Cloud Remote Kill-Switch',
      subtitle: lang === 'es' ? 'Control total desde tu teléfono o web' : 'Full control from mobile or web',
      desc:
        lang === 'es'
          ? '¿Vas a salir de casa o el mercado tiene alta volatilidad? Puedes apagar o encender cualquiera de tus bots desde el panel web en 1 clic. El terminal NinjaTrader 8 confirma el apagado en su siguiente ciclo de polling.'
          : 'Stepping away or facing unexpected news volatility? Toggle your bots on or off from the web panel with 1 click. The NinjaTrader terminal acknowledges and terminates execution on the next poll cycle.',
      icon: <PowerOff className="h-6 w-6 text-rose-400" />,
      tag: 'Zero Latency Web Polling',
    },
    {
      title: lang === 'es' ? 'Seguridad Criptográfica HMAC & HWID' : 'HMAC & Machine ID Security',
      subtitle: lang === 'es' ? 'Protección institucional de licencia' : 'Institutional license armor',
      desc:
        lang === 'es'
          ? 'Cada solicitud entre tu PC y la nube se firma con HMAC-SHA256 y queda anclada a la huella digital física de tu procesador (Machine ID). Puedes desvincular y cambiar de PC en cualquier momento desde tu perfil.'
          : 'Every handshake between your PC and the cloud is cryptographically signed via HMAC-SHA256 and locked to your unique hardware Machine ID, preventing unauthorized hijacking.',
      icon: <Lock className="h-6 w-6 text-emerald-400" />,
      tag: 'HMAC-SHA256 Sealed',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="amber">
            {lang === 'es' ? 'Ventaja Cuantitativa' : 'Quantitative Edge'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Por Qué los Bots de TLA Superan a los{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Indicadores Convencionales
                </span>
              </>
            ) : (
              <>
                Why TLA Bots Outperform{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Conventional Retail Indicators
                </span>
              </>
            )}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {lang === 'es'
              ? 'El 95% de los sistemas comerciales venden plantillas decorativas. En Trading Life Academy desarrollamos infraestructura cuantitativa de grado institucional en C# para NinjaTrader 8.'
              : '95% of commercial tools sell decorative chart templates. At Trading Life Academy, we engineer institutional-grade quantitative C# infrastructure for NinjaTrader 8.'}
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
                <span>NinjaTrader 8 Core Framework</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
